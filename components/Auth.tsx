import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';

type AuthCtx = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string) => Promise<void>;
  signOutUser: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null, loading: true,
  signIn: async () => {}, signUp: async () => {}, signOutUser: async () => {},
});

export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() =>
    onAuthStateChanged(auth, u => { setUser(u); setLoading(false); }), []
  );

const signIn = async (email: string, pass: string): Promise<void> => {
  await signInWithEmailAndPassword(auth, email, pass);
};

const signUp = async (email: string, pass: string): Promise<void> => {
  await createUserWithEmailAndPassword(auth, email, pass);
};

const signOutUser = async (): Promise<void> => {
  await signOut(auth);
};

  return (
    <Ctx.Provider value={{ user, loading, signIn, signUp, signOutUser }}>
      {children}
    </Ctx.Provider>
  );
}