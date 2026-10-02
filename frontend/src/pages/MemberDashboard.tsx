import { leadsApi } from "../api/endpoints";
import type { Lead } from "../api/types";
import { AddLeadForm } from "../components/AddLeadForm";
import { Layout } from "../components/Layout";
import { LeadsTable } from "../components/LeadsTable";
import { useFetch } from "../hooks/useFetch";

export default function MemberDashboard() {
  const { data, setData, status, error, reload } = useFetch(leadsApi.list);
  const onCreated = (lead: Lead) => setData((prev) => [lead, ...(prev ?? [])]);
  const leads = data ?? [];
  const newLeads = leads.filter((lead) => lead.status === "new").length;
  const qualifiedLeads = leads.filter(
    (lead) => lead.status === "qualified",
  ).length;

  return (
    <Layout>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-indigo-600">
            Your workspace
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            My leads
          </h1>
          <p className="mt-2 text-slate-500">
            Keep every opportunity and conversation in one place.
          </p>
        </div>
        <div className="badge badge-lg gap-2 border-indigo-100 bg-indigo-50 px-4 py-4 font-semibold text-indigo-700">
          <span className="size-2 rounded-full bg-indigo-500" />
          Personal pipeline
        </div>
      </div>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Total leads</p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
            {status === "loading" ? "—" : leads.length}
          </p>
          <p className="mt-1 text-xs text-slate-400">In your pipeline</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">New leads</p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-indigo-600">
            {status === "loading" ? "—" : newLeads}
          </p>
          <p className="mt-1 text-xs text-slate-400">Ready for a first touch</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Qualified</p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-emerald-600">
            {status === "loading" ? "—" : qualifiedLeads}
          </p>
          <p className="mt-1 text-xs text-slate-400">Promising opportunities</p>
        </div>
      </div>
      <div className="grid items-start gap-6">
        <AddLeadForm onCreated={onCreated} />
        <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-2 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:px-7">
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
                Lead pipeline
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                A clear view of your active contacts.
              </p>
            </div>
            <span className="badge badge-ghost font-semibold">
              {status === "loading" ? "Loading" : `${leads.length} total`}
            </span>
          </div>
          <LeadsTable
            leads={data}
            status={status}
            error={error}
            onRetry={reload}
          />
        </section>
      </div>
    </Layout>
  );
}
