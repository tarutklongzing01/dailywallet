import { createContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase-config';
import { bootstrapUserAccount, subscribeToUserProfile } from '../services/profileService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, async (nextUser) => {
      setLoading(true);
      unsubscribeProfile();

      if (!nextUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setUser(nextUser);

      try {
        await bootstrapUserAccount(nextUser);
      } catch (error) {
        console.error('bootstrapUserAccount failed', error);
      }

      unsubscribeProfile = subscribeToUserProfile(
        nextUser.uid,
        (nextProfile) => {
          setProfile(nextProfile);
          setLoading(false);
        },
        (error) => {
          console.error('subscribeToUserProfile failed', error);
          setLoading(false);
        },
      );
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProfile();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
