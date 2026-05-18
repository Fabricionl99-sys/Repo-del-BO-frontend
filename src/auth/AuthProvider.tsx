import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

import { loginWithCredentials, refreshSession } from '@/api/authSession';
import { env } from '@/config/env';
import { FullPageLoader } from '@/components/ui/Loading';
import { mockLogin } from '@/mocks/data/auth';
import { useAuthStore } from '@/stores/authStore';
import { useOperatorStore } from '@/stores/operatorStore';
import type { User } from '@/types/shared';

export interface LoginResult {
  user: User;
  accessToken: string;
  refreshToken: string;
  operators: User['operators'];
}

interface AuthContextValue {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, setAuth, clearAuth } = useAuthStore();
  const setAvailable = useOperatorStore((s) => s.setAvailable);
  const setCurrent = useOperatorStore((s) => s.setCurrent);
  const [boot, setBoot] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const refreshToken = localStorage.getItem('niveles_refresh_token');
      if (!refreshToken) {
        setBoot(false);
        return;
      }

      try {
        if (env.useMocks) {
          if (!cancelled) {
            setAuth(mockLogin.user, mockLogin.accessToken, mockLogin.refreshToken);
            setAvailable(mockLogin.operators);
            setCurrent(mockLogin.operators[0]);
          }
          return;
        }

        const session = await refreshSession(refreshToken);
        if (cancelled) return;
        setAuth(session.user, session.accessToken, session.refreshToken);
        setAvailable(session.operators);
        setCurrent(session.operators[0] ?? null);
      } catch {
        if (!cancelled) clearAuth();
      } finally {
        if (!cancelled) setBoot(false);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [setAuth, setAvailable, setCurrent, clearAuth]);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    if (env.useMocks) {
      await new Promise((r) => setTimeout(r, 350));
      if (!email.includes('@') || password.length < 8) throw new Error('Credenciales inválidas');
      setAuth(mockLogin.user, mockLogin.accessToken, mockLogin.refreshToken);
      setAvailable(mockLogin.operators);
      setCurrent(mockLogin.operators[0]);
      return mockLogin;
    }

    const session = await loginWithCredentials(email, password);
    setAuth(session.user, session.accessToken, session.refreshToken);
    setAvailable(session.operators);
    setCurrent(session.operators[0] ?? null);
    return session;
  };

  const logout = () => {
    clearAuth();
  };

  if (boot) return <FullPageLoader />;

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
