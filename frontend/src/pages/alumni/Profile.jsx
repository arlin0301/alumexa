import { useEffect, useState } from 'react';
import {
  User, Briefcase, Sparkles, ShieldCheck, Plus, Trash2,
  Linkedin, Globe, Link2, Eye, EyeOff, FileText, Info, Settings,
} from 'lucide-react';
import api from '../../utils/api';
import StatusBadge from '../../components/StatusBadge';
import ProofUpload from '../../components/ProofUpload';
import ProofAlerts from '../../components/ProofAlerts';
import InformationTab from './InformationTab';
import AccountTab from './AccountTab';

const TABS = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'information', label: 'Information', icon: Info },
  { id: 'career', label: 'Career Journey', icon: Briefcase },
  { id: 'proofs', label: 'Documents', icon: FileText },
  { id: 'skills', label: 'Skills & Links', icon: Sparkles },
  { id: 'mentorship', label: 'Mentorship & Privacy', icon: ShieldCheck },
  { id: 'account', label: 'Account Settings', icon: Settings },
];

const ENTRY_TYPES = [
  { value: 'WORKING', label: 'Working Experience' },
  { value: 'HIGHER_EDUCATION', label: 'Higher Education' },
  { value: 'ENTREPRENEURSHIP', label: 'Entrepreneurship' },
  { value: 'EXAM_PREPARATION', label: 'Exam Preparation' },
  { value: 'OTHER', label: 'Other Activity' },
];

const STATUS_LABELS = {
  WORKING: 'Working', HIGHER_EDUCATION: 'Higher Education',
  ENTREPRENEURSHIP: 'Entrepreneurship', EXAM_PREPARATION: 'Exam Preparation', OTHERS: 'Others',
};

const CAREER_ENTRY_DOC_TYPES = {
  WORKING: ['EMPLOYEE_ID', 'OFFER_LETTER', 'EXPERIENCE_CERTIFICATE', 'OTHER'],
  HIGHER_EDUCATION: ['STUDENT_ID', 'ADMISSION_LETTER', 'MARKSHEET', 'OTHER'],
  ENTREPRENEURSHIP: ['OTHER'],
  EXAM_PREPARATION: ['HALL_TICKET', 'REGISTRATION_RECEIPT', 'COACHING_PROOF', 'OTHER'],
  OTHER: ['OTHER'],
};

export default function AlumniProfile() {
  const [profile, setProfile] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    load();
    api.get('/departments').then(({ data }) => setDepartments(data)).catch(() => {});
  }, []);

  function load() {
    setLoading(true);
    api.get('/alumni/me').then(({ data }) => setProfile(data)).finally(() => setLoading(false));
  }

  if (loading) return <p className="text-sm text-slate-400">Loading…</p>;
  if (!profile) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="card flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{profile.fullName}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {profile.department?.name} · Batch {profile.batch} · {profile.degreeType || profile.degree}
            {profile.degreeSpecialization && ` · ${profile.degreeSpecialization}`}
          </p>
        </div>
        <StatusBadge status={profile.verificationStatus} />
      </div>

      {/* Proof alerts */}
      <ProofAlerts profile={profile} onNavigate={() => setTab('proofs')} />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-surface-200 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium border-b-2 transition whitespace-nowrap ${
              tab === t.id ? 'border-brand-700 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <Overview profile={profile} />}
      {tab === 'information' && <InformationTab profile={profile} departments={departments} onChange={load} />}
      {tab === 'career' && <CareerJourney profile={profile} onChange={load} />}
      {tab === 'proofs' && <RegistrationProofs profile={profile} onChange={load} />}
      {tab === 'skills' && <SkillsAndLinks profile={profile} onChange={load} />}
      {tab === 'mentorship' && <MentorshipAndPrivacy profile={profile} onChange={load} />}
      {tab === 'account' && <AccountTab />}
    </div>
  );
}

// --- Overview ---

function Overview({ profile }) {
  return (
    <div className="card space-y-4">
      <h3 className="font-semibold text-slate-800">Registration Details</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
        <Detail label="Register Number" value={profile.registerNumber} />
        <Detail label="Mobile" value={profile.mobile} />
        <Detail label="Email" value={profile.email} />
        <Detail label="Date of Birth" value={profile.dateOfBirth} />
        <Detail label="Current Status" value={STATUS_LABELS[profile.currentStatus]} />
        {profile.currentStatus === 'WORKING' && (
          <>
            <Detail label="Employment Type" value={profile.employmentType} />
            <Detail label="Organization" value={profile.organizationName} />
            <Detail label="Designation" value={profile.designation} />
            <Detail label="Salary Package" value={profile.salaryPackage} />
            <Detail label="Location" value={profile.location} />
          </>
        )}
        {profile.currentStatus === 'HIGHER_EDUCATION' && (
          <>
            <Detail label="Institution" value={profile.institutionName} />
            <Detail label="Degree Pursuing" value={profile.degreePursuing} />
            <Detail label="Specialization" value={profile.specialization} />
            <Detail label="Duration" value={profile.startYear && `${profile.startYear} – ${profile.expectedCompletionYear}`} />
          </>
        )}
        {profile.currentStatus === 'ENTREPRENEURSHIP' && (
          <>
            <Detail label="Business Name" value={profile.businessName || profile.organizationName} />
            <Detail label="Industry" value={profile.industry} />
            <Detail label="Founder Role" value={profile.founderRole || profile.designation} />
          </>
        )}
        {profile.currentStatus === 'EXAM_PREPARATION' && (
          <>
            <Detail label="Exam" value={profile.examName} />
            <Detail label="Preparation Type" value={profile.preparationType} />
            <Detail label="Duration" value={profile.examStartYear && `${profile.examStartYear} – ${profile.expectedExamYear}`} />
          </>
        )}
        {profile.currentStatus === 'OTHERS' && (
          <>
            <Detail label="Activity" value={profile.activityName} />
            <Detail label="Description" value={profile.description} />
          </>
        )}
        {profile.addressLine1 && (
          <Detail label="Address" value={[profile.addressLine1, profile.city, profile.state, profile.pinCode].filter(Boolean).join(', ')} />
        )}
      </div>
      {profile.verificationStatus === 'REJECTED' && profile.rejectionReason && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
          <span className="font-semibold">Rejection reason:</span> {profile.rejectionReason}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-slate-700 font-medium">{value}</p>
    </div>
  );
}

// --- Registration-level Proof Documents ---

function getRegistrationDocTypes(currentStatus) {
  const base = ['DEGREE_CERTIFICATE', 'ALUMNI_ID', 'OTHER'];
  if (currentStatus === 'WORKING') return [...base, 'EMPLOYMENT_PROOF'];
  if (currentStatus === 'HIGHER_EDUCATION' || currentStatus === 'EXAM_PREPARATION') return [...base, 'ADMISSION_PROOF'];
  return base;
}

function RegistrationProofs({ profile, onChange }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/alumni/me/proofs')
      .then(({ data }) => setDocs(data.filter((d) => !d.careerEntryId)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-slate-400">Loading…</p>;

  return (
    <div className="card space-y-4">
      <div>
        <h3 className="font-semibold text-slate-800 mb-1">Verification Documents</h3>
        <p className="text-sm text-slate-500">Upload documents that verify your alumni status. Visible to staff admins reviewing your registration.</p>
      </div>
      <ProofUpload
        uploadUrl="/alumni/me/proofs"
        docTypes={getRegistrationDocTypes(profile.currentStatus)}
        existingDocs={docs}
        onUploaded={(doc) => setDocs((d) => [...d, doc])}
        onDeleted={(id) => setDocs((d) => d.filter((doc) => doc.id !== id))}
        onUpdated={(updatedDoc) => setDocs((d) => d.map((doc) => doc.id === updatedDoc.id ? updatedDoc : doc))}
        label="Supporting Documents"
        optional={true}
      />
    </div>
  );
}

// --- Career Journey ---

const emptyEntry = {
  type: 'WORKING',
  employmentSector: '', employmentType: '', organizationName: '', designation: '', location: '', salaryPackage: '',
  institutionName: '', degree: '', degreeType: '', specialization: '', startYear: '', endYear: '',
  businessName: '', industry: '', founderRole: '',
  examName: '', preparationType: '', examInstitution: '',
  activityName: '', description: '',
  startDate: '', endDate: '', currentlyActive: false,
};

const EMPLOYMENT_TYPES = [
  { value: 'PRIVATE', label: 'Private Sector' },
  { value: 'PUBLIC_GOVT', label: 'Public Sector / Government' },
  { value: 'OTHER', label: 'Other' },
];

const SALARY_RANGES = [
  '₹2 LPA', '₹3 LPA', '₹4 LPA', '₹5 LPA', '₹6 LPA', '₹8 LPA',
  '₹10 LPA', '₹12 LPA', '₹15 LPA', '₹20 LPA+', 'Prefer not to say',
];

function CareerJourney({ profile, onChange }) {
  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [entry, setEntry] = useState(emptyEntry);
  const [submitting, setSubmitting] = useState(false);

  function startNew() { setEntry(emptyEntry); setEditEntry(null); setShowForm(true); }
  function startEdit(e) {
    setEntry({ ...emptyEntry, ...e });
    setEditEntry(e.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function update(field, value) { setEntry((e) => ({ ...e, [field]: value })); }

  async function handleSave(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editEntry) {
        await api.patch(`/alumni/me/career-entries/${editEntry}`, entry);
      } else {
        await api.post('/alumni/me/career-entries', entry);
      }
      setEntry(emptyEntry); setEditEntry(null); setShowForm(false);
      onChange();
    } finally { setSubmitting(false); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this career entry?')) return;
    await api.delete(`/alumni/me/career-entries/${id}`);
    onChange();
  }

  return (
    <div className="space-y-4">
      <div className="card flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800">Career Journey</h3>
          <p className="text-sm text-slate-500 mt-0.5">Add and manage all your career and education records.</p>
        </div>
        <button onClick={startNew} className="btn-primary"><Plus className="h-4 w-4" /> Add Entry</button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="card space-y-4">
          <h4 className="font-semibold text-slate-800">{editEntry ? 'Edit Entry' : 'New Career Entry'}</h4>
          <div>
            <label className="label-text">Entry Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ENTRY_TYPES.map((t) => (
                <button type="button" key={t.value} onClick={() => update('type', t.value)}
                  className={`rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition ${entry.type === t.value ? 'border-brand-700 bg-brand-50 text-brand-800' : 'border-surface-200 text-slate-600 hover:border-brand-200'}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {entry.type === 'WORKING' && (
            <div className="grid sm:grid-cols-2 gap-4">
              <TF label="Organization Name" value={entry.organizationName} onChange={(v) => update('organizationName', v)} />
              <TF label="Designation" value={entry.designation} onChange={(v) => update('designation', v)} />
              <div>
                <label className="label-text">Employment Type</label>
                <select className="input-field" value={entry.employmentType} onChange={(e) => update('employmentType', e.target.value)}>
                  <option value="">Select</option>
                  {EMPLOYMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label-text">Salary Package</label>
                <select className="input-field" value={entry.salaryPackage} onChange={(e) => update('salaryPackage', e.target.value)}>
                  <option value="">Select</option>
                  {SALARY_RANGES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <TF label="Location" value={entry.location} onChange={(v) => update('location', v)} />
            </div>
          )}

          {entry.type === 'HIGHER_EDUCATION' && (
            <div className="grid sm:grid-cols-2 gap-4">
              <TF label="Institution Name" value={entry.institutionName} onChange={(v) => update('institutionName', v)} />
              <TF label="Degree / Course" value={entry.degree} onChange={(v) => update('degree', v)} />
              <TF label="Specialization" value={entry.specialization} onChange={(v) => update('specialization', v)} />
              <TF label="Start Year" value={entry.startYear} onChange={(v) => update('startYear', v)} />
              <TF label="End Year" value={entry.endYear} onChange={(v) => update('endYear', v)} />
            </div>
          )}

          {entry.type === 'ENTREPRENEURSHIP' && (
            <div className="grid sm:grid-cols-2 gap-4">
              <TF label="Business / Startup Name" value={entry.businessName} onChange={(v) => update('businessName', v)} />
              <TF label="Industry" value={entry.industry} onChange={(v) => update('industry', v)} />
              <TF label="Founder Role" value={entry.founderRole} onChange={(v) => update('founderRole', v)} />
              <TF label="Description" value={entry.description} onChange={(v) => update('description', v)} />
            </div>
          )}

          {entry.type === 'EXAM_PREPARATION' && (
            <div className="grid sm:grid-cols-2 gap-4">
              <TF label="Exam Name" value={entry.examName} onChange={(v) => update('examName', v)} />
              <div>
                <label className="label-text">Preparation Type</label>
                <select className="input-field" value={entry.preparationType} onChange={(e) => update('preparationType', e.target.value)}>
                  <option value="">Select</option>
                  {['Self Preparation', 'Coaching Institute', 'Online Coaching', 'Other'].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <TF label="Institution / Coaching Center" value={entry.examInstitution} onChange={(v) => update('examInstitution', v)} />
            </div>
          )}

          {entry.type === 'OTHER' && (
            <div className="grid sm:grid-cols-2 gap-4">
              <TF label="Activity Name" value={entry.activityName} onChange={(v) => update('activityName', v)} />
              <TF label="Description" value={entry.description} onChange={(v) => update('description', v)} />
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <TF label="Start Date" type="date" value={entry.startDate} onChange={(v) => update('startDate', v)} />
            <TF label="End Date" type="date" value={entry.endDate} onChange={(v) => update('endDate', v)} disabled={entry.currentlyActive} />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={entry.currentlyActive} onChange={(e) => update('currentlyActive', e.target.checked)} className="rounded border-surface-200" />
            Currently active / ongoing
          </label>

          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Saving…' : editEntry ? 'Update Entry' : 'Save Entry'}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditEntry(null); }} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {profile.careerEntries.length === 0 ? (
        <div className="card text-center py-10">
          <Briefcase className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No career journey entries yet. Add your first entry above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {profile.careerEntries.map((e) => <CareerEntryCard key={e.id} entry={e} onEdit={startEdit} onDelete={handleDelete} />)}
        </div>
      )}
    </div>
  );
}

function CareerEntryCard({ entry, onEdit, onDelete }) {
  const [showProofs, setShowProofs] = useState(false);
  const [docs, setDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  function toggleProofs() {
    if (!showProofs && docs.length === 0) {
      setLoadingDocs(true);
      api.get('/alumni/me/proofs').then(({ data }) => setDocs(data.filter((d) => d.careerEntryId === entry.id))).finally(() => setLoadingDocs(false));
    }
    setShowProofs((s) => !s);
  }

  const docTypes = CAREER_ENTRY_DOC_TYPES[entry.type] || ['OTHER'];

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <span className="badge bg-brand-50 text-brand-700 border border-brand-100 mb-2">
            {ENTRY_TYPES.find((t) => t.value === entry.type)?.label || entry.type}
          </span>
          <p className="font-medium text-slate-700">
            {entry.designation || entry.degree || entry.examName || entry.activityName || entry.businessName}
            {entry.organizationName && ` · ${entry.organizationName}`}
            {entry.institutionName && ` · ${entry.institutionName}`}
            {entry.industry && ` · ${entry.industry}`}
          </p>
          {entry.salaryPackage && <p className="text-xs text-slate-500 mt-0.5">Salary: {entry.salaryPackage}</p>}
          {entry.description && <p className="text-sm text-slate-500 mt-1">{entry.description}</p>}
          <p className="text-xs text-slate-400 mt-1">
            {entry.startDate || '—'} → {entry.currentlyActive ? 'Present' : entry.endDate || '—'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => onEdit(entry)} className="text-xs font-medium text-brand-700 hover:underline">Edit</button>
          <button onClick={toggleProofs} className="text-xs font-medium text-slate-500 hover:text-brand-700 flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" /> Proof
          </button>
          <button onClick={() => onDelete(entry.id)} className="text-rose-500 hover:text-rose-700"><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>

      {showProofs && (
        <div className="mt-4 pt-4 border-t border-surface-200">
          {loadingDocs ? <p className="text-xs text-slate-400">Loading…</p> : (
            <ProofUpload
              uploadUrl={`/alumni/me/career-entries/${entry.id}/proofs`}
              docTypes={docTypes}
              existingDocs={docs}
              onUploaded={(doc) => setDocs((d) => [...d, doc])}
              onDeleted={(id) => setDocs((d) => d.filter((doc) => doc.id !== id))}
              onUpdated={(updatedDoc) => setDocs((d) => d.map((doc) => doc.id === updatedDoc.id ? updatedDoc : doc))}
              label="Supporting Proof"
              optional={entry.type !== 'WORKING' && entry.type !== 'HIGHER_EDUCATION'}
            />
          )}
        </div>
      )}
    </div>
  );
}

function TF({ label, value, onChange, type = 'text', disabled = false }) {
  return (
    <div>
      <label className="label-text">{label}</label>
      <input type={type} className="input-field" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

// --- Skills & Links ---

function SkillsAndLinks({ profile, onChange }) {
  const [skillInput, setSkillInput] = useState('');
  const [links, setLinks] = useState({ linkedin: profile.linkedin || '', portfolio: profile.portfolio || '', website: profile.website || '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function addSkill(e) {
    e.preventDefault();
    if (!skillInput.trim()) return;
    await api.post('/alumni/me/skills', { name: skillInput.trim() });
    setSkillInput(''); onChange();
  }

  async function removeSkill(id) {
    await api.delete(`/alumni/me/skills/${id}`); onChange();
  }

  async function saveLinks(e) {
    e.preventDefault(); setSaving(true); setSaved(false);
    try { await api.patch('/alumni/me', links); setSaved(true); } finally { setSaving(false); }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="font-semibold text-slate-800 mb-4">Skills</h3>
        <form onSubmit={addSkill} className="flex gap-3 mb-4">
          <input className="input-field" placeholder="e.g. Python, Marketing, Data Analysis" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} />
          <button type="submit" className="btn-primary shrink-0"><Plus className="h-4 w-4" /> Add</button>
        </form>
        {profile.skills.length === 0 ? <p className="text-sm text-slate-500">No skills added yet.</p> : (
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((s) => (
              <span key={s.id} className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 text-brand-700 border border-brand-100 px-3 py-1.5 text-sm">
                {s.name}
                <button onClick={() => removeSkill(s.id)} className="text-brand-400 hover:text-rose-500"><Trash2 className="h-3.5 w-3.5" /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={saveLinks} className="card space-y-4">
        <h3 className="font-semibold text-slate-800">Social Links</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div><label className="label-text flex items-center gap-1.5"><Linkedin className="h-3.5 w-3.5" /> LinkedIn</label><input className="input-field" placeholder="https://linkedin.com/in/..." value={links.linkedin} onChange={(e) => setLinks((l) => ({ ...l, linkedin: e.target.value }))} /></div>
          <div><label className="label-text flex items-center gap-1.5"><Link2 className="h-3.5 w-3.5" /> Portfolio</label><input className="input-field" value={links.portfolio} onChange={(e) => setLinks((l) => ({ ...l, portfolio: e.target.value }))} /></div>
          <div><label className="label-text flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> Website</label><input className="input-field" value={links.website} onChange={(e) => setLinks((l) => ({ ...l, website: e.target.value }))} /></div>
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save Links'}</button>
          {saved && <span className="text-sm text-emerald-600">Saved!</span>}
        </div>
      </form>
    </div>
  );
}

// --- Mentorship & Privacy ---

const MENTOR_FIELDS = [
  { key: 'mentorCareerGuidance', label: 'Career Guidance' },
  { key: 'mentorHigherStudiesGuidance', label: 'Higher Studies Guidance' },
  { key: 'mentorExamPrepGuidance', label: 'Exam Preparation Guidance' },
  { key: 'mentorEntrepreneurshipGuidance', label: 'Entrepreneurship Guidance' },
  { key: 'mentorInternshipGuidance', label: 'Internship Guidance' },
];

function MentorshipAndPrivacy({ profile, onChange }) {
  const [form, setForm] = useState(() => {
    const initial = { profileVisibility: profile.profileVisibility };
    MENTOR_FIELDS.forEach((f) => (initial[f.key] = profile[f.key]));
    return initial;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save(e) {
    e.preventDefault(); setSaving(true); setSaved(false);
    try { await api.patch('/alumni/me', form); setSaved(true); onChange(); } finally { setSaving(false); }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <div className="card">
        <h3 className="font-semibold text-slate-800 mb-1">Mentorship Preferences</h3>
        <p className="text-sm text-slate-500 mb-4">Select areas where you're open to guiding students.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {MENTOR_FIELDS.map((f) => (
            <label key={f.key} className="flex items-center gap-3 rounded-xl border border-surface-200 px-4 py-3 cursor-pointer hover:border-brand-200">
              <input type="checkbox" checked={!!form[f.key]} onChange={() => setForm((p) => ({ ...p, [f.key]: !p[f.key] }))} className="h-4 w-4 rounded border-surface-300 text-brand-700" />
              <span className="text-sm font-medium text-slate-700">{f.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-slate-800 mb-1">Profile Visibility</h3>
        <p className="text-sm text-slate-500 mb-4">Choose who can view your profile in the alumni directory.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {[{ v: 'PUBLIC', icon: Eye, title: 'Public', desc: 'Visible to Students, Staff & Admin' }, { v: 'PRIVATE', icon: EyeOff, title: 'Private', desc: 'Visible only to Staff & Admin' }].map(({ v, icon: Icon, title, desc }) => (
            <label key={v} className={`flex items-start gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition ${form.profileVisibility === v ? 'border-brand-700 bg-brand-50' : 'border-surface-200 hover:border-brand-200'}`}>
              <input type="radio" name="visibility" className="mt-1" checked={form.profileVisibility === v} onChange={() => setForm((f) => ({ ...f, profileVisibility: v }))} />
              <span><span className="flex items-center gap-1.5 font-medium text-slate-700"><Icon className="h-4 w-4" /> {title}</span><p className="text-xs text-slate-500 mt-1">{desc}</p></span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save Preferences'}</button>
        {saved && <span className="text-sm text-emerald-600">Saved!</span>}
      </div>
    </form>
  );
}
