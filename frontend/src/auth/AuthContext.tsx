import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/endpoints';
import { setAuthFailureHandler } from '../api/client';
import type { Role, User } from '../api/types';

interface AuthState {
  user: User | null;
  loading: boolean; // true until the initial /auth/me finishes
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export const homePath = (role: Role) => (role === 'admin' ? '/admin' : '/dashboard');
const PAGE_ROLE: Record<string, Role> = { '/admin': 'admin', '/dashboard': 'member' };

// Where to send a freshly logged-in user: the page they originally wanted (if their role
// may see it), otherwise their role's home page.
export const resolveTarget = (user: User, from?: string) =>
  from && PAGE_ROLE[from] === user.role ? from : homePath(user.role);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Session restore on page load: the cookies (if any) are sent automatically.
  useEffect(() => {
    authApi
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // If a refresh fails anywhere, drop the user; the route guards redirect to /login.
  useEffect(() => setAuthFailureHandler(() => setUser(null)), []);

  const login = useCallback(async (email: string, password: string) => {
    setUser(await authApi.login(email, password));
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
