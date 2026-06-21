import { useEffect, useState } from 'react';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../utils/api';

const DEGREE_TYPES = [
  { value: 'UG', label: 'Undergraduate (UG)' },
  { value: 'PG', label: 'Postgraduate (PG)' },
  { value: 'MPHIL', label: 'M.Phil' },
  { value: 'PHD', label: 'PhD' },
  { value: 'MULTIPLE', label: 'Multiple Degrees' },
  { value: 'OTHER', label: 'Other' },
];

const CURRENT_STATUSES = [
  { value: 'WORKING', label: 'Working' },
  { value: 'HIGHER_EDUCATION', label: 'Higher Education' },
  { value: 'ENTREPRENEURSHIP', label: 'Entrepreneurship' },
  { value: 'EXAM_PREPARATION', label: 'Competitive Exam Preparation' },
  { value: 'OTHERS', label: 'Other Activities' },
];

const EMPLOYMENT_TYPES = [
  { value: 'PRIVATE', label: 'Private Sector' },
  { value: 'PUBLIC_GOVT', label: 'Public Sector / Government' },
  { value: 'OTHER', label: 'Other' },
];

const SALARY_RANGES = [
  '₹2 LPA', '₹3 LPA', '₹4 LPA', '₹5 LPA', '₹6 LPA', '₹8 LPA',
  '₹10 LPA', '₹12 LPA', '₹15 LPA', '₹18 LPA', '₹20 LPA+', 'Prefer not to say',
];

export default function InformationTab({ profile, departments, onChange }) {
  const [basicForm, setBasicForm] = useState(null);
  const [statusForm, setStatusForm] = useState(null);
  const [basicSaving, setBasicSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [basicMsg, setBasicMsg] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    setBasicForm({
      fullName: profile.fullName || '',
      mobile: profile.mobile || '',
      email: profile.email || '',
      batch: profile.batch || '',
      departmentId: profile.departmentId || '',
      degreeType: profile.degreeType || profile.degree || '',
      degreeCustomName: profile.degreeCustomName || '',
      degreeSpecialization: profile.degreeSpecialization || '',
      degreeInstitution: profile.degreeInstitution || '',
      dateOfBirth: profile.dateOfBirth || '',
      addressLine1: profile.addressLine1 || '',
      addressLine2: profile.addressLine2 || '',
      city: profile.city || '',
      district: profile.district || '',
      state: profile.state || '',
      country: profile.country || 'India',
      pinCode: profile.pinCode || '',
    });

    setStatusForm({
      currentStatus: profile.currentStatus || '',
      employmentType: profile.employmentType || '',
      organizationName: profile.organizationName || '',
      designation: profile.designation || '',
      location: profile.location || '',
      salaryPackage: profile.salaryPackage || '',
      institutionName: profile.institutionName || '',
      degreePursuing: profile.degreePursuing || '',
      specialization: profile.specialization || '',
      startYear: profile.startYear || '',
      expectedCompletionYear: profile.expectedCompletionYear || '',
      businessName: profile.businessName || profile.organizationName || '',
      industry: profile.industry || '',
      founderRole: profile.founderRole || profile.designation || '',
      examName: profile.examName || '',
      preparationType: profile.preparationType || '',
      examInstitutionName: profile.examInstitutionName || '',
      examStartYear: profile.examStartYear || '',
      expectedExamYear: profile.expectedExamYear || '',
      activityName: profile.activityName || '',
      description: profile.description || '',
    });
  }, [profile]);

  function updateBasic(field, value) {
    setBasicForm((f) => ({ ...f, [field]: value }));
  }

  function updateStatus(field, value) {
    setStatusForm((f) => ({ ...f, [field]: value }));
  }

  async function saveBasicInfo(e) {
    e.preventDefault();
    setBasicSaving(true);
    setBasicMsg(null);
    try {
      await api.patch('/alumni/me/basic-info', basicForm);
      setBasicMsg({ type: 'success', text: 'Basic information updated successfully.' });
      onChange();
    } catch (err) {
      setBasicMsg({ type: 'error', text: err.response?.data?.message || 'Failed to save.' });
    } finally {
      setBasicSaving(false);
    }
  }

  async function saveCurrentStatus(e) {
    e.preventDefault();
    setStatusSaving(true);
    setStatusMsg(null);
    try {
      await api.patch('/alumni/me/current-status', statusForm);
      setStatusMsg({ type: 'success', text: 'Current status updated successfully.' });
      onChange();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Failed to save.' });
    } finally {
      setStatusSaving(false);
    }
  }

  if (!basicForm || !statusForm) return null;

  return (
    <div className="space-y-6">

      {/* Basic Information */}
      <form onSubmit={saveBasicInfo} className="card space-y-6">
        <SectionHeading title="Basic Information" subtitle="Update your personal and contact details." />

        <Msg msg={basicMsg} />

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Full Name" required>
            <input className="input-field" value={basicForm.fullName} onChange={(e) => updateBasic('fullName', e.target.value)} />
          </Field>
          <Field label="Date of Birth">
            <input type="date" className="input-field" value={basicForm.dateOfBirth} onChange={(e) => updateBasic('dateOfBirth', e.target.value)} />
          </Field>
          <Field label="Mobile Number">
            <input className="input-field" value={basicForm.mobile} onChange={(e) => updateBasic('mobile', e.target.value)} />
          </Field>
          <Field label="Email ID">
            <input type="email" className="input-field" value={basicForm.email} onChange={(e) => updateBasic('email', e.target.value)} />
          </Field>
          <Field label="Department">
            <select className="input-field" value={basicForm.departmentId} onChange={(e) => updateBasic('departmentId', e.target.value)}>
              <option value="">Select department</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </Field>
          <Field label="Batch / Year of Passing">
            <input className="input-field" placeholder="e.g. 2022" value={basicForm.batch} onChange={(e) => updateBasic('batch', e.target.value)} />
          </Field>
        </div>

        {/* Degree Structure */}
        <div className="pt-2 border-t border-surface-200">
          <p className="text-sm font-semibold text-slate-700 mb-3">Degree Details</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Degree Type">
              <select className="input-field" value={basicForm.degreeType} onChange={(e) => updateBasic('degreeType', e.target.value)}>
                <option value="">Select type</option>
                {DEGREE_TYPES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </Field>
            {basicForm.degreeType === 'OTHER' && (
              <Field label="Custom Degree Name">
                <input className="input-field" value={basicForm.degreeCustomName} onChange={(e) => updateBasic('degreeCustomName', e.target.value)} />
              </Field>
            )}
            <Field label="Specialization">
              <input className="input-field" placeholder="e.g. B.Sc Computer Science" value={basicForm.degreeSpecialization} onChange={(e) => updateBasic('degreeSpecialization', e.target.value)} />
            </Field>
            <Field label="Institution / College Name">
              <input className="input-field" value={basicForm.degreeInstitution} onChange={(e) => updateBasic('degreeInstitution', e.target.value)} />
            </Field>
          </div>
        </div>

        {/* Residential Address */}
        <div className="pt-2 border-t border-surface-200">
          <p className="text-sm font-semibold text-slate-700 mb-3">Residential Address</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Address Line 1" className="sm:col-span-2">
              <input className="input-field" value={basicForm.addressLine1} onChange={(e) => updateBasic('addressLine1', e.target.value)} />
            </Field>
            <Field label="Address Line 2">
              <input className="input-field" placeholder="Optional" value={basicForm.addressLine2} onChange={(e) => updateBasic('addressLine2', e.target.value)} />
            </Field>
            <Field label="City / Town">
              <input className="input-field" value={basicForm.city} onChange={(e) => updateBasic('city', e.target.value)} />
            </Field>
            <Field label="District">
              <input className="input-field" value={basicForm.district} onChange={(e) => updateBasic('district', e.target.value)} />
            </Field>
            <Field label="State">
              <input className="input-field" value={basicForm.state} onChange={(e) => updateBasic('state', e.target.value)} />
            </Field>
            <Field label="Country">
              <input className="input-field" value={basicForm.country} onChange={(e) => updateBasic('country', e.target.value)} />
            </Field>
            <Field label="PIN / ZIP Code">
              <input className="input-field" value={basicForm.pinCode} onChange={(e) => updateBasic('pinCode', e.target.value)} />
            </Field>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={basicSaving} className="btn-primary">
            <Save className="h-4 w-4" /> {basicSaving ? 'Saving…' : 'Save Basic Information'}
          </button>
        </div>
      </form>

      {/* Current Status */}
      <form onSubmit={saveCurrentStatus} className="card space-y-5">
        <SectionHeading
          title="Current Status & Position"
          subtitle="Update your current professional status at any time. You can switch between Working, Higher Education, Entrepreneurship, and other options."
        />

        <Msg msg={statusMsg} />

        <div>
          <label className="label-text">Current Status</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CURRENT_STATUSES.map((s) => (
              <button
                type="button"
                key={s.value}
                onClick={() => updateStatus('currentStatus', s.value)}
                className={`rounded-xl border-2 px-4 py-3 text-sm font-medium text-left transition ${
                  statusForm.currentStatus === s.value
                    ? 'border-brand-700 bg-brand-50 text-brand-800'
                    : 'border-surface-200 text-slate-600 hover:border-brand-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conditional status fields */}
        {statusForm.currentStatus === 'WORKING' && (
          <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-surface-200">
            <p className="sm:col-span-2 text-sm font-semibold text-slate-700">Current Position Details</p>
            <Field label="Organization Name">
              <input className="input-field" value={statusForm.organizationName} onChange={(e) => updateStatus('organizationName', e.target.value)} />
            </Field>
            <Field label="Designation">
              <input className="input-field" value={statusForm.designation} onChange={(e) => updateStatus('designation', e.target.value)} />
            </Field>
            <Field label="Employment Type">
              <select className="input-field" value={statusForm.employmentType} onChange={(e) => updateStatus('employmentType', e.target.value)}>
                <option value="">Select type</option>
                {EMPLOYMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Field>
            <Field label="Salary Package">
              <select className="input-field" value={statusForm.salaryPackage} onChange={(e) => updateStatus('salaryPackage', e.target.value)}>
                <option value="">Select range</option>
                {SALARY_RANGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Location">
              <input className="input-field" value={statusForm.location} onChange={(e) => updateStatus('location', e.target.value)} />
            </Field>
          </div>
        )}

        {statusForm.currentStatus === 'HIGHER_EDUCATION' && (
          <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-surface-200">
            <p className="sm:col-span-2 text-sm font-semibold text-slate-700">Higher Education Details</p>
            <Field label="Institution Name">
              <input className="input-field" value={statusForm.institutionName} onChange={(e) => updateStatus('institutionName', e.target.value)} />
            </Field>
            <Field label="Degree Pursuing">
              <input className="input-field" value={statusForm.degreePursuing} onChange={(e) => updateStatus('degreePursuing', e.target.value)} />
            </Field>
            <Field label="Specialization">
              <input className="input-field" value={statusForm.specialization} onChange={(e) => updateStatus('specialization', e.target.value)} />
            </Field>
            <Field label="Start Year">
              <input className="input-field" value={statusForm.startYear} onChange={(e) => updateStatus('startYear', e.target.value)} />
            </Field>
            <Field label="Expected Completion Year">
              <input className="input-field" value={statusForm.expectedCompletionYear} onChange={(e) => updateStatus('expectedCompletionYear', e.target.value)} />
            </Field>
          </div>
        )}

        {statusForm.currentStatus === 'ENTREPRENEURSHIP' && (
          <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-surface-200">
            <p className="sm:col-span-2 text-sm font-semibold text-slate-700">Entrepreneurship Details</p>
            <Field label="Business / Startup Name">
              <input className="input-field" value={statusForm.businessName} onChange={(e) => updateStatus('businessName', e.target.value)} />
            </Field>
            <Field label="Industry">
              <input className="input-field" value={statusForm.industry} onChange={(e) => updateStatus('industry', e.target.value)} />
            </Field>
            <Field label="Founder Role">
              <input className="input-field" placeholder="e.g. Co-Founder, CEO" value={statusForm.founderRole} onChange={(e) => updateStatus('founderRole', e.target.value)} />
            </Field>
          </div>
        )}

        {statusForm.currentStatus === 'EXAM_PREPARATION' && (
          <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-surface-200">
            <p className="sm:col-span-2 text-sm font-semibold text-slate-700">Exam Preparation Details</p>
            <Field label="Exam Name">
              <input className="input-field" value={statusForm.examName} onChange={(e) => updateStatus('examName', e.target.value)} />
            </Field>
            <Field label="Preparation Type">
              <select className="input-field" value={statusForm.preparationType} onChange={(e) => updateStatus('preparationType', e.target.value)}>
                <option value="">Select type</option>
                {['Self Preparation', 'Coaching Institute', 'Online Coaching', 'Other'].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Institution / Coaching Center">
              <input className="input-field" value={statusForm.examInstitutionName} onChange={(e) => updateStatus('examInstitutionName', e.target.value)} />
            </Field>
            <Field label="Start Year">
              <input className="input-field" value={statusForm.examStartYear} onChange={(e) => updateStatus('examStartYear', e.target.value)} />
            </Field>
            <Field label="Expected Exam Year">
              <input className="input-field" value={statusForm.expectedExamYear} onChange={(e) => updateStatus('expectedExamYear', e.target.value)} />
            </Field>
          </div>
        )}

        {statusForm.currentStatus === 'OTHERS' && (
          <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-surface-200">
            <p className="sm:col-span-2 text-sm font-semibold text-slate-700">Activity Details</p>
            <Field label="Activity Name">
              <input className="input-field" placeholder="e.g. Freelancer, Research, NGO" value={statusForm.activityName} onChange={(e) => updateStatus('activityName', e.target.value)} />
            </Field>
            <Field label="Description">
              <textarea className="input-field" rows={3} value={statusForm.description} onChange={(e) => updateStatus('description', e.target.value)} />
            </Field>
          </div>
        )}

        <div className="flex justify-end">
          <button type="submit" disabled={statusSaving} className="btn-primary">
            <Save className="h-4 w-4" /> {statusSaving ? 'Saving…' : 'Save Current Status'}
          </button>
        </div>
      </form>
    </div>
  );
}

function SectionHeading({ title, subtitle }) {
  return (
    <div>
      <h3 className="font-semibold text-slate-800">{title}</h3>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="label-text">{label} {required && <span className="text-rose-500">*</span>}</label>
      {children}
    </div>
  );
}

function Msg({ msg }) {
  if (!msg) return null;
  return (
    <div className={`flex items-start gap-2 rounded-xl border px-3.5 py-3 text-sm ${
      msg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
    }`}>
      {msg.type === 'success' ? <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" /> : <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />}
      <span>{msg.text}</span>
    </div>
  );
}
