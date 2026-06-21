import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

/**
 * Checks which mandatory proof documents are missing and shows alerts.
 * profile    — AlumniProfile with proofDocuments[] and careerEntries[]
 * onNavigate — callback to switch to the proofs tab
 */
export default function ProofAlerts({ profile, onNavigate }) {
  const [dismissed, setDismissed] = useState([]);

  if (profile.verificationStatus !== 'VERIFIED') return null;

  const alerts = getMissingAlerts(profile);
  const visible = alerts.filter((a) => !dismissed.includes(a.key));

  if (visible.length === 0) return null;

  return (
    <div className="space-y-2">
      {visible.map((alert) => (
        <div key={alert.key} className="flex items-start justify-between gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">{alert.title}</p>
              <p className="text-xs text-amber-700 mt-0.5">{alert.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onNavigate}
              className="text-xs font-semibold text-amber-700 hover:underline whitespace-nowrap"
            >
              Upload Now →
            </button>
            <button onClick={() => setDismissed((d) => [...d, alert.key])} className="text-amber-400 hover:text-amber-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function getMissingAlerts(profile) {
  const alerts = [];
  const docs = profile.proofDocuments || [];
  const entries = profile.careerEntries || [];

  // Helper: check if a proof exists by docType prefix or category
  const hasDocType = (...types) => docs.some((d) => types.includes(d.docType));
  const entryHasProof = (entryId) => docs.some((d) => d.careerEntryId === entryId);

  // Higher Education — mandatory
  if (profile.currentStatus === 'HIGHER_EDUCATION') {
    const heProofTypes = ['STUDENT_ID', 'ADMISSION_LETTER', 'MARKSHEET', 'DEGREE_CERTIFICATE', 'ADMISSION_PROOF'];
    if (!hasDocType(...heProofTypes)) {
      alerts.push({
        key: 'higher_ed_proof',
        title: 'Higher Education proof document pending',
        description: 'Please upload your Degree Certificate, Provisional Certificate, or Mark Statement.',
      });
    }
  }

  // Working / Current Position — mandatory
  if (profile.currentStatus === 'WORKING') {
    const workProofTypes = ['EMPLOYEE_ID', 'OFFER_LETTER', 'EXPERIENCE_CERTIFICATE', 'EMPLOYMENT_PROOF'];
    if (!hasDocType(...workProofTypes)) {
      alerts.push({
        key: 'current_position_proof',
        title: 'Current Position proof document pending',
        description: 'Please upload your Employee ID Card, Offer Letter, or Appointment Order.',
      });
    }
  }

  // Work experience career entries — mandatory per entry
  const workEntries = entries.filter((e) => e.type === 'WORKING');
  workEntries.forEach((entry) => {
    if (!entryHasProof(entry.id)) {
      alerts.push({
        key: `work_entry_${entry.id}`,
        title: `Work Experience proof pending${entry.organizationName ? ` — ${entry.organizationName}` : ''}`,
        description: 'Upload an Experience Certificate, Relieving Letter, or Employee ID for this work record.',
      });
    }
  });

  return alerts;
}
