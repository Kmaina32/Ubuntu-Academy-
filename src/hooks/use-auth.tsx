
'use client';

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from 'react';
import {
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  signup: (email: string, pass: string, name: string) => Promise<any>;
  logout: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  };

  const signup = async (email: string, pass: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      pass
    );
    await updateProfile(userCredential.user, {
      displayName: name,
    });
    // Manually set user after signup to reflect name change immediately
    setUser(userCredential.user); 
    return userCredential;
  };

  const logout = () => {
    return firebaseSignOut(auth)
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
