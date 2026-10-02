import type { FetchStatus } from '../hooks/useFetch';
import type { Lead } from '../api/types';

interface Props {
  leads: Lead[] | null;
  status: FetchStatus;
  error: string;
  onRetry: () => void;
  showOwner?: boolean;
}

export function LeadsTable({ leads, status, error, onRetry, showOwner }: Props) {
  if (status === 'loading')
    return (
      <div className="grid min-h-56 place-items-center">
        <span className="loading loading-spinner loading-lg text-indigo-600" aria-label="Loading leads" />
      </div>
    );
  if (status === 'error')
    return (
      <div role="alert" className="alert alert-error rounded-2xl">
        <span>{error}</span>
        <button className="btn btn-sm" onClick={onRetry}>Try again</button>
      </div>
    );
  if (!leads?.length)
    return (
      <div className="grid min-h-64 place-items-center px-6 text-center">
        <div>
          <span className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
            <svg viewBox="0 0 24 24" fill="none" className="size-7" aria-hidden="true">
              <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11Z" stroke="currentColor" strokeWidth="1.7" />
              <path d="M8 9h8M8 13h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </span>
          <p className="font-bold text-slate-800">No leads yet</p>
          <p className="mt-1 text-sm text-slate-500">New leads will show up here once they’re added.</p>
        </div>
      </div>
    );

  return (
    <div className="table-scroll">
      <table className="table table-clean">
        <thead>
          <tr>
            <th>Lead</th>
            <th>Email</th>
            <th>Company</th>
            <th>Website</th>
            <th>Status</th>
            {showOwner && <th>Owner</th>}
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => (
            <tr key={l.id} className="hover">
              <td className="font-bold text-slate-800">{l.name}</td>
              <td className="text-slate-500">{l.email}</td>
              <td className="font-medium text-slate-700">{l.company}</td>
              <td>
                {l.website ? (
                  <a href={l.website} target="_blank" rel="noreferrer" className="link link-hover text-indigo-600">
                    {l.website.replace(/^https?:\/\//, '')}
                  </a>
                ) : <span className="text-slate-300">—</span>}
              </td>
              <td><span className={`badge badge-outline capitalize ${`status-${l.status}`}`}>{l.status}</span></td>
              {showOwner && <td className="text-slate-600">{l.owner_name}</td>}
              <td className="text-slate-500">{new Date(l.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
