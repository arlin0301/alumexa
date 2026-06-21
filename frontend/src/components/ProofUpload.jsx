import { useRef, useState } from 'react';
import { Upload, FileText, Trash2, CheckCircle2, AlertCircle, Loader2, Pencil, Check, X } from 'lucide-react';
import api from '../utils/api';

const DOC_TYPE_LABELS = {
  DEGREE_CERTIFICATE: 'Degree Certificate',
  ALUMNI_ID: 'Alumni ID',
  EMPLOYMENT_PROOF: 'Employment Proof',
  ADMISSION_PROOF: 'Admission Proof',
  EMPLOYEE_ID: 'Employee ID',
  OFFER_LETTER: 'Offer Letter',
  EXPERIENCE_CERTIFICATE: 'Experience Certificate',
  STUDENT_ID: 'Student ID',
  ADMISSION_LETTER: 'Admission Letter',
  MARKSHEET: 'Marksheet',
  HALL_TICKET: 'Hall Ticket',
  REGISTRATION_RECEIPT: 'Registration Receipt',
  COACHING_PROOF: 'Coaching Proof',
  OTHER: 'Other Document',
};

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * ProofUpload component
 *
 * Props:
 *   uploadUrl    — POST endpoint (e.g. '/alumni/me/proofs')
 *   docTypes     — array of allowed docType values
 *   existingDocs — array of already-uploaded proof documents
 *   onUploaded   — called after successful upload with the new doc
 *   onDeleted    — called after deletion with the doc id
 *   onUpdated    — called after description update with the updated doc
 *   deleteUrl    — base delete URL (default: '/alumni/me/proofs')
 *   downloadUrl  — base download URL (default: '/alumni/me/proofs')
 *   label        — section label
 *   optional     — shows "(optional)" badge if true
 */
export default function ProofUpload({
  uploadUrl,
  docTypes,
  existingDocs = [],
  onUploaded,
  onDeleted,
  onUpdated,
  deleteUrl = '/alumni/me/proofs',
  downloadUrl = '/alumni/me/proofs',
  label = 'Supporting Documents',
  optional = true,
}) {
  const fileInputRef = useRef(null);
  const [selectedDocType, setSelectedDocType] = useState(docTypes[0] || 'OTHER');
  const [pendingDescription, setPendingDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('docType', selectedDocType);
    if (pendingDescription.trim()) {
      formData.append('description', pendingDescription.trim());
    }

    try {
      const { data } = await api.post(uploadUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(`"${file.name}" uploaded successfully.`);
      setPendingDescription('');
      onUploaded?.(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleDelete(doc) {
    try {
      await api.delete(`${deleteUrl}/${doc.id}`);
      onDeleted?.(doc.id);
    } catch {
      setError('Failed to delete document. Please try again.');
    }
  }

  function handleDownload(doc) {
    const token = localStorage.getItem('alumexa_token') || localStorage.getItem('alumexa_reg_token');
    window.open(`/api${downloadUrl}/${doc.id}/download?token=${token}`, '_blank');
  }

  return (
    <div className="space-y-3">
      <label className="label-text">
        {label}{' '}
        {optional && <span className="text-slate-400 font-normal text-xs">(optional)</span>}
      </label>

      {/* Existing uploaded documents */}
      {existingDocs.length > 0 && (
        <div className="space-y-2">
          {existingDocs.map((doc) => (
            <ExistingDocRow
              key={doc.id}
              doc={doc}
              onDelete={handleDelete}
              onDownload={handleDownload}
              onUpdated={onUpdated}
              deleteUrl={deleteUrl}
            />
          ))}
        </div>
      )}

      {/* Upload area */}
      <div className="rounded-xl border-2 border-dashed border-surface-200 bg-surface-50 p-4 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Document type</label>
            <select
              className="input-field text-sm"
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value)}
            >
              {docTypes.map((type) => (
                <option key={type} value={type}>{DOC_TYPE_LABELS[type] || type}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary w-full"
            >
              {uploading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
                : <><Upload className="h-4 w-4" /> Choose File</>
              }
            </button>
          </div>
        </div>

        {/* Description input before upload */}
        <div>
          <label className="text-xs text-slate-500 mb-1 block">
            Description <span className="text-slate-400">(optional — what this document proves)</span>
          </label>
          <input
            type="text"
            className="input-field text-sm"
            placeholder="e.g. Offer letter from Infosys for Software Engineer role, 2023"
            value={pendingDescription}
            onChange={(e) => setPendingDescription(e.target.value)}
          />
        </div>

        <p className="text-xs text-slate-400">JPG, PNG, WEBP or PDF · Max 5 MB</p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.pdf"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-rose-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
        </p>
      )}
      {success && (
        <p className="flex items-center gap-1.5 text-xs text-emerald-600">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> {success}
        </p>
      )}
    </div>
  );
}

// Individual uploaded document row with inline description editing
function ExistingDocRow({ doc, onDelete, onDownload, onUpdated, deleteUrl }) {
  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState(doc.description || '');
  const [saving, setSaving] = useState(false);

  async function saveDescription() {
    setSaving(true);
    try {
      const { data } = await api.patch(`${deleteUrl}/${doc.id}/description`, { description });
      setEditing(false);
      onUpdated?.(data);
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setDescription(doc.description || '');
    setEditing(false);
  }

  return (
    <div className="rounded-xl border border-surface-200 bg-white px-3.5 py-3 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0">
          <FileText className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-700 truncate">{doc.originalName}</p>
            <p className="text-xs text-slate-400">
              {DOC_TYPE_LABELS[doc.docType] || doc.docType} · {formatBytes(doc.sizeBytes)}
              {doc.uploadedAt && ` · ${new Date(doc.uploadedAt).toLocaleDateString('en-IN')}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onDownload(doc)}
            className="text-xs text-brand-700 hover:underline font-medium"
          >
            View
          </button>
          <button
            type="button"
            onClick={() => onDelete(doc)}
            className="text-rose-400 hover:text-rose-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Description row */}
      {!editing ? (
        <div className="flex items-start gap-2">
          <p className="text-xs text-slate-500 flex-1 italic">
            {doc.description
              ? `"${doc.description}"`
              : <span className="text-slate-300">No description added</span>
            }
          </p>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 text-xs text-brand-600 hover:underline shrink-0"
          >
            <Pencil className="h-3 w-3" /> {doc.description ? 'Edit' : 'Add description'}
          </button>
        </div>
      ) : (
        <div className="space-y-1.5">
          <input
            type="text"
            autoFocus
            className="input-field text-xs py-1.5"
            placeholder="e.g. Offer letter from Infosys for Software Engineer role"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={saveDescription}
              disabled={saving}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline"
            >
              <Check className="h-3 w-3" /> {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="flex items-center gap-1 text-xs text-slate-400 hover:underline"
            >
              <X className="h-3 w-3" /> Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
