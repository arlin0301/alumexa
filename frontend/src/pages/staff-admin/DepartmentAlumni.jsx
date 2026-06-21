import { useEffect, useState } from 'react';
import { Download, Search } from 'lucide-react';
import api from '../../utils/api';
import { downloadFile } from '../../utils/download';
import AlumniTable from '../../components/AlumniTable';

export default function DepartmentAlumni() {
  const [alumni, setAlumni] = useState([]);
  const [filters, setFilters] = useState({ search: '', verificationStatus: '', batch: '' });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  function load() {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    api.get('/staff-admin/alumni', { params }).then(({ data }) => setAlumni(data)).finally(() => setLoading(false));
  }

  function update(field, value) {
    setFilters((f) => ({ ...f, [field]: value }));
  }

  async function openProfile(id) {
    const { data } = await api.get(`/staff-admin/alumni/${id}/full`);
    setSelected(data);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Department Alumni</h1>
          <p className="text-sm text-slate-500 mt-1">{alumni.length} record{alumni.length !== 1 ? 's' : ''} found</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => downloadFile('/staff-admin/export/excel', 'department-alumni.xlsx')} className="btn-primary">
            <Download className="h-4 w-4" /> Export as Excel
          </button>
        </div>
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
          <select className="input-field" value={filters.verificationStatus} onChange={(e) => update('verificationStatus', e.target.value)}>
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400 py-10 text-center">Loading…</p>
        ) : (
          <AlumniTable
            alumni={alumni}
            showDepartment={false}
            renderActions={(a) => (
              <button onClick={() => openProfile(a.id)} className="text-xs text-brand-700 hover:underline">View</button>
            )}
          />
        )}
      {selected && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center px-2 sm:px-4 z-50">
          <div className="bg-white rounded-2xl shadow-sm border border-surface-200 p-4 sm:p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto relative mx-2 sm:mx-0">
            <button onClick={() => setSelected(null)} className="absolute top-3 right-3 sm:top-4 sm:right-4 text-slate-400 hover:text-slate-600">Close</button>
            <h2 className="text-xl font-bold text-slate-800">{selected.fullName}</h2>
            <p className="text-sm text-slate-500 mb-4">{selected.department?.name} · Batch {selected.batch} · {selected.degree}</p>
            <div className="space-y-1 text-sm mb-4">
              <p className="font-medium text-slate-700">{selected.currentStatus}</p>
              {selected.organizationName && <p className="text-slate-500">{selected.designation} at {selected.organizationName}</p>}
              {selected.institutionName && <p className="text-slate-500">{selected.degreePursuing} at {selected.institutionName}</p>}
            </div>
            {selected.skills?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-slate-400 mb-1.5">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.skills.map((s, i) => <span key={i} className="text-xs rounded-full bg-brand-50 text-brand-700 border border-brand-100 px-2.5 py-1">{s}</span>)}
                </div>
              </div>
            )}

            {selected.careerEntries?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-slate-400 mb-1.5">Career / Education Entries</p>
                <div className="space-y-3 text-sm">
                  {selected.careerEntries.map((e) => (
                    <div key={e.id} className="p-3 rounded-lg border border-surface-200">
                      <p className="font-medium text-slate-700">{e.type}</p>
                      {e.organizationName && <p className="text-slate-500">{e.designation} · {e.organizationName}</p>}
                      {e.institutionName && <p className="text-slate-500">{e.degree} · {e.institutionName}</p>}
                      {e.proofDocuments?.length > 0 && (
                        <ul className="list-disc pl-5 text-sm mt-2">
                          {e.proofDocuments.map((d) => (
                            <li key={d.id}>
                              <button onClick={() => downloadFile(`/staff-admin/proofs/${d.id}/download`)} className="text-brand-700 hover:underline">{d.originalName}</button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selected.proofDocuments?.length > 0 && (
              <div className="pt-3 border-t border-surface-200">
                <p className="text-xs text-slate-400 mb-1.5">Profile Proof Documents</p>
                <ul className="list-disc pl-5 text-sm">
                  {selected.proofDocuments.map((p) => (
                    <li key={p.id}><button onClick={() => downloadFile(`/staff-admin/proofs/${p.id}/download`)} className="text-brand-700 hover:underline">{p.originalName}</button></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
