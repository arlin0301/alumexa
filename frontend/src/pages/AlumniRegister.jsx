import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, AlertCircle, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';
import api from '../utils/api';
import StepIndicator from '../components/StepIndicator';
import ProofUpload from '../components/ProofUpload';

const STEPS = ['Personal Details', 'Contact & Status', 'Status Details', 'Account', 'Documents'];

const DEGREES = [
  { value: 'UG', label: 'Undergraduate (UG)' },
  { value: 'PG', label: 'Postgraduate (PG)' },
  { value: 'MPHIL', label: 'M.Phil' },
  { value: 'PHD', label: 'PhD' },
];

const STATUSES = [
  { value: 'WORKING', label: 'Working' },
  { value: 'HIGHER_EDUCATION', label: 'Higher Education' },
  { value: 'EXAM_PREPARATION', label: 'Exam Preparation' },
  { value: 'OTHERS', label: 'Others' },
];

const EMPLOYMENT_SECTORS = ['Public Sector', 'Private Sector', 'Other'];
const PREP_TYPES = ['Self Preparation', 'Coaching Institute', 'Online Coaching', 'Other'];

const initialForm = {
  fullName: '', registerNumber: '', batch: '', departmentId: '', degree: '',
  mobile: '', email: '', currentStatus: '',
  employmentSector: '', organizationName: '', designation: '', location: '', otherSectorDetails: '',
  institutionName: '', degreePursuing: '', specialization: '', startYear: '', expectedCompletionYear: '',
  examName: '', preparationType: '', examInstitutionName: '', examStartYear: '', expectedExamYear: '',
  activityName: '', description: '',
  username: '', password: '', confirmPassword: '',
};

export default function AlumniRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registeredToken, setRegisteredToken] = useState(null);
  const [uploadedDocs, setUploadedDocs] = useState([]);

  useEffect(() => {
    api.get('/departments').then(({ data }) => setDepartments(data)).catch(() => {});
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validateStep() {
    setError('');
    if (step === 1) {
      if (!form.fullName || !form.registerNumber || !form.batch || !form.departmentId || !form.degree) {
        setError('Please fill in all required personal details.');
        return false;
      }
    } else if (step === 2) {
      if (!form.mobile || !form.email || !form.currentStatus) {
        setError('Please fill in your contact details and select your current status.');
        return false;
      }
    } else if (step === 3) {
      if (form.currentStatus === 'WORKING' && (!form.employmentSector || !form.organizationName || !form.designation)) {
        setError('Please fill in employment sector, organization name and designation.');
        return false;
      }
      if (form.currentStatus === 'HIGHER_EDUCATION' && (!form.institutionName || !form.degreePursuing || !form.startYear || !form.expectedCompletionYear)) {
        setError('Please fill in institution, degree pursuing, start year and expected completion year.');
        return false;
      }
      if (form.currentStatus === 'EXAM_PREPARATION' && (!form.examName || !form.examStartYear || !form.expectedExamYear)) {
        setError('Please fill in exam name, start year and expected exam year.');
        return false;
      }
      if (form.currentStatus === 'OTHERS' && (!form.activityName || !form.description)) {
        setError('Please fill in activity name and description.');
        return false;
      }
    }
    return true;
  }

  function next() {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, STEPS.length));
  }

  function back() {
    setError('');
    setStep((s) => Math.max(s - 1, 1));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateStep()) return;

    if (!form.username || !form.password || !form.confirmPassword) {
      setError('Please fill in your login credentials.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const { data } = await api.post('/alumni/register', form);
      if (data.token) {
        localStorage.setItem('alumexa_reg_token', data.token);
        setRegisteredToken(data.token);
      }
      setStep(5); // Go to Documents step
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
          <h1 className="text-xl font-bold text-slate-800 mb-2">All done!</h1>
          <p className="text-sm text-slate-500 mb-6">
            Your alumni profile is <span className="badge-pending inline-flex">Pending Verification</span>.
            A staff admin from your department will review your details and uploaded documents.
            You'll be able to log in once verified.
          </p>
          <Link to="/login" className="btn-primary w-full">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-6">
          <GraduationCap className="h-7 w-7 text-brand-700" />
          <span className="text-xl font-bold text-slate-800">Alumexa</span>
        </div>

        <div className="card">
          <h1 className="text-xl font-bold text-slate-800 mb-1">Alumni Registration</h1>
          <p className="text-sm text-slate-500 mb-6">Step {step} of {STEPS.length} — {STEPS[step - 1]}</p>

          <StepIndicator steps={STEPS} currentStep={step} />

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-3 text-sm text-rose-700">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4">
                <Field label="Full Name" required>
                  <input className="input-field" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} />
                </Field>
                <Field label="Register Number" required>
                  <input className="input-field" value={form.registerNumber} onChange={(e) => update('registerNumber', e.target.value)} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Batch / Year of Passing" required>
                    <input className="input-field" placeholder="e.g. 2022" value={form.batch} onChange={(e) => update('batch', e.target.value)} />
                  </Field>
                  <Field label="Degree" required>
                    <select className="input-field" value={form.degree} onChange={(e) => update('degree', e.target.value)}>
                      <option value="">Select degree</option>
                      {DEGREES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Department" required>
                  <select className="input-field" value={form.departmentId} onChange={(e) => update('departmentId', e.target.value)}>
                    <option value="">Select department</option>
                    {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  {departments.length === 0 && (
                    <p className="text-xs text-slate-400 mt-1.5">
                      No departments available yet. Please contact your college administrator.
                    </p>
                  )}
                </Field>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Mobile Number" required>
                    <input className="input-field" value={form.mobile} onChange={(e) => update('mobile', e.target.value)} />
                  </Field>
                  <Field label="Email ID" required>
                    <input type="email" className="input-field" value={form.email} onChange={(e) => update('email', e.target.value)} />
                  </Field>
                </div>

                <Field label="Current Status" required>
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    {STATUSES.map((s) => (
                      <button
                        type="button"
                        key={s.value}
                        onClick={() => update('currentStatus', s.value)}
                        className={`rounded-xl border-2 px-4 py-3 text-sm font-medium text-left transition ${
                          form.currentStatus === s.value
                            ? 'border-brand-700 bg-brand-50 text-brand-800'
                            : 'border-surface-200 text-slate-600 hover:border-brand-200'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                {form.currentStatus === 'WORKING' && (
                  <>
                    <Field label="Employment Sector" required>
                      <select className="input-field" value={form.employmentSector} onChange={(e) => update('employmentSector', e.target.value)}>
                        <option value="">Select sector</option>
                        {EMPLOYMENT_SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </Field>
                    <Field label="Organization Name" required>
                      <input className="input-field" value={form.organizationName} onChange={(e) => update('organizationName', e.target.value)} />
                    </Field>
                    <Field label="Designation" required>
                      <input className="input-field" value={form.designation} onChange={(e) => update('designation', e.target.value)} />
                    </Field>
                    <Field label="Location">
                      <input className="input-field" value={form.location} onChange={(e) => update('location', e.target.value)} />
                    </Field>
                    {form.employmentSector === 'Other' && (
                      <Field label="Description">
                        <textarea className="input-field" rows={3} value={form.otherSectorDetails} onChange={(e) => update('otherSectorDetails', e.target.value)} />
                      </Field>
                    )}
                  </>
                )}

                {form.currentStatus === 'HIGHER_EDUCATION' && (
                  <>
                    <Field label="Institution Name" required>
                      <input className="input-field" value={form.institutionName} onChange={(e) => update('institutionName', e.target.value)} />
                    </Field>
                    <Field label="Degree Pursuing" required>
                      <input className="input-field" value={form.degreePursuing} onChange={(e) => update('degreePursuing', e.target.value)} />
                    </Field>
                    <Field label="Specialization">
                      <input className="input-field" value={form.specialization} onChange={(e) => update('specialization', e.target.value)} />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Start Year" required>
                        <input className="input-field" value={form.startYear} onChange={(e) => update('startYear', e.target.value)} />
                      </Field>
                      <Field label="Expected Completion Year" required>
                        <input className="input-field" value={form.expectedCompletionYear} onChange={(e) => update('expectedCompletionYear', e.target.value)} />
                      </Field>
                    </div>
                  </>
                )}

                {form.currentStatus === 'EXAM_PREPARATION' && (
                  <>
                    <Field label="Exam Name" required>
                      <input className="input-field" value={form.examName} onChange={(e) => update('examName', e.target.value)} />
                    </Field>
                    <Field label="Preparation Type">
                      <select className="input-field" value={form.preparationType} onChange={(e) => update('preparationType', e.target.value)}>
                        <option value="">Select type</option>
                        {PREP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </Field>
                    <Field label="Institution Name (Optional)">
                      <input className="input-field" value={form.examInstitutionName} onChange={(e) => update('examInstitutionName', e.target.value)} />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Start Year" required>
                        <input className="input-field" value={form.examStartYear} onChange={(e) => update('examStartYear', e.target.value)} />
                      </Field>
                      <Field label="Expected Exam Year" required>
                        <input className="input-field" value={form.expectedExamYear} onChange={(e) => update('expectedExamYear', e.target.value)} />
                      </Field>
                    </div>
                  </>
                )}

                {form.currentStatus === 'OTHERS' && (
                  <>
                    <Field label="Activity Name" required>
                      <input className="input-field" placeholder="e.g. Entrepreneur, Freelancer, Research" value={form.activityName} onChange={(e) => update('activityName', e.target.value)} />
                    </Field>
                    <Field label="Description" required>
                      <textarea className="input-field" rows={4} value={form.description} onChange={(e) => update('description', e.target.value)} />
                    </Field>
                  </>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <Field label="Username" required>
                  <input className="input-field" value={form.username} onChange={(e) => update('username', e.target.value)} />
                </Field>
                <Field label="Password" required>
                  <input type="password" className="input-field" value={form.password} onChange={(e) => update('password', e.target.value)} />
                </Field>
                <Field label="Confirm Password" required>
                  <input type="password" className="input-field" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} />
                </Field>
                <p className="text-xs text-slate-400">
                  After submitting you'll be taken to an optional document upload step,
                  then your registration will be marked <span className="font-medium">Pending Verification</span>.
                </p>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <div className="rounded-xl bg-brand-50 border border-brand-200 px-4 py-3">
                  <p className="text-sm font-semibold text-brand-800 mb-1">Registration submitted!</p>
                  <p className="text-sm text-brand-700">
                    You can now upload supporting documents to help the staff admin verify your registration faster.
                    All uploads are optional — you can also skip and upload later from your profile.
                  </p>
                </div>

                <ProofUpload
                  uploadUrl="/alumni/me/proofs"
                  docTypes={getRegistrationDocTypes(form.currentStatus)}
                  existingDocs={uploadedDocs}
                  onUploaded={(doc) => setUploadedDocs((d) => [...d, doc])}
                  onDeleted={(id) => setUploadedDocs((d) => d.filter((doc) => doc.id !== id))}
                  onUpdated={(updatedDoc) => setUploadedDocs((d) => d.map((doc) => doc.id === updatedDoc.id ? updatedDoc : doc))}
                  label="Verification Documents"
                  optional={true}
                />

                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400">{uploadedDocs.length} document{uploadedDocs.length !== 1 ? 's' : ''} uploaded</p>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem('alumexa_reg_token');
                      setSuccess(true);
                    }}
                    className="btn-primary"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Finish Registration
                  </button>
                </div>
              </div>
            )}

            {step < 5 && (
              <div className="flex items-center justify-between mt-8">
                {step > 1 ? (
                  <button type="button" onClick={back} className="btn-secondary">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                ) : <span />}

                {step < 4 ? (
                  <button type="button" onClick={next} className="btn-primary">
                    Next <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button type="submit" disabled={submitting} className="btn-accent">
                    {submitting ? 'Submitting…' : 'Submit Registration'}
                  </button>
                )}
              </div>
            )}
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

function Field({ label, required, children }) {
  return (
    <div>
      <label className="label-text">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function getRegistrationDocTypes(currentStatus) {
  const base = ['DEGREE_CERTIFICATE', 'ALUMNI_ID', 'OTHER'];
  if (currentStatus === 'WORKING') return [...base, 'EMPLOYMENT_PROOF'];
  if (currentStatus === 'HIGHER_EDUCATION') return [...base, 'ADMISSION_PROOF'];
  if (currentStatus === 'EXAM_PREPARATION') return [...base, 'ADMISSION_PROOF'];
  return base;
}
