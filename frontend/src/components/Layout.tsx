import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="app-shell min-h-screen">
      <header className="sticky top-0 z-20 border-b border-base-200/80 bg-white/90 backdrop-blur-xl">
        <div className="navbar mx-auto min-h-16 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex-1 gap-3">
            <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
                  <path d="M4 19V9.5L12 5l8 4.5V19H4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M9 19v-6h6v6M8 9h.01M12 9h.01M16 9h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>
              <span>
                <span className="block text-base font-extrabold leading-tight tracking-tight text-slate-900">Lead Desk</span>
                <span className="hidden text-xs font-medium text-slate-400 sm:block">Sales workspace</span>
              </span>
            </Link>
            <nav className="ml-8 hidden items-center gap-1 sm:flex" aria-label="Main navigation">
              <Link
                to={isAdmin ? '/admin' : '/dashboard'}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  pathname === (isAdmin ? '/admin' : '/dashboard')
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {isAdmin ? 'Overview' : 'My leads'}
              </Link>
              {isAdmin && (
                <a href="#users" className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-900">
                  Team
                </a>
              )}
            </nav>
          </div>
          <div className="flex-none gap-2 sm:gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-slate-800">{user?.name}</p>
              <p className="text-xs capitalize text-slate-400">{user?.role} account</p>
            </div>
            <div className="avatar placeholder">
              <div className="w-10 rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 ring-2 ring-white">
                <span>{user?.name?.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm gap-2 rounded-xl text-slate-600" onClick={logout} aria-label="Log out">
              <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
                <path d="M10 17l5-5-5-5M15 12H3m9-8h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">{children}</main>
    </div>
  );
}
