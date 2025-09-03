

'use client';

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
  Dispatch,
  SetStateAction,
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
  setUser: Dispatch<SetStateAction<User | null>>;
  members: RegisteredUser[];
  setMembers: Dispatch<SetStateAction<RegisteredUser[]>>;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isOrganizationAdmin: boolean;
  organization: Organization | null;
  login: (email: string, pass: string) => Promise<any>;
  signup: (email: string, pass: string, name: string, organizationName?: string, inviteOrgId?: string) => Promise<any>;
  logout: () => Promise<any>;
  sendPasswordReset: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isOrganizationAdmin, setIsOrganizationAdmin] = useState(false);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<RegisteredUser[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      const isSuper = user?.uid === ADMIN_UID;
      setIsSuperAdmin(isSuper);
      if(isSuper) setIsAdmin(true); // Super admin is always an admin
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
        setIsAdmin(false);
        setIsOrganizationAdmin(false);
        setOrganization(null);
        setMembers([]);
        return;
    }
    
    const isSuper = user.uid === ADMIN_UID;
    setIsSuperAdmin(isSuper);

    const userStatusRef = ref(db, `/users/${user.uid}`);
    
    const connectedRef = ref(db, '.info/connected');
    const unsubscribePresence = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        update(userStatusRef, { isOnline: true });
        
        onDisconnect(userStatusRef).update({
          isOnline: false,
          lastSeen: serverTimestamp(),
        });
      }
    });

    const userRef = ref(db, `users/${user.uid}`);
    const unsubscribeAdminCheck = onValue(userRef, async (snapshot) => {
        if (snapshot.exists()) {
            const userProfile = snapshot.val() as RegisteredUser;
            const currentIsAdmin = userProfile.isAdmin && (!userProfile.adminExpiresAt || new Date(userProfile.adminExpiresAt) > new Date());
            setIsAdmin(isSuper || currentIsAdmin);
            
            // This is the specific logic for Organization Admin role
            setIsOrganizationAdmin(userProfile.isOrganizationAdmin || false);

            let currentOrgId: string | undefined = userProfile.organizationId;

            if (isSuper) {
                 let saOrg = await getOrganizationByOwnerId(user.uid);
                 if (!saOrg) {
                    const orgId = await createOrganization({
                        name: SUPER_ADMIN_ORG_NAME,
                        ownerId: user.uid,
                        createdAt: new Date().toISOString(),
                        subscriptionTier: 'pro',
                        subscriptionExpiresAt: null, // Permanent
                        memberLimit: 999
                    });
                    saOrg = { id: orgId, name: SUPER_ADMIN_ORG_NAME, ownerId: user.uid, createdAt: new Date().toISOString(), subscriptionTier: 'pro', subscriptionExpiresAt: null, memberLimit: 999 };
                 }
                 setOrganization(saOrg);
                 currentOrgId = saOrg.id;
            } else if (userProfile.organizationId) {
                const orgData = await getOrganizationByOwnerId(userProfile.organizationId);
                setOrganization(orgData);
            } else {
                setOrganization(null);
            }

            if(currentOrgId) {
              const orgMembers = await getOrganizationMembers(currentOrgId);
              setMembers(orgMembers);
            }
        } else {
            setIsAdmin(false);
            setIsOrganizationAdmin(false);
            setOrganization(null);
        }
    });

    return () => {
      unsubscribeAdminCheck();
      unsubscribePresence();
      if (userStatusRef) {
        update(userStatusRef, { 
            isOnline: false, 
            lastSeen: serverTimestamp() 
        });
      }
    };

  }, [user]);

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
    setUser,
    members,
    setMembers,
    loading,
    isAdmin,
    isSuperAdmin,
    isOrganizationAdmin,
    organization,
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
