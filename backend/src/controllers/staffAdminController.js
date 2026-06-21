const prisma = require('../utils/prisma');
const { getAlumniAnalytics } = require('../utils/stats');
const { sendCsv } = require('../utils/csv');

// GET /api/staff-admin/pending
async function listPending(req, res) {
  const alumni = await prisma.alumniProfile.findMany({
    where: { departmentId: req.user.departmentId, verificationStatus: 'PENDING' },
    include: { department: true },
    orderBy: { createdAt: 'asc' },
  });
  res.json(alumni);
}

// PATCH /api/staff-admin/alumni/:id/approve
async function approveAlumni(req, res) {
  const profile = await getOwnDepartmentAlumni(req);
  if (!profile) return res.status(404).json({ message: 'Alumni record not found in your department' });

  const updated = await prisma.alumniProfile.update({
    where: { id: profile.id },
    data: { verificationStatus: 'VERIFIED', rejectionReason: null },
  });

  res.json({ message: 'Alumni verified successfully', profile: updated });
}

// PATCH /api/staff-admin/alumni/:id/reject
async function rejectAlumni(req, res) {
  const profile = await getOwnDepartmentAlumni(req);
  if (!profile) return res.status(404).json({ message: 'Alumni record not found in your department' });

  const { reason } = req.body;

  const updated = await prisma.alumniProfile.update({
    where: { id: profile.id },
    data: { verificationStatus: 'REJECTED', rejectionReason: reason || null },
  });

  res.json({ message: 'Alumni registration rejected', profile: updated });
}

// GET /api/staff-admin/alumni — list/search department alumni
async function listDepartmentAlumni(req, res) {
  const { search, verificationStatus, batch, currentStatus } = req.query;

  const where = { departmentId: req.user.departmentId };
  if (verificationStatus) where.verificationStatus = verificationStatus;
  if (batch) where.batch = batch;
  if (currentStatus) where.currentStatus = currentStatus;
  if (search) {
    where.OR = [
      { fullName: { contains: search } },
      { registerNumber: { contains: search } },
      { email: { contains: search } },
    ];
  }

  const alumni = await prisma.alumniProfile.findMany({
    where,
    include: { department: true, skills: true },
    orderBy: { fullName: 'asc' },
  });

  res.json(alumni);
}

// PATCH /api/staff-admin/alumni/:id — edit a department alumni record
async function editAlumni(req, res) {
  const profile = await getOwnDepartmentAlumni(req);
  if (!profile) return res.status(404).json({ message: 'Alumni record not found in your department' });

  const allowedFields = [
    'fullName', 'registerNumber', 'batch', 'degree', 'mobile', 'email',
    'currentStatus', 'employmentSector', 'organizationName', 'designation', 'location',
    'institutionName', 'degreePursuing', 'specialization', 'startYear', 'expectedCompletionYear',
    'examName', 'preparationType', 'examInstitutionName', 'examStartYear', 'expectedExamYear',
    'activityName', 'description',
  ];

  const data = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) data[field] = req.body[field];
  }

  const updated = await prisma.alumniProfile.update({ where: { id: profile.id }, data });
  res.json(updated);
}

// GET /api/staff-admin/dashboard
async function dashboard(req, res) {
  const stats = await getAlumniAnalytics(req.user.departmentId);
  res.json(stats);
}

// GET /api/staff-admin/export/department-alumni
async function exportDepartmentAlumni(req, res) {
  const alumni = await prisma.alumniProfile.findMany({
    where: { departmentId: req.user.departmentId },
    include: { department: true },
    orderBy: { fullName: 'asc' },
  });
  sendCsv(res, 'department-alumni.csv', alumni, alumniColumns());
}

// GET /api/staff-admin/export/pending
async function exportPending(req, res) {
  const alumni = await prisma.alumniProfile.findMany({
    where: { departmentId: req.user.departmentId, verificationStatus: 'PENDING' },
    include: { department: true },
    orderBy: { createdAt: 'asc' },
  });
  sendCsv(res, 'pending-verifications.csv', alumni, alumniColumns());
}

// GET /api/staff-admin/export/verified
async function exportVerified(req, res) {
  const alumni = await prisma.alumniProfile.findMany({
    where: { departmentId: req.user.departmentId, verificationStatus: 'VERIFIED' },
    include: { department: true },
    orderBy: { fullName: 'asc' },
  });
  sendCsv(res, 'verified-alumni.csv', alumni, alumniColumns());
}

// GET /api/staff-admin/alumni/:id/full — complete profile view for staff
async function getFullAlumniProfile(req, res) {
  const profile = await prisma.alumniProfile.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      department: true,
      careerEntries: { include: { proofDocuments: true } },
      skills: true,
      proofDocuments: true,
    },
  });

  if (!profile || profile.departmentId !== req.user.departmentId) {
    return res.status(404).json({ message: 'Alumni not found in your department' });
  }

  res.json(profile);
}

// GET /api/staff-admin/export/excel — professional Excel workbook
async function exportExcel(req, res) {
  const { sendExcel, buildSheets } = require('../utils/excel');

  const alumni = await prisma.alumniProfile.findMany({
    where: { departmentId: req.user.departmentId },
    include: {
      department: true,
      careerEntries: { include: { proofDocuments: true } },
      skills: true,
      proofDocuments: true,
    },
    orderBy: { fullName: 'asc' },
  });

  const dept = await prisma.department.findUnique({ where: { id: req.user.departmentId } });
  const sheets = buildSheets(alumni, dept?.name || 'Department');
  await sendExcel(res, `${dept?.name || 'department'}-alumni`, sheets);
}

// --- Helpers ---

async function getOwnDepartmentAlumni(req) {
  const profile = await prisma.alumniProfile.findUnique({ where: { id: Number(req.params.id) } });
  if (!profile || profile.departmentId !== req.user.departmentId) return null;
  return profile;
}

function alumniColumns() {
  return [
    { key: 'fullName', label: 'Full Name' },
    { key: 'registerNumber', label: 'Register Number' },
    { key: 'batch', label: 'Batch' },
    { value: (r) => r.department?.name, label: 'Department' },
    { key: 'degree', label: 'Degree' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'email', label: 'Email' },
    { key: 'currentStatus', label: 'Current Status' },
    { key: 'organizationName', label: 'Organization' },
    { key: 'designation', label: 'Designation' },
    { key: 'institutionName', label: 'Institution' },
    { key: 'verificationStatus', label: 'Verification Status' },
  ];
}

module.exports = {
  listPending,
  approveAlumni,
  rejectAlumni,
  listDepartmentAlumni,
  editAlumni,
  getFullAlumniProfile,
  dashboard,
  exportDepartmentAlumni,
  exportPending,
  exportVerified,
  exportExcel,
  alumniColumns,
};
