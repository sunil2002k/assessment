import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { Role } from '../api/types';
import { homePath, resolveTarget, useAuth } from './AuthContext';

const Loading = () => (
  <main className="app-shell grid min-h-screen place-items-center">
    <div className="flex flex-col items-center gap-4 text-sm font-semibold text-slate-500">
      <span className="loading loading-spinner loading-lg text-indigo-600" aria-label="Loading" />
      Loading your workspace…
    </div>
  </main>
);

// Protected pages. Waits for session restore so a reload doesn't flash a redirect.
export function RequireAuth({ role, children }: { role: Role; children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (user.role !== role) return <Navigate to="/forbidden" replace />;
  return <>{children}</>;
}

// /login: logged-in users are bounced to the page they wanted, or their home page.
export function GuestOnly({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loading />;
  if (user) return <Navigate to={resolveTarget(user, location.state?.from)} replace />;
  return <>{children}</>;
}

export function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  return <Navigate to={user ? homePath(user.role) : '/login'} replace />;
}
