import { useEffect, useState } from 'react';
import { Users, GraduationCap, ClipboardCheck, Building2, UserCheck, Clock, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../../utils/api';
import StatCard from '../../components/StatCard';

const COLORS = ['#0d9488', '#f59e0b', '#6366f1', '#ef4444', '#10b981', '#0ea5e9'];

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  function loadStats() {
    setLoading(true);
    api.get('/super-admin/dashboard')
      .then(({ data }) => setStats(data))
      .finally(() => setLoading(false));
  }

  async function handleResetAllData() {
    const confirmed = window.confirm(
      'This will permanently delete all data except the Super Admin account. Uploaded proof files will also be removed. Continue?'
    );
    if (!confirmed) return;

    setResetting(true);
    try {
      await api.delete('/super-admin/reset-data');
      alert('All non-Super Admin data has been deleted.');
      loadStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reset data');
    } finally {
      setResetting(false);
    }
  }

  if (loading) return <LoadingState />;
  if (!stats) return null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">College Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Institution-wide overview of alumni and student records.</p>
        </div>
        <button
          type="button"
          disabled={resetting}
          onClick={handleResetAllData}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          {resetting ? 'Resetting…' : 'Reset All Data'}
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={GraduationCap} label="Total Alumni" value={stats.totalAlumni} accent="brand" />
        <StatCard icon={UserCheck} label="Verified Alumni" value={stats.verifiedAlumni} accent="emerald" />
        <StatCard icon={Clock} label="Pending Alumni" value={stats.pendingAlumni} accent="amber" />
        <StatCard icon={Users} label="Total Students" value={stats.totalStudents} accent="brand" />
        <StatCard icon={Building2} label="Departments" value={stats.totalDepartments} accent="brand" />
        <StatCard icon={ClipboardCheck} label="Active Mentors" value={stats.activeMentors} accent="emerald" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Alumni by Department">
          {stats.alumniByDepartment.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.alumniByDepartment}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="department" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0f766e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Alumni by Batch">
          {stats.alumniByBatch.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.alumniByBatch}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="batch" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Career Status Distribution">
          {stats.careerStatusDistribution.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={stats.careerStatusDistribution}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ status, count }) => `${formatLabel(status)}: ${count}`}
                >
                  {stats.careerStatusDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Employment Sector Distribution">
          {stats.employmentSectorDistribution.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={stats.employmentSectorDistribution}
                  dataKey="count"
                  nameKey="sector"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ sector, count }) => `${sector}: ${count}`}
                >
                  {stats.employmentSectorDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="card">
      <h3 className="font-semibold text-slate-800 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="h-[280px] flex items-center justify-center text-sm text-slate-400">
      No verified alumni data yet
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-8 w-64 bg-surface-200 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card h-24" />
        ))}
      </div>
    </div>
  );
}

export function formatLabel(value) {
  return value
    ?.toLowerCase()
    .split('_')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}
