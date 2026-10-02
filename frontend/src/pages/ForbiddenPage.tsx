import { Link } from "react-router-dom";

export default function ForbiddenPage() {
  return (
    <div className="app-shell grid min-h-screen place-items-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-xl shadow-slate-200/50 sm:p-10">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-amber-50 text-amber-600">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="size-8"
            aria-hidden="true"
          >
            <path
              d="M12 9v4m0 4h.01M10.3 3.86 1.82 18.5A2 2 0 0 0 3.55 21h16.9a2 2 0 0 0 1.73-2.5L13.7 3.86a2 2 0 0 0-3.46 0Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <p className="mt-6 text-sm font-bold uppercase tracking-[0.16em] text-amber-600">
          Access restricted
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
          You can’t access this page
        </h1>
        <p className="mt-3 leading-6 text-slate-500">
          Your account doesn’t have permission to view this area. Head back to
          your workspace.
        </p>
        <Link
          className="btn mt-7 border-0 bg-indigo-600 px-6 text-white hover:bg-indigo-700"
          to="/"
        >
          Go to my workspace
        </Link>
      </div>
    </div>
  );
}
