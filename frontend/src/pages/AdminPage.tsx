import { adminApi, leadsApi } from "../api/endpoints";
import { Layout } from "../components/Layout";
import { LeadsTable } from "../components/LeadsTable";
import { useFetch } from "../hooks/useFetch";

export default function AdminPage() {
  const leads = useFetch(leadsApi.list);
  const users = useFetch(adminApi.users);
  const leadRows = leads.data ?? [];
  const userRows = users.data ?? [];
  const qualified = leadRows.filter(
    (lead) => lead.status === "qualified",
  ).length;

  return (
    <Layout>
      <div className="mb-8">
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-indigo-600">
          Workspace overview
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Good to see you, Admin
        </h1>
        <p className="mt-2 text-slate-500">
          Here’s what’s happening across your team today.
        </p>
      </div>
      <div className="mb-7 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <p className="text-sm font-semibold text-slate-500">Total leads</p>
            <span className="grid size-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="size-5"
                aria-hidden="true"
              >
                <path
                  d="M4 19V9.5L12 5l8 4.5V19H4Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 19v-6h6v6"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
              </svg>
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
            {leads.status === "loading" ? "—" : leadRows.length}
          </p>
          <p className="mt-1 text-xs text-slate-400">Across your team</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <p className="text-sm font-semibold text-slate-500">Team members</p>
            <span className="grid size-9 place-items-center rounded-xl bg-violet-50 text-violet-600">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="size-5"
                aria-hidden="true"
              >
                <path
                  d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20m6-9a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm6-7.5a4 4 0 0 1 0 7.8m4 8.7v-1.5a3.5 3.5 0 0 0-2.5-3.35"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
            {users.status === "loading" ? "—" : userRows.length}
          </p>
          <p className="mt-1 text-xs text-slate-400">Active accounts</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <p className="text-sm font-semibold text-slate-500">
              Qualified leads
            </p>
            <span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="size-5"
                aria-hidden="true"
              >
                <path
                  d="m5 12 4 4L19 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-emerald-600">
            {leads.status === "loading" ? "—" : qualified}
          </p>
          <p className="mt-1 text-xs text-slate-400">Promising opportunities</p>
        </div>
      </div>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-2 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:px-7">
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
                All leads
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Every contact and opportunity across the team.
              </p>
            </div>
            <span className="badge badge-ghost font-semibold">
              {leads.status === "loading"
                ? "Loading"
                : `${leadRows.length} total`}
            </span>
          </div>
          <LeadsTable
            leads={leads.data}
            status={leads.status}
            error={leads.error}
            onRetry={leads.reload}
            showOwner
          />
        </section>
        <section
          id="users"
          className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm"
        >
          <div className="flex flex-col justify-between gap-2 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:px-7">
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
                Team members
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Accounts with access to your workspace.
              </p>
            </div>
            <span className="badge badge-ghost font-semibold">
              {users.status === "loading"
                ? "Loading"
                : `${userRows.length} members`}
            </span>
          </div>
          {users.status === "loading" && (
            <div className="grid min-h-40 place-items-center">
              <span
                className="loading loading-spinner loading-lg text-indigo-600"
                aria-label="Loading users"
              />
            </div>
          )}
          {users.status === "error" && (
            <div role="alert" className="alert alert-error m-5 rounded-2xl">
              {users.error}{" "}
              <button className="btn btn-sm" onClick={users.reload}>
                Try again
              </button>
            </div>
          )}
          {users.status === "success" && (
            <div className="table-scroll">
              <table className="table table-clean">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Email address</th>
                    <th>Role</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.data?.map((u) => (
                    <tr key={u.id} className="hover">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="w-10 rounded-full bg-slate-100 font-bold text-slate-600">
                              <span>
                                {u.name
                                  .split(" ")
                                  .map((part) => part[0])
                                  .slice(0, 2)
                                  .join("")}
                              </span>
                            </div>
                          </div>
                          <span className="font-bold text-slate-800">
                            {u.name}
                          </span>
                        </div>
                      </td>
                      <td className="text-slate-500">{u.email}</td>
                      <td>
                        <span
                          className={`badge badge-outline capitalize ${u.role === "admin" ? "border-violet-200 bg-violet-50 text-violet-700" : "border-slate-200 bg-slate-50 text-slate-600"}`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="text-slate-500">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
