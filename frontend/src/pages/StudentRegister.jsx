import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../utils/api';

const initialForm = {
  fullName: '', registerNumber: '', departmentId: '', currentYear: '',
  email: '', username: '', password: '', confirmPassword: '',
};

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Final Year'];

export default function StudentRegister() {
  const [form, setForm] = useState(initialForm);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get('/departments').then(({ data }) => setDepartments(data)).catch(() => {});
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    for (const [key, value] of Object.entries(form)) {
      if (!value) {
        setError('Please fill in all fields.');
        return;
      }
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/student/register', form);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4">
        <div className="card max-w-md text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-800 mb-2">Registration successful!</h1>
          <p className="text-sm text-slate-500 mb-6">
            Your student account has been created. You can now log in and start discovering
            verified alumni mentors.
          </p>
          <Link to="/login" className="btn-primary w-full">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <GraduationCap className="h-7 w-7 text-brand-700" />
          <span className="text-xl font-bold text-slate-800">Alumexa</span>
        </div>

        <div className="card">
          <h1 className="text-xl font-bold text-slate-800 mb-1">Student Registration</h1>
          <p className="text-sm text-slate-500 mb-6">Create your account to discover verified alumni mentors.</p>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-3 text-sm text-rose-700">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-text">Full Name</label>
              <input className="input-field" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} />
            </div>
            <div>
              <label className="label-text">Register Number</label>
              <input className="input-field" value={form.registerNumber} onChange={(e) => update('registerNumber', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-text">Department</label>
                <select className="input-field" value={form.departmentId} onChange={(e) => update('departmentId', e.target.value)}>
                  <option value="">Select</option>
                  {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label-text">Current Year</label>
                <select className="input-field" value={form.currentYear} onChange={(e) => update('currentYear', e.target.value)}>
                  <option value="">Select</option>
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label-text">Email ID</label>
              <input type="email" className="input-field" value={form.email} onChange={(e) => update('email', e.target.value)} />
            </div>
            <div>
              <label className="label-text">Username</label>
              <input className="input-field" value={form.username} onChange={(e) => update('username', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-text">Password</label>
                <input type="password" className="input-field" value={form.password} onChange={(e) => update('password', e.target.value)} />
              </div>
              <div>
                <label className="label-text">Confirm Password</label>
                <input type="password" className="input-field" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} />
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-700 font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
