import { useEffect, useState } from 'react';
import { Download, Search, UserCircle } from 'lucide-react';
import api from '../../utils/api';
import { downloadFile } from '../../utils/download';

export default function AllStudents() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({ search: '', departmentId: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/departments').then(({ data }) => setDepartments(data)).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  function load() {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    api.get('/super-admin/students', { params }).then(({ data }) => setStudents(data)).finally(() => setLoading(false));
  }

  function update(field, value) {
    setFilters((f) => ({ ...f, [field]: value }));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">All Students</h1>
          <p className="text-sm text-slate-500 mt-1">{students.length} record{students.length !== 1 ? 's' : ''} found</p>
        </div>
        <button
          onClick={() => downloadFile('/super-admin/export/students', 'all-students.csv')}
          className="btn-secondary"
        >
          <Download className="h-4 w-4" /> Export All Students
        </button>
      </div>

      <div className="card">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              className="input-field pl-9"
              placeholder="Search by name, register no., or email"
              value={filters.search}
              onChange={(e) => update('search', e.target.value)}
            />
          </div>
          <select className="input-field" value={filters.departmentId} onChange={(e) => update('departmentId', e.target.value)}>
            <option value="">All Departments</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400 py-10 text-center">Loading…</p>
        ) : students.length === 0 ? (
          <div className="text-center py-10">
            <UserCircle className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No student records found.</p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {students.map((s) => (
                <div key={s.id} className="rounded-xl border border-surface-200 bg-white p-4 space-y-1">
                  <p className="font-semibold text-slate-800">{s.fullName}</p>
                  <p className="text-xs text-slate-500">{s.registerNumber} · {s.department?.name} · {s.currentYear}</p>
                  <p className="text-xs text-slate-400 truncate">{s.email}</p>
                </div>
              ))}
            </div>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-surface-200">
                    <th className="py-2 pr-3 font-medium whitespace-nowrap">Name</th>
                    <th className="py-2 pr-3 font-medium whitespace-nowrap">Register No.</th>
                    <th className="py-2 pr-3 font-medium whitespace-nowrap">Department</th>
                    <th className="py-2 pr-3 font-medium whitespace-nowrap">Year</th>
                    <th className="py-2 font-medium whitespace-nowrap">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id} className="border-b border-surface-100 last:border-0">
                      <td className="py-3 pr-3 font-medium text-slate-700 whitespace-nowrap">{s.fullName}</td>
                      <td className="py-3 pr-3 text-slate-500 whitespace-nowrap">{s.registerNumber}</td>
                      <td className="py-3 pr-3 text-slate-500 whitespace-nowrap">{s.department?.name}</td>
                      <td className="py-3 pr-3 text-slate-500 whitespace-nowrap">{s.currentYear}</td>
                      <td className="py-3 text-slate-500 whitespace-nowrap">{s.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
