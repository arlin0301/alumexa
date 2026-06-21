import { useEffect, useState } from 'react';
import { Download, Search, FileText, X, ExternalLink } from 'lucide-react';
import api from '../../utils/api';
import { downloadFile } from '../../utils/download';
import AlumniTable from '../../components/AlumniTable';

const DOC_TYPE_LABELS = {
  DEGREE_CERTIFICATE: 'Degree Certificate', ALUMNI_ID: 'Alumni ID',
  EMPLOYMENT_PROOF: 'Employment Proof', ADMISSION_PROOF: 'Admission Proof',
  EMPLOYEE_ID: 'Employee ID', OFFER_LETTER: 'Offer Letter',
  EXPERIENCE_CERTIFICATE: 'Experience Certificate', STUDENT_ID: 'Student ID',
  ADMISSION_LETTER: 'Admission Letter', MARKSHEET: 'Marksheet',
  HALL_TICKET: 'Hall Ticket', REGISTRATION_RECEIPT: 'Registration Receipt',
  COACHING_PROOF: 'Coaching Proof', OTHER: 'Other Document',
};

export default function AllAlumni() {
  const [alumni, setAlumni] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({ search: '', departmentId: '', verificationStatus: '', batch: '' });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('details');

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
    api.get('/super-admin/alumni', { params }).then(({ data }) => setAlumni(data)).finally(() => setLoading(false));
  }

  function update(field, value) {
    setFilters((f) => ({ ...f, [field]: value }));
  }

  async function openProfile(id) {
    const { data } = await api.get(`/super-admin/alumni/${id}/full`);
    setSelected(data);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">All Alumni</h1>
          <p className="text-sm text-slate-500 mt-1">{alumni.length} record{alumni.length !== 1 ? 's' : ''} found</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => downloadFile('/super-admin/export/excel', 'all-departments-alumni.xlsx')}
            className="btn-primary"
          >
            <Download className="h-4 w-4" /> Export as Excel
          </button>
        </div>
      </div>

      <div className="card">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
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
          <AlumniTable alumni={alumni} renderActions={(a) => (
            <button onClick={() => openProfile(a.id)} className="text-xs text-brand-700 hover:underline">View</button>
          )} />
        )}
      {selected && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center px-2 sm:px-4 z-50">
          <div className="bg-white rounded-2xl shadow-sm border border-surface-200 p-4 sm:p-6 w-full max-w-lg max-h-[85vh] flex flex-col relative mx-2 sm:mx-0">
            <button onClick={() => { setSelected(null); setTab('details'); }} className="absolute top-3 right-3 sm:top-4 sm:right-4 text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-800">{selected.fullName}</h2>
            <p className="text-sm text-slate-500 mb-4">{selected.department?.name} · Batch {selected.batch} · {selected.degree}</p>

            <div className="flex gap-4 border-b border-surface-200 mb-4">
              <button onClick={() => setTab('details')} className={`pb-2 text-sm font-medium border-b-2 transition ${tab === 'details' ? 'text-brand-700 border-brand-700' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>
                Details
              </button>
              <button onClick={() => setTab('documents')} className={`pb-2 text-sm font-medium border-b-2 transition ${tab === 'documents' ? 'text-brand-700 border-brand-700' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>
                Documents
              </button>
            </div>

            <div className="overflow-y-auto flex-1 min-h-0 -mx-2 sm:-mx-0 px-2 sm:px-0">
              {tab === 'details' && (
                <div className="space-y-5">
                  {/* Verification */}
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Verification</p>
                    <div className="flex items-center gap-2">
                      <span className={`badge-${selected.verificationStatus === 'VERIFIED' ? 'success' : selected.verificationStatus === 'REJECTED' ? 'danger' : 'pending'}`}>
                        {selected.verificationStatus}
                      </span>
                      {selected.rejectionReason && <span className="text-xs text-rose-600">— {selected.rejectionReason}</span>}
                    </div>
                  </div>

                  {/* Current Status */}
                  <div>
                    <p className="text-xs text-slate-400 mb-1.5">Current Status</p>
                    <p className="text-sm font-medium text-slate-700">{selected.currentStatus}</p>
                    {selected.currentStatus === 'WORKING' && (
                      <div className="mt-1 space-y-0.5 text-sm text-slate-500">
                        {selected.employmentSector && <p>Sector: {selected.employmentSector}</p>}
                        {selected.organizationName && <p>{selected.designation} at {selected.organizationName}</p>}
                        {selected.location && <p>Location: {selected.location}</p>}
                        {selected.employmentType && <p>Type: {selected.employmentType}</p>}
                        {selected.salaryPackage && <p>Package: {selected.salaryPackage}</p>}
                      </div>
                    )}
                    {selected.currentStatus === 'HIGHER_EDUCATION' && (
                      <div className="mt-1 space-y-0.5 text-sm text-slate-500">
                        <p>{selected.degreePursuing} at {selected.institutionName}</p>
                        {selected.specialization && <p>Specialization: {selected.specialization}</p>}
                        {selected.startYear && <p>{selected.startYear} – {selected.expectedCompletionYear || 'Ongoing'}</p>}
                      </div>
                    )}
                    {selected.currentStatus === 'EXAM_PREPARATION' && (
                      <div className="mt-1 space-y-0.5 text-sm text-slate-500">
                        <p>Exam: {selected.examName}</p>
                        {selected.preparationType && <p>Prep: {selected.preparationType}</p>}
                        {selected.examStartYear && <p>{selected.examStartYear} – {selected.expectedExamYear || 'Ongoing'}</p>}
                      </div>
                    )}
                    {selected.currentStatus === 'OTHERS' && (
                      <div className="mt-1 space-y-0.5 text-sm text-slate-500">
                        <p>Activity: {selected.activityName}</p>
                        {selected.description && <p>{selected.description}</p>}
                      </div>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-slate-400">Register No.</p>
                      <p className="text-slate-700 font-medium">{selected.registerNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Batch</p>
                      <p className="text-slate-700 font-medium">{selected.batch}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Mobile</p>
                      <p className="text-slate-700 font-medium">{selected.mobile}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Email</p>
                      <p className="text-slate-700 font-medium truncate">{selected.email}</p>
                    </div>
                  </div>

                  {/* Degree Details */}
                  {selected.degreeType && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Degree Details</p>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm text-slate-600">
                        <p>Type: {selected.degreeType}</p>
                        {selected.degreeCustomName && <p>Custom: {selected.degreeCustomName}</p>}
                        {selected.degreeSpecialization && <p className="col-span-2">Specialization: {selected.degreeSpecialization}</p>}
                        {selected.degreeInstitution && <p className="col-span-2">Institution: {selected.degreeInstitution}</p>}
                      </div>
                    </div>
                  )}

                  {/* Personal Info */}
                  {(selected.dateOfBirth || selected.addressLine1) && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Personal Info</p>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm text-slate-600">
                        {selected.dateOfBirth && <p>DOB: {selected.dateOfBirth}</p>}
                        {selected.city && <p>City: {selected.city}</p>}
                        {selected.state && <p>State: {selected.state}</p>}
                        {selected.country && <p>Country: {selected.country}</p>}
                      </div>
                      {selected.addressLine1 && (
                        <p className="text-sm text-slate-600 mt-1">
                          {selected.addressLine1}{selected.addressLine2 ? `, ${selected.addressLine2}` : ''}
                          {selected.district ? `, ${selected.district}` : ''} — {selected.pinCode || ''}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Social / Online */}
                  {(selected.linkedin || selected.portfolio || selected.website) && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Online Profiles</p>
                      <div className="space-y-0.5 text-sm">
                        {selected.linkedin && <p className="truncate"><span className="text-slate-400">LinkedIn:</span> <span className="text-slate-600">{selected.linkedin}</span></p>}
                        {selected.portfolio && <p className="truncate"><span className="text-slate-400">Portfolio:</span> <span className="text-slate-600">{selected.portfolio}</span></p>}
                        {selected.website && <p className="truncate"><span className="text-slate-400">Website:</span> <span className="text-slate-600">{selected.website}</span></p>}
                      </div>
                    </div>
                  )}

                  {/* Mentorship Preferences */}
                  {(selected.mentorCareerGuidance || selected.mentorHigherStudiesGuidance || selected.mentorExamPrepGuidance || selected.mentorEntrepreneurshipGuidance || selected.mentorInternshipGuidance) && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Mentorship Preferences</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.mentorCareerGuidance && <span className="text-xs rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1">Career Guidance</span>}
                        {selected.mentorHigherStudiesGuidance && <span className="text-xs rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1">Higher Studies</span>}
                        {selected.mentorExamPrepGuidance && <span className="text-xs rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1">Exam Prep</span>}
                        {selected.mentorEntrepreneurshipGuidance && <span className="text-xs rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1">Entrepreneurship</span>}
                        {selected.mentorInternshipGuidance && <span className="text-xs rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1">Internship</span>}
                      </div>
                    </div>
                  )}

                  {/* Profile Visibility */}
                  {selected.profileVisibility && (
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">Profile Visibility</p>
                      <p className="text-sm text-slate-700">{selected.profileVisibility}</p>
                    </div>
                  )}

                  {/* Skills */}
                  {selected.skills?.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1.5">Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.skills.map((s, i) => <span key={i} className="text-xs rounded-full bg-brand-50 text-brand-700 border border-brand-100 px-2.5 py-1">{typeof s === 'string' ? s : s.name}</span>)}
                      </div>
                    </div>
                  )}

                  {/* Career / Education Entries */}
                  {selected.careerEntries?.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1.5">Career / Education Entries</p>
                      <div className="space-y-3 text-sm">
                        {selected.careerEntries.map((e) => (
                          <div key={e.id} className="p-3 rounded-lg border border-surface-200">
                            <p className="font-medium text-slate-700">{e.type}</p>
                            {e.organizationName && <p className="text-slate-500">{e.designation} · {e.organizationName}</p>}
                            {e.institutionName && <p className="text-slate-500">{e.degree} · {e.institutionName}</p>}
                            {e.currentlyActive && <span className="text-xs text-emerald-600 font-medium">Current</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {tab === 'documents' && (
                <div className="space-y-3">
                  {(() => {
                    const allDocs = [
                      ...(selected.proofDocuments || []).map((d) => ({ ...d, context: 'Profile' })),
                      ...(selected.careerEntries || []).flatMap((e) =>
                        (e.proofDocuments || []).map((d) => ({ ...d, context: e.organizationName || e.institutionName || e.type }))
                      ),
                    ];
                    return allDocs.length === 0 ? (
                      <p className="text-sm text-slate-500 py-6 text-center">No documents uploaded.</p>
                    ) : (
                      allDocs.sort((a, b) => new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0)).map((doc) => (
                        <div key={doc.id} className="rounded-xl border border-surface-200 bg-surface-50 px-3.5 py-3 space-y-1.5">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="h-8 w-8 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
                                <FileText className="h-4 w-4 text-brand-700" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-700 truncate">{doc.originalName}</p>
                                <p className="text-xs text-slate-400">
                                  {DOC_TYPE_LABELS[doc.docType] || doc.docType}
                                  {doc.context !== 'Profile' && <span> · {doc.context}</span>}
                                  {doc.uploadedAt && <span> · {new Date(doc.uploadedAt).toLocaleDateString('en-IN')}</span>}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => {
                                  const token = localStorage.getItem('alumexa_token');
                                  window.open(`/api/super-admin/proofs/${doc.id}/download?token=${token}`, '_blank');
                                }}
                                className="flex items-center gap-1 text-xs text-brand-700 hover:underline font-medium"
                              >
                                <ExternalLink className="h-3 w-3" /> View
                              </button>
                              <button
                                onClick={() => downloadFile(`/super-admin/proofs/${doc.id}/download`, doc.originalName)}
                                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
                              >
                                <Download className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          {doc.description && (
                            <p className="text-xs text-slate-600 italic pl-10">"{doc.description}"</p>
                          )}
                        </div>
                      ))
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
