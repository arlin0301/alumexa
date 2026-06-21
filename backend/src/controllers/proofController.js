const path = require('path');
const fs = require('fs');
const prisma = require('../utils/prisma');
const { UPLOADS_DIR } = require('../middleware/upload');

// Allowed docTypes per context
const REGISTRATION_DOC_TYPES = [
  'DEGREE_CERTIFICATE',
  'ALUMNI_ID',
  'EMPLOYMENT_PROOF',
  'ADMISSION_PROOF',
  'OTHER',
];

const CAREER_DOC_TYPES = {
  WORKING: ['EMPLOYEE_ID', 'OFFER_LETTER', 'EXPERIENCE_CERTIFICATE', 'OTHER'],
  HIGHER_EDUCATION: ['STUDENT_ID', 'ADMISSION_LETTER', 'MARKSHEET', 'OTHER'],
  EXAM_PREPARATION: ['HALL_TICKET', 'REGISTRATION_RECEIPT', 'COACHING_PROOF', 'OTHER'],
  OTHER: ['OTHER'],
};

// POST /api/alumni/me/proofs
// Body (multipart): docType, description (optional), file
async function uploadRegistrationProof(req, res) {
  const profile = await prisma.alumniProfile.findUnique({ where: { userId: req.user.id } });
  if (!profile) return res.status(404).json({ message: 'Profile not found' });

  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const { docType, description } = req.body;
  if (!docType || !REGISTRATION_DOC_TYPES.includes(docType)) {
    deleteFile(req.file.filename);
    return res.status(400).json({
      message: `Invalid docType. Must be one of: ${REGISTRATION_DOC_TYPES.join(', ')}`,
    });
  }

  const doc = await prisma.proofDocument.create({
    data: {
      alumniProfileId: profile.id,
      careerEntryId: null,
      docType,
      description: description?.trim() || null,
      originalName: req.file.originalname,
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
    },
  });

  res.status(201).json(toSafeDoc(doc));
}

// POST /api/alumni/me/career-entries/:id/proofs
// Body (multipart): docType, description (optional), file
async function uploadCareerEntryProof(req, res) {
  const profile = await prisma.alumniProfile.findUnique({ where: { userId: req.user.id } });
  if (!profile) return res.status(404).json({ message: 'Profile not found' });

  const entry = await prisma.careerJourneyEntry.findUnique({ where: { id: Number(req.params.id) } });
  if (!entry || entry.alumniProfileId !== profile.id) {
    if (req.file) deleteFile(req.file.filename);
    return res.status(404).json({ message: 'Career entry not found' });
  }

  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const { docType, description } = req.body;
  const allowedTypes = CAREER_DOC_TYPES[entry.type] || CAREER_DOC_TYPES['OTHER'];
  if (!docType || !allowedTypes.includes(docType)) {
    deleteFile(req.file.filename);
    return res.status(400).json({
      message: `Invalid docType for ${entry.type} entry. Must be one of: ${allowedTypes.join(', ')}`,
    });
  }

  const doc = await prisma.proofDocument.create({
    data: {
      alumniProfileId: profile.id,
      careerEntryId: entry.id,
      docType,
      description: description?.trim() || null,
      originalName: req.file.originalname,
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
    },
  });

  res.status(201).json(toSafeDoc(doc));
}

// PATCH /api/alumni/me/proofs/:id/description — update description of an existing proof
async function updateProofDescription(req, res) {
  const profile = await prisma.alumniProfile.findUnique({ where: { userId: req.user.id } });
  if (!profile) return res.status(404).json({ message: 'Profile not found' });

  const doc = await prisma.proofDocument.findUnique({ where: { id: Number(req.params.id) } });
  if (!doc || doc.alumniProfileId !== profile.id) {
    return res.status(404).json({ message: 'Document not found' });
  }

  const updated = await prisma.proofDocument.update({
    where: { id: doc.id },
    data: { description: req.body.description?.trim() || null },
  });

  res.json(toSafeDoc(updated));
}

// GET /api/alumni/me/proofs
async function listMyProofs(req, res) {
  const profile = await prisma.alumniProfile.findUnique({ where: { userId: req.user.id } });
  if (!profile) return res.status(404).json({ message: 'Profile not found' });

  const docs = await prisma.proofDocument.findMany({
    where: { alumniProfileId: profile.id },
    orderBy: { uploadedAt: 'desc' },
  });

  res.json(docs.map(toSafeDoc));
}

// DELETE /api/alumni/me/proofs/:id
async function deleteProof(req, res) {
  const profile = await prisma.alumniProfile.findUnique({ where: { userId: req.user.id } });
  if (!profile) return res.status(404).json({ message: 'Profile not found' });

  const doc = await prisma.proofDocument.findUnique({ where: { id: Number(req.params.id) } });
  if (!doc || doc.alumniProfileId !== profile.id) {
    return res.status(404).json({ message: 'Document not found' });
  }

  deleteFile(doc.storedName);
  await prisma.proofDocument.delete({ where: { id: doc.id } });
  res.status(204).send();
}

// GET /api/alumni/me/proofs/:id/download — alumni downloads their own file
async function downloadMyProof(req, res) {
  const profile = await prisma.alumniProfile.findUnique({ where: { userId: req.user.id } });
  if (!profile) return res.status(404).json({ message: 'Profile not found' });

  const doc = await prisma.proofDocument.findUnique({ where: { id: Number(req.params.id) } });
  if (!doc || doc.alumniProfileId !== profile.id) {
    return res.status(404).json({ message: 'Document not found' });
  }

  serveFile(res, doc);
}

// GET /api/staff-admin/alumni/:alumniProfileId/proofs
// Staff Admin views proof documents for an alumni in their department
async function listProofsForAlumni(req, res) {
  const profile = await prisma.alumniProfile.findUnique({
    where: { id: Number(req.params.alumniProfileId) },
  });
  if (!profile || profile.departmentId !== req.user.departmentId) {
    return res.status(404).json({ message: 'Alumni not found in your department' });
  }

  const docs = await prisma.proofDocument.findMany({
    where: { alumniProfileId: profile.id },
    orderBy: { uploadedAt: 'desc' },
  });

  res.json(docs.map(toSafeDoc));
}

// GET /api/staff-admin/proofs/:id/download
// Staff Admin downloads a proof file for a department alumni
async function staffDownloadProof(req, res) {
  const doc = await prisma.proofDocument.findUnique({
    where: { id: Number(req.params.id) },
    include: { alumniProfile: true },
  });

  if (!doc || doc.alumniProfile.departmentId !== req.user.departmentId) {
    return res.status(404).json({ message: 'Document not found' });
  }

  serveFile(res, doc);
}

// Super Admin can view/download any proof
// GET /api/super-admin/alumni/:alumniProfileId/proofs
async function superAdminListProofs(req, res) {
  const profile = await prisma.alumniProfile.findUnique({ where: { id: Number(req.params.alumniProfileId) } });
  if (!profile) return res.status(404).json({ message: 'Alumni not found' });

  const docs = await prisma.proofDocument.findMany({
    where: { alumniProfileId: profile.id },
    orderBy: { uploadedAt: 'desc' },
  });

  res.json(docs.map(toSafeDoc));
}

// GET /api/super-admin/proofs/:id/download
async function superAdminDownloadProof(req, res) {
  const doc = await prisma.proofDocument.findUnique({ where: { id: Number(req.params.id) } });
  if (!doc) return res.status(404).json({ message: 'Document not found' });
  serveFile(res, doc);
}

// GET /api/super-admin/proofs/:id/view
// Serves the file inline (opens in browser tab) — same as download but explicitly for viewing
async function superAdminViewProof(req, res) {
  const doc = await prisma.proofDocument.findUnique({ where: { id: Number(req.params.id) } });
  if (!doc) return res.status(404).json({ message: 'Document not found' });
  serveFile(res, doc);
}

// --- Helpers ---

function toSafeDoc(doc) {
  return {
    id: doc.id,
    docType: doc.docType,
    description: doc.description || null,
    originalName: doc.originalName,
    mimeType: doc.mimeType,
    sizeBytes: doc.sizeBytes,
    careerEntryId: doc.careerEntryId,
    uploadedAt: doc.uploadedAt,
  };
}

function deleteFile(storedName) {
  try {
    fs.unlinkSync(path.join(UPLOADS_DIR, storedName));
  } catch (_) {
    // File may already be gone — not fatal
  }
}

function serveFile(res, doc) {
  const filePath = path.join(UPLOADS_DIR, doc.storedName);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found on server' });
  }
  res.setHeader('Content-Type', doc.mimeType);
  res.setHeader('Content-Disposition', `inline; filename="${doc.originalName}"`);
  res.sendFile(filePath);
}

module.exports = {
  uploadRegistrationProof,
  uploadCareerEntryProof,
  updateProofDescription,
  listMyProofs,
  deleteProof,
  downloadMyProof,
  listProofsForAlumni,
  staffDownloadProof,
  superAdminListProofs,
  superAdminDownloadProof,
  superAdminViewProof,
  REGISTRATION_DOC_TYPES,
  CAREER_DOC_TYPES,
};
