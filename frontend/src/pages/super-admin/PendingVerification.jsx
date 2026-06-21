import { useEffect, useState } from 'react';
import { Check, X, Download, ClipboardCheck, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../utils/api';
import { downloadFile } from '../../utils/download';

const STATUS_LABELS = {
  WORKING: 'Working',
  HIGHER_EDUCATION: 'Higher Education',
  EXAM_PREPARATION: 'Exam Preparation',
  OTHERS: 'Others',
};

export default function PendingVerification() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    api.get('/super-admin/pending').then(({ data }) => setPending(data)).finally(() => setLoading(false));
  }

  async function approve(id) {
    setActionLoading(id);
    try {
      await api.patch(`/super-admin/alumni/${id}/approve`);
      load();
    } finally {
      setActionLoading(null);
    }
  }

  function openReject(profile) {
    setRejectTarget(profile);
    setRejectReason('');
  }

  async function confirmReject() {
    if (!rejectTarget) return;
    setActionLoading(rejectTarget.id);
    try {
      await api.patch(`/super-admin/alumni/${rejectTarget.id}/reject`, { reason: rejectReason });
      setRejectTarget(null);
      load();
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pending Verification</h1>
          <p className="text-sm text-slate-500 mt-1">{pending.length} registration{pending.length !== 1 ? 's' : ''} awaiting review</p>
        </div>
        <button onClick={() => downloadFile('/super-admin/export/pending', 'pending-verifications.csv')} className="btn-secondary">
          <Download className="h-4 w-4" /> Export Pending List
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : pending.length === 0 ? (
        <div className="card text-center py-14">
          <ClipboardCheck className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
          <p className="font-medium text-slate-700">All caught up!</p>
          <p className="text-sm text-slate-500 mt-1">There are no pending alumni registrations right now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((p) => (
            <div key={p.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-slate-800">{p.fullName}</h3>
                  <p className="text-sm text-slate-500">{p.registerNumber} · Batch {p.batch} · {p.degree} · {p.department?.name}</p>
                </div>
                <span className="badge-pending">Pending Verification</span>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 text-sm">
                <Detail label="Mobile" value={p.mobile} />
                <Detail label="Email" value={p.email} />
                <Detail label="Current Status" value={STATUS_LABELS[p.currentStatus]} />
                {p.currentStatus === 'WORKING' && (
                  <>
                    <Detail label="Sector" value={p.employmentSector} />
                    <Detail label="Organization" value={p.organizationName} />
                    <Detail label="Designation" value={p.designation} />
                    <Detail label="Location" value={p.location} />
                  </>
                )}
                {p.currentStatus === 'HIGHER_EDUCATION' && (
                  <>
                    <Detail label="Institution" value={p.institutionName} />
                    <Detail label="Degree Pursuing" value={p.degreePursuing} />
                    <Detail label="Specialization" value={p.specialization} />
                    <Detail label="Years" value={`${p.startYear} – ${p.expectedCompletionYear}`} />
                  </>
                )}
                {p.currentStatus === 'EXAM_PREPARATION' && (
                  <>
                    <Detail label="Exam" value={p.examName} />
                    <Detail label="Preparation Type" value={p.preparationType} />
                    <Detail label="Years" value={`${p.examStartYear} – ${p.expectedExamYear}`} />
                  </>
                )}
                {p.currentStatus === 'OTHERS' && (
                  <>
                    <Detail label="Activity" value={p.activityName} />
                    <Detail label="Description" value={p.description} />
                  </>
                )}
              </div>

              <div className="flex items-center gap-3 mt-5">
                <button
                  onClick={() => approve(p.id)}
                  disabled={actionLoading === p.id}
                  className="btn-primary"
                >
                  <Check className="h-4 w-4" /> Approve
                </button>
                <button
                  onClick={() => openReject(p)}
                  disabled={actionLoading === p.id}
                  className="btn-danger"
                >
                  <X className="h-4 w-4" /> Reject
                </button>
              </div>
              <ProofDocumentsPanel alumniProfileId={p.id} />
            </div>
          ))}
        </div>
      )}

      {rejectTarget && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center px-4 z-50">
          <div className="card w-full max-w-md">
            <h3 className="font-semibold text-slate-800 mb-1">Reject {rejectTarget.fullName}'s registration?</h3>
            <p className="text-sm text-slate-500 mb-4">Optionally provide a reason. This will be visible for audit purposes.</p>
            <textarea
              className="input-field mb-4"
              rows={3}
              placeholder="Reason for rejection (optional)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setRejectTarget(null)} className="btn-secondary">Cancel</button>
              <button onClick={confirmReject} disabled={actionLoading === rejectTarget.id} className="btn-danger">
                {actionLoading === rejectTarget.id ? 'Rejecting…' : 'Confirm Reject'}
              </button>
            </div>
          </div>
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

const DOC_TYPE_LABELS = {
  DEGREE_CERTIFICATE: 'Degree Certificate', ALUMNI_ID: 'Alumni ID',
  EMPLOYMENT_PROOF: 'Employment Proof', ADMISSION_PROOF: 'Admission Proof',
  EMPLOYEE_ID: 'Employee ID', OFFER_LETTER: 'Offer Letter',
  EXPERIENCE_CERTIFICATE: 'Experience Certificate', STUDENT_ID: 'Student ID',
  ADMISSION_LETTER: 'Admission Letter', MARKSHEET: 'Marksheet',
  HALL_TICKET: 'Hall Ticket', REGISTRATION_RECEIPT: 'Registration Receipt',
  COACHING_PROOF: 'Coaching Proof', OTHER: 'Other Document',
};

function ProofDocumentsPanel({ alumniProfileId }) {
  const [open, setOpen] = useState(false);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);

  function toggle() {
    if (!open && docs.length === 0) {
      setLoading(true);
      api.get(`/super-admin/alumni/${alumniProfileId}/proofs`)
        .then(({ data }) => setDocs(data))
        .finally(() => setLoading(false));
    }
    setOpen((s) => !s);
  }

  return (
    <div className="mt-4 pt-4 border-t border-surface-200">
      <button
        onClick={toggle}
        className="flex items-center gap-2 text-sm font-medium text-brand-700 hover:underline"
      >
        <FileText className="h-4 w-4" />
        View Uploaded Proof Documents
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {open && (
        <div className="mt-3">
          {loading ? (
            <p className="text-xs text-slate-400">Loading…</p>
          ) : docs.length === 0 ? (
            <p className="text-sm text-slate-500">No documents uploaded by this alumni yet.</p>
          ) : (
            <div className="space-y-2">
              {docs.map((doc) => (
                <div key={doc.id} className="rounded-xl border border-surface-200 bg-surface-50 px-3.5 py-3 space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 text-brand-600 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-slate-700 truncate">{doc.originalName}</p>
                        <p className="text-xs text-slate-400">
                          {DOC_TYPE_LABELS[doc.docType] || doc.docType}
                          {doc.careerEntryId && ' · Career entry'}
                          {doc.uploadedAt && ` · ${new Date(doc.uploadedAt).toLocaleDateString('en-IN')}`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => downloadFile(`/super-admin/proofs/${doc.id}/download`, doc.originalName)}
                      className="btn-secondary text-xs py-1.5 px-3 shrink-0"
                    >
                      <Download className="h-3.5 w-3.5" /> Download
                    </button>
                  </div>
                  {doc.description && (
                    <p className="text-xs text-slate-600 italic pl-6">"{doc.description}"</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}