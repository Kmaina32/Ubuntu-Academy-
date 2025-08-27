
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
import { RegisteredUser, saveUser, getUserById } from '@/lib/firebase-service';
import { ref, onValue } from 'firebase/database';

const ADMIN_UID = 'YlyqSWedlPfEqI9LlGzjN7zlRtC2';

interface AuthContextType {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<any>;
  signup: (email: string, pass: string, name: string) => Promise<any>;
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
        setIsAdmin(false);
        return;
    }
    
    // Listen for real-time changes to the user's record in the database
    const userRef = ref(db, `users/${user.uid}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
        if (user.uid === ADMIN_UID) {
            setIsAdmin(true);
            return;
        }

        if (snapshot.exists()) {
            const userProfile = snapshot.val();
            if (userProfile.isAdmin) {
                if (userProfile.adminExpiresAt) {
                    const expirationDate = new Date(userProfile.adminExpiresAt);
                    setIsAdmin(expirationDate > new Date());
                } else {
                    setIsAdmin(true); // Permanent admin
                }
            } else {
                setIsAdmin(false);
            }
        } else {
            setIsAdmin(false);
        }
    });

    // Cleanup the listener when the user changes or component unmounts
    return () => unsubscribe();

  }, [user]);

  const login = (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  };

  const signup = async (email: string, pass: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      pass
    );
    
    // First, update the user's profile in Firebase Auth
    await updateProfile(userCredential.user, {
      displayName: displayName,
    });

    // Now that the profile is updated, create the object for our DB
    const newUser: Omit<RegisteredUser, 'uid'> = {
      email: userCredential.user.email,
      displayName: displayName,
      createdAt: userCredential.user.metadata.creationTime,
    };

    // Save the complete user object to the Realtime Database
    await saveUser(userCredential.user.uid, newUser);

    // Send verification email
    await sendEmailVerification(userCredential.user);
    
    // Manually update the local user state to reflect the displayName immediately
    await userCredential.user.reload();
    setUser(auth.currentUser);
    
    return userCredential;
  };
  
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user exists in our database
      const dbUser = await getUserById(user.uid);
      
      if (!dbUser) {
        // If user is new, save to database
        const newUser: Omit<RegisteredUser, 'uid'> = {
          email: user.email,
          displayName: user.displayName,
          createdAt: user.metadata.creationTime,
        };
        await saveUser(user.uid, newUser);
      }
      setUser(user);
    } catch (error) {
      console.error("Google Sign-In Error", error);
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
