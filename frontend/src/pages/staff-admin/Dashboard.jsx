import { useEffect, useState } from 'react';
import { GraduationCap, UserCheck, Clock, ClipboardCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import StatCard from '../../components/StatCard';
import { useAuth } from '../../context/AuthContext';

const COLORS = ['#0d9488', '#f59e0b', '#6366f1', '#ef4444'];

export default function StaffAdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/staff-admin/dashboard').then(({ data }) => setStats(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-slate-400">Loading…</p>;
  if (!stats) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{user?.department?.name} Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Department-scoped alumni verification and analytics.</p>
      </div>

      {stats.pendingAlumni > 0 && (
        <div className="card bg-amber-50 border-amber-200 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-100 text-amber-700 p-3">
              <Clock className="h-5 w-5" />
            </div>
            <p className="text-sm text-amber-800">
              <span className="font-semibold">{stats.pendingAlumni}</span> alumni registration{stats.pendingAlumni !== 1 ? 's are' : ' is'} waiting for verification.
            </p>
          </div>
          <Link to="/staff-admin/pending" className="btn-accent">Review Now</Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={GraduationCap} label="Total Alumni" value={stats.totalAlumni} accent="brand" />
        <StatCard icon={UserCheck} label="Verified Alumni" value={stats.verifiedAlumni} accent="emerald" />
        <StatCard icon={Clock} label="Pending Verification" value={stats.pendingAlumni} accent="amber" />
        <StatCard icon={ClipboardCheck} label="Active Mentors" value={stats.activeMentors} accent="emerald" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Alumni by Batch</h3>
          {stats.alumniByBatch.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.alumniByBatch}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="batch" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0f766e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Career Status Distribution</h3>
          {stats.careerStatusDistribution.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={stats.careerStatusDistribution}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  label={({ status, count }) => `${status.replace('_', ' ')}: ${count}`}
                >
                  {stats.careerStatusDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyChart() {
  return <div className="h-[260px] flex items-center justify-center text-sm text-slate-400">No verified alumni data yet</div>;
}
