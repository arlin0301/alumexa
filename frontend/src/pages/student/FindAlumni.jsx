import { useEffect, useState } from 'react';
import { Search, Linkedin, Globe, Link2, Sparkles, X } from 'lucide-react';
import api from '../../utils/api';

const STATUS_LABELS = {
  WORKING: 'Working', HIGHER_EDUCATION: 'Higher Education', EXAM_PREPARATION: 'Exam Preparation', OTHERS: 'Others',
};
const EMPLOYMENT_SECTORS = ['Public Sector', 'Private Sector', 'Other'];

export default function FindAlumni() {
  const [alumni, setAlumni] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({ departmentId: '', batch: '', currentStatus: '', employmentSector: '', company: '', mentorAvailable: '' });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

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
    api.get('/student/alumni/search', { params }).then(({ data }) => setAlumni(data)).finally(() => setLoading(false));
  }

  function update(field, value) {
    setFilters((f) => ({ ...f, [field]: value }));
  }

  async function openProfile(id) {
    const { data } = await api.get(`/student/alumni/${id}`);
    setSelected(data);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Find Alumni</h1>
        <p className="text-sm text-slate-500 mt-1">Search verified alumni profiles by department, batch, career status, and mentorship availability.</p>
      </div>

      <div className="card">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          <select className="input-field" value={filters.departmentId} onChange={(e) => update('departmentId', e.target.value)}>
            <option value="">All Departments</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <input className="input-field" placeholder="Batch" value={filters.batch} onChange={(e) => update('batch', e.target.value)} />
          <select className="input-field" value={filters.currentStatus} onChange={(e) => update('currentStatus', e.target.value)}>
            <option value="">All Statuses</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select className="input-field" value={filters.employmentSector} onChange={(e) => update('employmentSector', e.target.value)}>
            <option value="">All Sectors</option>
            {EMPLOYMENT_SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input className="input-field pl-9" placeholder="Company / Institution" value={filters.company} onChange={(e) => update('company', e.target.value)} />
          </div>
          <label className="flex items-center gap-2 rounded-xl border border-surface-200 px-3.5 py-2.5 text-sm text-slate-600 cursor-pointer">
            <input type="checkbox" checked={filters.mentorAvailable === 'true'} onChange={(e) => update('mentorAvailable', e.target.checked ? 'true' : '')} className="rounded border-surface-300 text-brand-700" />
            Mentor Available
          </label>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400 py-10 text-center">Loading…</p>
      ) : alumni.length === 0 ? (
        <div className="card text-center py-14">
          <Search className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No alumni found matching your filters.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {alumni.map((a) => (
            <button key={a.id} onClick={() => openProfile(a.id)} className="card text-left hover:shadow-md hover:border-brand-200 transition">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-800">{a.fullName}</h3>
                  <p className="text-xs text-slate-500">{a.department?.name} · Batch {a.batch}</p>
                </div>
                {a.mentorAvailable && (
                  <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Sparkles className="h-3 w-3" /> Mentor
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 mt-3">
                {STATUS_LABELS[a.currentStatus]}
                {a.organizationName && ` · ${a.designation} at ${a.organizationName}`}
                {a.institutionName && ` · ${a.degreePursuing} at ${a.institutionName}`}
                {a.examName && ` · ${a.examName}`}
                {a.activityName && ` · ${a.activityName}`}
              </p>
              {a.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {a.skills.slice(0, 4).map((s, i) => (
                    <span key={i} className="text-xs rounded-full bg-surface-100 text-slate-600 px-2.5 py-1">{s}</span>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {selected && <AlumniDetailModal profile={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function AlumniDetailModal({ profile, onClose }) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center px-4 z-50">
      <div className="card w-full max-w-lg max-h-[85vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold text-slate-800">{profile.fullName}</h2>
        <p className="text-sm text-slate-500 mb-4">{profile.department?.name} · Batch {profile.batch} · {profile.degree}</p>

        <div className="space-y-1 text-sm mb-4">
          <p className="font-medium text-slate-700">{STATUS_LABELS[profile.currentStatus]}</p>
          {profile.organizationName && <p className="text-slate-500">{profile.designation} at {profile.organizationName}</p>}
          {profile.institutionName && <p className="text-slate-500">{profile.degreePursuing} at {profile.institutionName}</p>}
          {profile.examName && <p className="text-slate-500">Preparing for {profile.examName}</p>}
          {profile.activityName && <p className="text-slate-500">{profile.activityName}</p>}
        </div>

        {profile.skills.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-slate-400 mb-1.5">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map((s, i) => <span key={i} className="text-xs rounded-full bg-brand-50 text-brand-700 border border-brand-100 px-2.5 py-1">{s}</span>)}
            </div>
          </div>
        )}

        {profile.mentorAvailable && (
          <div className="mb-4">
            <p className="text-xs text-slate-400 mb-1.5">Open to mentoring in</p>
            <div className="flex flex-wrap gap-1.5">
              {profile.mentorshipAreas.careerGuidance && <span className="badge-verified">Career Guidance</span>}
              {profile.mentorshipAreas.higherStudiesGuidance && <span className="badge-verified">Higher Studies</span>}
              {profile.mentorshipAreas.examPrepGuidance && <span className="badge-verified">Exam Prep</span>}
              {profile.mentorshipAreas.entrepreneurshipGuidance && <span className="badge-verified">Entrepreneurship</span>}
              {profile.mentorshipAreas.internshipGuidance && <span className="badge-verified">Internships</span>}
            </div>
          </div>
        )}

        {(profile.linkedin || profile.portfolio || profile.website) && (
          <div className="flex flex-wrap gap-3 pt-3 border-t border-surface-200">
            {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-brand-700 hover:underline"><Linkedin className="h-4 w-4" /> LinkedIn</a>}
            {profile.portfolio && <a href={profile.portfolio} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-brand-700 hover:underline"><Link2 className="h-4 w-4" /> Portfolio</a>}
            {profile.website && <a href={profile.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-brand-700 hover:underline"><Globe className="h-4 w-4" /> Website</a>}
          </div>
        )}
      </div>
    </div>
  );
}
