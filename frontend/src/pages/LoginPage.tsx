import { FormEvent, useState } from "react";
import { errorMessage } from "../api/errors";
import { useAuth } from "../auth/AuthContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError("");
    const v: typeof errors = {};
    if (!email.trim()) v.email = "Email is required";
    else if (!EMAIL_RE.test(email.trim())) v.email = "Invalid email";
    if (!password) v.password = "Password is required";
    setErrors(v);
    if (Object.keys(v).length) return;

    setSubmitting(true);
    try {
      await login(email.trim(), password); // GuestOnly then redirects by role / original page
    } catch (err) {
      setApiError(errorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <main className="app-shell grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between lg:p-16">
        <div className="absolute -right-36 -top-28 size-[34rem] rounded-full border border-white/10" />
        <div className="absolute -right-12 -top-4 size-[24rem] rounded-full border border-white/10" />
        <div className="absolute -bottom-48 -left-24 size-[32rem] rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="size-6"
              aria-hidden="true"
            >
              <path
                d="M4 19V9.5L12 5l8 4.5V19H4Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path
                d="M9 19v-6h6v6M8 9h.01M12 9h.01M16 9h.01"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="text-xl font-extrabold tracking-tight">
            Lead Desk
          </span>
        </div>
        <div className="relative max-w-xl py-12">
          <span className="badge badge-outline mb-6 border-indigo-300/40 bg-white/5 px-3 py-4 text-indigo-100">
            YOUR SALES, IN SYNC
          </span>
          <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight xl:text-6xl">
            Build stronger
            <br />
            customer relationships.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-indigo-100/75">
            One calm, clear place to organize your leads, follow every
            opportunity, and grow together.
          </p>
          <div className="mt-10 flex items-center gap-3 text-sm font-medium text-indigo-100/70">
            <span className="flex -space-x-2">
              <span className="grid size-9 place-items-center rounded-full border-2 border-indigo-900 bg-amber-200 text-xs font-bold text-amber-900">
                A
              </span>
              <span className="grid size-9 place-items-center rounded-full border-2 border-indigo-900 bg-emerald-200 text-xs font-bold text-emerald-900">
                M
              </span>
              <span className="grid size-9 place-items-center rounded-full border-2 border-indigo-900 bg-sky-200 text-xs font-bold text-sky-900">
                +
              </span>
            </span>
            <span>Built for focused, thoughtful teams</span>
          </div>
        </div>
        <p className="relative text-xs text-indigo-100/50">
          © 2026 Lead Desk · A better way to manage relationships
        </p>
      </section>
      <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-10">
        <form className="w-full max-w-md" onSubmit={onSubmit} noValidate>
          <div className="mb-9 lg:hidden">
            <span className="grid size-12 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="size-6"
                aria-hidden="true"
              >
                <path
                  d="M4 19V9.5L12 5l8 4.5V19H4Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 19v-6h6v6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              </svg>
            </span>
          </div>
          <div className="mb-8">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-indigo-600">
              Welcome back
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Sign in to Lead Desk
            </h2>
            <p className="mt-2 text-slate-500">
              Enter your account details to continue.
            </p>
          </div>
          <div className="space-y-5">
            <label className="form-control w-full">
              <span className="label pb-2 text-sm font-semibold text-slate-600">
                Email address
              </span>
              <input
                className={`input input-bordered h-12 w-full rounded-xl bg-white ${errors.email ? "input-error" : "focus:border-indigo-500"}`}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <span className="mt-1 text-xs font-medium text-error">
                  {errors.email}
                </span>
              )}
            </label>
            <label className="form-control w-full">
              <span className="label pb-2 text-sm font-semibold text-slate-600">
                Password
              </span>
              <div className="relative">
                <input
                  className={`input input-bordered h-12 w-full rounded-xl bg-white pr-12 ${errors.password ? "input-error" : "focus:border-indigo-500"}`}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-sm absolute right-1 top-1/2 size-10 min-h-0 -translate-y-1/2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="size-5"
                      aria-hidden="true"
                    >
                      <path
                        d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 8.5 4.5 9.5 7-.4 1-1.2 2.1-2.2 3.1M6.2 6.2C4.1 7.6 2.9 9.5 2.5 12c.6 1.5 2 3.2 4.1 4.5A9.8 9.8 0 0 0 12 18c.8 0 1.6-.1 2.3-.3"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="size-5"
                      aria-hidden="true"
                    >
                      <path
                        d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="2.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="mt-1 text-xs font-medium text-error">
                  {errors.password}
                </span>
              )}
            </label>
          </div>
          {apiError && (
            <div
              role="alert"
              className="alert alert-error mt-5 rounded-xl text-sm"
            >
              {apiError}
            </div>
          )}
          <button
            className="btn mt-7 h-12 w-full border-0 bg-indigo-600 text-base font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700"
            disabled={submitting}
          >
            {submitting && (
              <span className="loading loading-spinner loading-sm" />
            )}
            {submitting ? "Signing in…" : "Sign in"}
            {!submitting && (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="size-4"
                aria-hidden="true"
              >
                <path
                  d="M5 12h14m-6-6 6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
          <p className="mt-8 text-center text-xs text-slate-400">
            Secure sign-in protected by encrypted, httpOnly cookies.
          </p>
        </form>
      </section>
    </main>
  );
}
