import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../../services/authService';
import type { Me } from './types';

interface AuthState {
  me: Me | null;
  /** True until the first session restore finished (avoids a login flash on reload). */
  loading: boolean;
  /** Runs a login step (password or code) and loads /me/. Throws the API error for the form to display. */
  signIn: (step: () => Promise<void>) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    authService.restore().then((m) => {
      if (alive) {
        setMe(m);
        setLoading(false);
      }
    });
    const expired = () => setMe(null);
    window.addEventListener('maqraa:session-expired', expired);
    return () => {
      alive = false;
      window.removeEventListener('maqraa:session-expired', expired);
    };
  }, []);

  const signIn = useCallback(async (step: () => Promise<void>) => {
    await step();
    setMe(await authService.me());
  }, []);

  const signOut = useCallback(async () => {
    await authService.logout();
    setMe(null);
  }, []);

  const value = useMemo(() => ({ me, loading, signIn, signOut }), [me, loading, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthState => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
