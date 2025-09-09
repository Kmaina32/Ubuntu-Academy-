
'use client';

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
  Dispatch,
  SetStateAction,
  useCallback,
} from 'react';
import {
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { RegisteredUser, saveUser, getUserById, createOrganization, getOrganizationByOwnerId, Organization, getOrganizationMembers } from '@/lib/firebase-service';
import { ref, onValue, onDisconnect, set, serverTimestamp, update, get } from 'firebase/database';
import { useToast } from './use-toast';
import { add } from 'date-fns';

const ADMIN_UID = 'YlyqSWedlPfEqI9LlGzjN7zlRtC2';
const SUPER_ADMIN_ORG_NAME = "Ubuntu Academy";

interface AuthContextType {
  user: User | null;
  dbUser: RegisteredUser | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  members: RegisteredUser[];
  setMembers: Dispatch<SetStateAction<RegisteredUser[]>>;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isOrganizationAdmin: boolean;
  organization: Organization | null;
  isAiConfigured: boolean;
  login: (email: string, pass: string) => Promise<any>;
  signup: (email: string, pass: string, name: string, organizationName?: string, inviteOrgId?: string) => Promise<any>;
  logout: () => Promise<any>;
  sendPasswordReset: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children, isAiConfigured }: { children: ReactNode; isAiConfigured: boolean }) => {
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<RegisteredUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<RegisteredUser[]>([]);
  const { toast } = useToast();
  
  const isSuperAdmin = user?.uid === ADMIN_UID;
  const isAdmin = (dbUser?.isAdmin && (!dbUser.adminExpiresAt || new Date(dbUser.adminExpiresAt) > new Date())) || isSuperAdmin;
  const isOrganizationAdmin = dbUser?.isOrganizationAdmin || false;


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchUserData = useCallback(async (user: User) => {
    const userProfile = await getUserById(user.uid);
    setDbUser(userProfile);

    let orgId = userProfile?.organizationId;
    let orgData: Organization | null = null;
    
    if (user.uid === ADMIN_UID) {
        orgData = await getOrganizationByOwnerId(user.uid);
        if (!orgData) {
            const newOrgId = await createOrganization({
                name: SUPER_ADMIN_ORG_NAME,
                ownerId: user.uid,
                createdAt: new Date().toISOString(),
                subscriptionTier: 'pro',
                subscriptionExpiresAt: null,
                memberLimit: 999
            });
            orgData = { id: newOrgId, name: SUPER_ADMIN_ORG_NAME, ownerId: user.uid, createdAt: new Date().toISOString(), subscriptionTier: 'pro', subscriptionExpiresAt: null, memberLimit: 999 };
        }
    } else if (orgId) {
        const orgsRef = ref(db, `organizations/${orgId}`);
        const snapshot = await get(orgsRef);
        if(snapshot.exists()) {
            orgData = { id: orgId, ...snapshot.val() };
        }
    }
    
    setOrganization(orgData);

    if (orgData?.id) {
        const orgMembers = await getOrganizationMembers(orgData.id);
        setMembers(orgMembers);
    }

  }, []);

  useEffect(() => {
    if (user) {
      fetchUserData(user);

      // Setup presence management
      const userStatusRef = ref(db, `/users/${user.uid}`);
      const connectedRef = ref(db, '.info/connected');
      
      const presenceUnsubscribe = onValue(connectedRef, (snap) => {
        if (snap.val() === true) {
          update(userStatusRef, { isOnline: true });
          onDisconnect(userStatusRef).update({
            isOnline: false,
            lastSeen: serverTimestamp(),
          });
        }
      });

      return () => {
        presenceUnsubscribe();
      };
    } else {
      setDbUser(null);
      setOrganization(null);
      setMembers([]);
    }
  }, [user, fetchUserData]);


  const login = (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  };

  const signup = async (email: string, pass: string, displayName: string, organizationName?: string, inviteOrgId?: string) => {
    
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    if(snapshot.exists()) {
        const users = snapshot.val();
        const emailExists = Object.values(users).some((u: any) => u.email === email);
        if (emailExists) {
             throw new Error('An account with this email already exists.');
        }
    }
    
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      pass
    );
    
    await updateProfile(userCredential.user, {
      displayName: displayName,
    });

    const newUser: Partial<Omit<RegisteredUser, 'uid'>> = {
      email: userCredential.user.email,
      displayName: displayName,
      createdAt: userCredential.user.metadata.creationTime,
    };
    
    if (organizationName) {
        const trialExpiry = add(new Date(), { days: 30 }).toISOString();
        const orgId = await createOrganization({
            name: organizationName,
            ownerId: userCredential.user.uid,
            createdAt: new Date().toISOString(),
            subscriptionTier: 'trial',
            subscriptionExpiresAt: trialExpiry,
            memberLimit: 5,
        });
        newUser.organizationId = orgId;
        newUser.isOrganizationAdmin = true;
    } else if (inviteOrgId) {
        newUser.organizationId = inviteOrgId;
        newUser.isOrganizationAdmin = false;
    }

    await saveUser(userCredential.user.uid, newUser);

    await sendEmailVerification(userCredential.user);
    
    await userCredential.user.reload();
    setUser(auth.currentUser);
    
    return userCredential;
  };
  
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const dbUser = await getUserById(user.uid);
      
      if (!dbUser) {
        const newUser: Partial<RegisteredUser> = {
          email: user.email,
          displayName: user.displayName,
          createdAt: user.metadata.creationTime,
        };
        await saveUser(user.uid, newUser);
      }
      setUser(user);
    } catch (error: any) {
      console.error("Google Sign-In Error", error);
      if (error.code === 'auth/internal-error') {
          toast({
              title: "Google Sign-In Error",
              description: "Could not sign in with Google. Please ensure it is enabled in your Firebase project and the OAuth consent screen is configured.",
              variant: "destructive",
              duration: 10000,
          });
      }
      throw error;
    }
  };
  
  const sendVerificationEmail = async () => {
      if(auth.currentUser){
          await sendEmailVerification(auth.currentUser);
      } else {
          throw new Error("No user is currently signed in.");
      }
  }

  const logout = () => {
    return firebaseSignOut(auth);
  };
  
  const sendPasswordReset = (email: string) => {
    return sendPasswordResetEmail(auth, email);
  };

  const value = {
    user,
    dbUser,
    setUser,
    members,
    setMembers,
    loading,
    isAdmin,
    isSuperAdmin,
    isOrganizationAdmin,
    organization,
    isAiConfigured,
    login,
    signup,
    logout,
    sendPasswordReset,
    signInWithGoogle,
    sendVerificationEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
