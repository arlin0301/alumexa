import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ROLE_HOME = {
  SUPER_ADMIN: '/super-admin',
  STAFF_ADMIN: '/staff-admin',
  ALUMNI: '/alumni',
  STUDENT: '/student',
};

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const user = await login(identifier, password);
      navigate(ROLE_HOME[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <GraduationCap className="h-8 w-8 text-brand-700" />
          <span className="text-2xl font-bold text-slate-800">Alumexa</span>
        </div>

        <div className="card">
          <h1 className="text-xl font-bold text-slate-800 mb-1">Welcome back</h1>
          <p className="text-sm text-slate-500 mb-6">Log in to access your dashboard</p>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-3 text-sm text-rose-700">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-text">Email or Username</label>
              <input
                type="text"
                required
                className="input-field"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="label-text">Password</label>
              <input
                type="password"
                required
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Logging in…' : 'Log in'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          New here?{' '}
          <Link to="/register/alumni" className="text-brand-700 font-medium hover:underline">
            Register as Alumni
          </Link>{' '}
          or{' '}
          <Link to="/register/student" className="text-brand-700 font-medium hover:underline">
            Register as Student
          </Link>
        </p>
        <p className="text-center text-sm mt-2">
          <Link to="/" className="text-slate-400 hover:underline">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
