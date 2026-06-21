import { useEffect, useState } from 'react';
import { Building2, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../utils/api';

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    api.get('/departments').then(({ data }) => setDepartments(data)).finally(() => setLoading(false));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name.trim()) {
      setError('Department name is required.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/super-admin/departments', { name });
      setName('');
      setSuccess('Department created successfully.');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create department.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Departments</h1>
        <p className="text-sm text-slate-500 mt-1">
          Departments are used for staff admin assignment, alumni registration, and student search filters.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-1">
          <h3 className="font-semibold text-slate-800 mb-4">Add Department</h3>

          {error && (
            <div className="mb-3 flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2.5 text-sm text-rose-700">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-3 flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2.5 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" /> <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="label-text">Department Name</label>
              <input
                className="input-field"
                placeholder="e.g. Computer Science"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              <Plus className="h-4 w-4" /> {submitting ? 'Adding…' : 'Add Department'}
            </button>
          </form>
        </div>

        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-slate-800 mb-4">All Departments ({departments.length})</h3>

          {loading ? (
            <p className="text-sm text-slate-400">Loading…</p>
          ) : departments.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {departments.map((d) => (
                <div key={d.id} className="flex items-center gap-3 rounded-xl border border-surface-200 px-4 py-3">
                  <div className="rounded-lg bg-brand-50 p-2 text-brand-700">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{d.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-10">
      <Building2 className="h-10 w-10 text-slate-300 mx-auto mb-3" />
      <p className="text-sm text-slate-500">No departments created yet.</p>
      <p className="text-xs text-slate-400 mt-1">Add your first department using the form on the left.</p>
    </div>
  );
}
