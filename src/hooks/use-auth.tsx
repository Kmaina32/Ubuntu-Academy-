
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
import { RegisteredUser, saveUser, getUserById, createOrganization } from '@/lib/firebase-service';
import { ref, onValue, onDisconnect, set, serverTimestamp, update } from 'firebase/database';
import { useToast } from './use-toast';

const ADMIN_UID = 'YlyqSWedlPfEqI9LlGzjN7zlRtC2';

interface AuthContextType {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isOrganizationAdmin: boolean;
  login: (email: string, pass: string) => Promise<any>;
  signup: (email: string, pass: string, name: string, organizationName?: string) => Promise<any>;
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
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsSuperAdmin(user?.uid === ADMIN_UID);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
        setIsAdmin(false);
        setIsOrganizationAdmin(false);
        return;
    }
    
    // Hardcoded for development: Treat gmaina424@gmail.com as an org admin
    if (user.email === 'gmaina424@gmail.com') {
        setIsOrganizationAdmin(true);
    }
    
    setIsSuperAdmin(user.uid === ADMIN_UID);

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
    const unsubscribeAdminCheck = onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
            const userProfile = snapshot.val();
            if (userProfile.isAdmin) {
                if (userProfile.adminExpiresAt) {
                    const expirationDate = new Date(userProfile.adminExpiresAt);
                    setIsAdmin(expirationDate > new Date());
                } else {
                    setIsAdmin(true);
                }
            } else {
                setIsAdmin(false);
            }
            if (userProfile.isOrganizationAdmin) {
                setIsOrganizationAdmin(true);
            }
        } else {
            setIsAdmin(false);
            // Don't reset org admin here if it was set by the hardcoded check
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

  const signup = async (email: string, pass: string, displayName: string, organizationName?: string) => {
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
        const orgId = await createOrganization({
            name: organizationName,
            ownerId: userCredential.user.uid,
            createdAt: new Date().toISOString(),
        });
        newUser.organizationId = orgId;
        newUser.isOrganizationAdmin = true;
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
        const newUser: Omit<RegisteredUser, 'uid'> = {
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
    loading,
    isAdmin,
    isSuperAdmin,
    isOrganizationAdmin,
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
