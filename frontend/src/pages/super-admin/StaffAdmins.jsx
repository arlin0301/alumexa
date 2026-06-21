import { useEffect, useState } from 'react';
import { UserPlus, AlertCircle, CheckCircle2, Power, Trash2, Edit3, Key } from 'lucide-react';
import api from '../../utils/api';

const initialForm = { email: '', username: '', password: '', departmentId: '' };

export default function StaffAdmins() {
  const [staffAdmins, setStaffAdmins] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    load();
    api.get('/departments').then(({ data }) => setDepartments(data)).catch(() => {});
  }, []);

  function load() {
    setLoading(true);
    api.get('/super-admin/staff-admins').then(({ data }) => setStaffAdmins(data)).finally(() => setLoading(false));
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    for (const [key, value] of Object.entries(form)) {
      if (!value) {
        setError('All fields are required.');
        return;
      }
    }

    setSubmitting(true);
    try {
      await api.post('/super-admin/staff-admins', form);
      setSuccess('Staff admin account created successfully.');
      setForm(initialForm);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create staff admin.');
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(staff) {
    const action = staff.isActive ? 'deactivate' : 'activate';
    await api.patch(`/super-admin/staff-admins/${staff.id}/${action}`);
    load();
  }

  async function handleDelete(staff) {
    if (!window.confirm(`Delete staff admin ${staff.username}? This cannot be undone.`)) return;
    await api.delete(`/super-admin/staff-admins/${staff.id}`);
    load();
  }

  async function handleResetPassword(staff) {
    const pw = window.prompt('Enter new password for ' + staff.username + ' (min 6 chars):');
    if (!pw) return;
    try {
      await api.patch(`/super-admin/staff-admins/${staff.id}/password`, { newPassword: pw });
      alert('Password reset successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reset password');
    }
  }

  async function handleEdit(staff) {
    const username = window.prompt('New username (leave blank to keep)', staff.username);
    const email = window.prompt('New email (leave blank to keep)', staff.email);
    const dept = window.prompt('New department id (leave blank to keep)', staff.department?.id || '');
    const body = {};
    if (username) body.username = username;
    if (email) body.email = email;
    if (dept) body.departmentId = Number(dept);
    if (Object.keys(body).length === 0) return;
    try {
      await api.patch(`/super-admin/staff-admins/${staff.id}/edit`, body);
      load();
      alert('Staff updated');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update staff');
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Staff Admins</h1>
        <p className="text-sm text-slate-500 mt-1">Create department-level coordinator accounts and manage their access.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-1">
          <h3 className="font-semibold text-slate-800 mb-4">Create Staff Admin</h3>

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
              <label className="label-text">Email</label>
              <input type="email" className="input-field" value={form.email} onChange={(e) => update('email', e.target.value)} />
            </div>
            <div>
              <label className="label-text">Username</label>
              <input className="input-field" value={form.username} onChange={(e) => update('username', e.target.value)} />
            </div>
            <div>
              <label className="label-text">Password</label>
              <input type="password" className="input-field" value={form.password} onChange={(e) => update('password', e.target.value)} />
            </div>
            <div>
              <label className="label-text">Department</label>
              <select className="input-field" value={form.departmentId} onChange={(e) => update('departmentId', e.target.value)}>
                <option value="">Select department</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              {departments.length === 0 && (
                <p className="text-xs text-slate-400 mt-1.5">Create a department first.</p>
              )}
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              <UserPlus className="h-4 w-4" /> {submitting ? 'Creating…' : 'Create Account'}
            </button>
          </form>
        </div>

        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-slate-800 mb-4">All Staff Admins ({staffAdmins.length})</h3>

          {loading ? (
            <p className="text-sm text-slate-400">Loading…</p>
          ) : staffAdmins.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">No staff admin accounts yet.</p>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="sm:hidden space-y-3">
                {staffAdmins.map((s) => (
                  <div key={s.id} className="rounded-xl border border-surface-200 bg-white p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{s.username}</p>
                        <p className="text-xs text-slate-400 truncate">{s.email}</p>
                      </div>
                      {s.isActive ? (
                        <span className="badge-verified shrink-0">Active</span>
                      ) : (
                        <span className="badge-rejected shrink-0">Inactive</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">Department: {s.department?.name}</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button onClick={() => toggleActive(s)} className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline">
                        <Power className="h-3 w-3" />{s.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => handleEdit(s)} className="inline-flex items-center gap-1 text-xs text-slate-600 hover:underline">
                        <Edit3 className="h-3 w-3" /> Edit
                      </button>
                      <button onClick={() => handleResetPassword(s)} className="inline-flex items-center gap-1 text-xs text-slate-600 hover:underline">
                        <Key className="h-3 w-3" /> Password
                      </button>
                      <button onClick={() => handleDelete(s)} className="inline-flex items-center gap-1 text-xs text-rose-600 hover:underline">
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500 border-b border-surface-200">
                      <th className="py-2 pr-3 font-medium whitespace-nowrap">Username</th>
                      <th className="py-2 pr-3 font-medium whitespace-nowrap">Email</th>
                      <th className="py-2 pr-3 font-medium whitespace-nowrap">Department</th>
                      <th className="py-2 pr-3 font-medium whitespace-nowrap">Status</th>
                      <th className="py-2 font-medium whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffAdmins.map((s) => (
                      <tr key={s.id} className="border-b border-surface-100 last:border-0">
                        <td className="py-3 pr-3 font-medium text-slate-700 whitespace-nowrap">{s.username}</td>
                        <td className="py-3 pr-3 text-slate-500 whitespace-nowrap">{s.email}</td>
                        <td className="py-3 pr-3 text-slate-500 whitespace-nowrap">{s.department?.name}</td>
                        <td className="py-3 pr-3 whitespace-nowrap">
                          {s.isActive ? (
                            <span className="badge-verified">Active</span>
                          ) : (
                            <span className="badge-rejected">Inactive</span>
                          )}
                        </td>
                        <td className="py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button onClick={() => toggleActive(s)} className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline">
                              <Power className="h-3.5 w-3.5" />{s.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button onClick={() => handleEdit(s)} className="inline-flex items-center gap-1 text-xs text-slate-600 hover:underline">
                              <Edit3 className="h-3.5 w-3.5" /> Edit
                            </button>
                            <button onClick={() => handleResetPassword(s)} className="inline-flex items-center gap-1 text-xs text-slate-600 hover:underline">
                              <Key className="h-3.5 w-3.5" /> Reset
                            </button>
                            <button onClick={() => handleDelete(s)} className="inline-flex items-center gap-1 text-xs text-rose-600 hover:underline">
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
