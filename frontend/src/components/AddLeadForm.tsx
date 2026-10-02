import { FormEvent, useState } from 'react';
import { leadsApi } from '../api/endpoints';
import { errorMessage, fieldErrors } from '../api/errors';
import { Lead, LEAD_STATUSES, LeadStatus } from '../api/types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const empty = { name: '', email: '', company: '', website: '', status: 'new' as LeadStatus };

function validate(f: typeof empty): Record<string, string> {
  const e: Record<string, string> = {};
  if (!f.name.trim()) e.name = 'Name is required';
  else if (f.name.length > 100) e.name = 'Max 100 characters';
  if (!f.email.trim()) e.email = 'Email is required';
  else if (!EMAIL_RE.test(f.email.trim())) e.email = 'Invalid email';
  if (!f.company.trim()) e.company = 'Company is required';
  else if (f.company.length > 100) e.company = 'Max 100 characters';
  if (f.website.trim() && !/^https?:\/\/\S+$/i.test(f.website.trim())) e.website = 'Must start with http:// or https://';
  return e;
}

export function AddLeadForm({ onCreated }: { onCreated: (lead: Lead) => void }) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const set = (k: keyof typeof empty) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setSuccess(false);
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError('');
    setSuccess(false);
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) return;

    setSubmitting(true);
    try {
      const lead = await leadsApi.create({ ...form, website: form.website.trim() || undefined });
      onCreated(lead); // table updates without a reload
      setForm(empty);
      setSuccess(true);
    } catch (err) {
      const fe = fieldErrors(err);
      if (Object.keys(fe).length) setErrors(fe);
      else setApiError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  const field = (k: keyof typeof empty, label: string, type = 'text') => (
    <label className="form-control w-full">
      <span className="label pb-2 text-sm font-semibold text-slate-600">{label}</span>
      <input
        className={`input input-bordered w-full rounded-xl bg-white ${errors[k] ? 'input-error' : 'focus:border-indigo-500'}`}
        type={type}
        value={form[k]}
        onChange={set(k)}
        aria-invalid={!!errors[k]}
        aria-describedby={errors[k] ? `${k}-error` : undefined}
      />
      {errors[k] && <span id={`${k}-error`} className="mt-1 text-xs font-medium text-error">{errors[k]}</span>}
    </label>
  );

  return (
    <form className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7" onSubmit={onSubmit} noValidate>
      <div className="mb-6 flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
          <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900">Add a lead</h2>
          <p className="mt-1 text-sm text-slate-500">Capture a new contact and keep your pipeline moving.</p>
        </div>
      </div>
      <div className="grid gap-x-5 gap-y-3 sm:grid-cols-2">
        {field('name', 'Full name')}
        {field('email', 'Email address', 'email')}
        {field('company', 'Company')}
        {field('website', 'Website (optional)', 'url')}
        <label className="form-control w-full">
          <span className="label pb-2 text-sm font-semibold text-slate-600">Lead status</span>
          <select className="select select-bordered w-full rounded-xl bg-white capitalize focus:border-indigo-500" value={form.status} onChange={set('status')}>
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      {apiError && <div role="alert" className="alert alert-error mt-4 rounded-xl text-sm">{apiError}</div>}
      {success && <div role="status" className="alert alert-success mt-4 rounded-xl text-sm">Lead added to your pipeline.</div>}
      <div className="mt-5 flex justify-end">
        <button className="btn border-0 bg-indigo-600 px-6 text-white shadow-md shadow-indigo-200 hover:bg-indigo-700" disabled={submitting}>
          {submitting && <span className="loading loading-spinner loading-xs" />}
          {submitting ? 'Adding lead…' : 'Add lead'}
        </button>
      </div>
    </form>
  );
}
