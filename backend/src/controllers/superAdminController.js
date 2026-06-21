const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');
const { getAlumniAnalytics } = require('../utils/stats');
const { sendCsv } = require('../utils/csv');
const { alumniColumns } = require('./staffAdminController');

// --- Staff Admin Management ---

// POST /api/super-admin/staff-admins
async function createStaffAdmin(req, res) {
  const { email, username, password, departmentId } = req.body;

  const required = { email, username, password, departmentId };
  for (const [key, value] of Object.entries(required)) {
    if (!value) return res.status(400).json({ message: `${key} is required` });
  }

  const department = await prisma.department.findUnique({ where: { id: Number(departmentId) } });
  if (!department) return res.status(400).json({ message: 'Invalid department' });

  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
  if (existing) return res.status(409).json({ message: 'An account with this email or username already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);

  const staffAdmin = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      role: 'STAFF_ADMIN',
      departmentId: department.id,
    },
    include: { department: true },
  });

  res.status(201).json({
    id: staffAdmin.id,
    email: staffAdmin.email,
    username: staffAdmin.username,
    department: staffAdmin.department,
    isActive: staffAdmin.isActive,
  });
}

// GET /api/super-admin/staff-admins
async function listStaffAdmins(req, res) {
  const staffAdmins = await prisma.user.findMany({
    where: { role: 'STAFF_ADMIN' },
    include: { department: true },
    orderBy: { createdAt: 'desc' },
  });

  res.json(
    staffAdmins.map((s) => ({
      id: s.id,
      email: s.email,
      username: s.username,
      isActive: s.isActive,
      department: s.department,
      createdAt: s.createdAt,
    }))
  );
}

// PATCH /api/super-admin/staff-admins/:id/activate
async function activateStaffAdmin(req, res) {
  await setStaffAdminActive(req, res, true);
}

// PATCH /api/super-admin/staff-admins/:id/deactivate
async function deactivateStaffAdmin(req, res) {
  await setStaffAdminActive(req, res, false);
}

async function setStaffAdminActive(req, res, isActive) {
  const staffAdmin = await prisma.user.findUnique({ where: { id: Number(req.params.id) } });
  if (!staffAdmin || staffAdmin.role !== 'STAFF_ADMIN') {
    return res.status(404).json({ message: 'Staff admin not found' });
  }

  const updated = await prisma.user.update({ where: { id: staffAdmin.id }, data: { isActive } });
  res.json({ id: updated.id, isActive: updated.isActive });
}

// --- Alumni / Student visibility (college-wide) ---

// GET /api/super-admin/alumni
async function listAllAlumni(req, res) {
  const { search, verificationStatus, departmentId, batch, currentStatus } = req.query;

  const where = {};
  if (verificationStatus) where.verificationStatus = verificationStatus;
  if (departmentId) where.departmentId = Number(departmentId);
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

// GET /api/super-admin/students
async function listAllStudents(req, res) {
  const { search, departmentId } = req.query;

  const where = {};
  if (departmentId) where.departmentId = Number(departmentId);
  if (search) {
    where.OR = [
      { fullName: { contains: search } },
      { registerNumber: { contains: search } },
      { email: { contains: search } },
    ];
  }

  const students = await prisma.studentProfile.findMany({
    where,
    include: { department: true },
    orderBy: { fullName: 'asc' },
  });

  res.json(students);
}

// --- Pending Verifications (college-wide) ---

// GET /api/super-admin/pending
async function listPending(req, res) {
  const alumni = await prisma.alumniProfile.findMany({
    where: { verificationStatus: 'PENDING' },
    include: { department: true },
    orderBy: { createdAt: 'asc' },
  });
  res.json(alumni);
}

// PATCH /api/super-admin/alumni/:id/approve
async function approveAlumni(req, res) {
  const profile = await prisma.alumniProfile.findUnique({ where: { id: Number(req.params.id) } });
  if (!profile) return res.status(404).json({ message: 'Alumni record not found' });

  const updated = await prisma.alumniProfile.update({
    where: { id: profile.id },
    data: { verificationStatus: 'VERIFIED', rejectionReason: null },
  });

  res.json({ message: 'Alumni verified successfully', profile: updated });
}

// PATCH /api/super-admin/alumni/:id/reject
async function rejectAlumni(req, res) {
  const profile = await prisma.alumniProfile.findUnique({ where: { id: Number(req.params.id) } });
  if (!profile) return res.status(404).json({ message: 'Alumni record not found' });

  const { reason } = req.body;

  const updated = await prisma.alumniProfile.update({
    where: { id: profile.id },
    data: { verificationStatus: 'REJECTED', rejectionReason: reason || null },
  });

  res.json({ message: 'Alumni registration rejected', profile: updated });
}

// --- Dashboard ---

// GET /api/super-admin/dashboard
async function dashboard(req, res) {
  const stats = await getAlumniAnalytics(null);
  res.json(stats);
}

// --- Exports ---

// GET /api/super-admin/export/pending
async function exportPending(req, res) {
  const alumni = await prisma.alumniProfile.findMany({
    where: { verificationStatus: 'PENDING' },
    include: { department: true },
    orderBy: { createdAt: 'asc' },
  });
  sendCsv(res, 'pending-verifications.csv', alumni, alumniColumns());
}

// GET /api/super-admin/export/alumni
async function exportAllAlumni(req, res) {
  const alumni = await prisma.alumniProfile.findMany({
    include: { department: true },
    orderBy: { fullName: 'asc' },
  });
  sendCsv(res, 'all-alumni.csv', alumni, alumniColumns());
}

// GET /api/super-admin/export/students
async function exportAllStudents(req, res) {
  const students = await prisma.studentProfile.findMany({
    include: { department: true },
    orderBy: { fullName: 'asc' },
  });

  sendCsv(res, 'all-students.csv', students, [
    { key: 'fullName', label: 'Full Name' },
    { key: 'registerNumber', label: 'Register Number' },
    { value: (r) => r.department?.name, label: 'Department' },
    { key: 'currentYear', label: 'Current Year' },
    { key: 'email', label: 'Email' },
  ]);
}

// GET /api/super-admin/export/mentors
async function exportMentors(req, res) {
  const mentors = await prisma.alumniProfile.findMany({
    where: {
      verificationStatus: 'VERIFIED',
      OR: [
        { mentorCareerGuidance: true },
        { mentorHigherStudiesGuidance: true },
        { mentorExamPrepGuidance: true },
        { mentorEntrepreneurshipGuidance: true },
        { mentorInternshipGuidance: true },
      ],
    },
    include: { department: true },
    orderBy: { fullName: 'asc' },
  });

  sendCsv(res, 'mentor-list.csv', mentors, [
    { key: 'fullName', label: 'Full Name' },
    { value: (r) => r.department?.name, label: 'Department' },
    { key: 'batch', label: 'Batch' },
    { key: 'currentStatus', label: 'Current Status' },
    { key: 'organizationName', label: 'Organization' },
    { key: 'designation', label: 'Designation' },
    { value: (r) => r.mentorCareerGuidance ? 'Yes' : 'No', label: 'Career Guidance' },
    { value: (r) => r.mentorHigherStudiesGuidance ? 'Yes' : 'No', label: 'Higher Studies Guidance' },
    { value: (r) => r.mentorExamPrepGuidance ? 'Yes' : 'No', label: 'Exam Prep Guidance' },
    { value: (r) => r.mentorEntrepreneurshipGuidance ? 'Yes' : 'No', label: 'Entrepreneurship Guidance' },
    { value: (r) => r.mentorInternshipGuidance ? 'Yes' : 'No', label: 'Internship Guidance' },
    { key: 'linkedin', label: 'LinkedIn' },
  ]);
}

// GET /api/super-admin/export/department/:id
async function exportDepartmentReport(req, res) {
  const department = await prisma.department.findUnique({ where: { id: Number(req.params.id) } });
  if (!department) return res.status(404).json({ message: 'Department not found' });

  const alumni = await prisma.alumniProfile.findMany({
    where: { departmentId: department.id },
    include: { department: true },
    orderBy: { fullName: 'asc' },
  });

  sendCsv(res, `department-${department.name.replace(/\s+/g, '-')}.csv`, alumni, alumniColumns());
}

// GET /api/super-admin/export/excel — full college Excel workbook
async function exportExcel(req, res) {
  const { sendExcel, buildSheets } = require('../utils/excel');

  const alumni = await prisma.alumniProfile.findMany({
    include: {
      department: true,
      careerEntries: { include: { proofDocuments: true } },
      skills: true,
      proofDocuments: true,
    },
    orderBy: { fullName: 'asc' },
  });

  const sheets = buildSheets(alumni, 'All Departments');
  await sendExcel(res, 'all-departments-alumni', sheets);
}

// DELETE /api/super-admin/reset-data — remove all data except the Super Admin account
async function resetAllData(req, res) {
  const fs = require('fs');
  const path = require('path');
  const { UPLOADS_DIR } = require('../middleware/upload');

  await prisma.$transaction([
    prisma.proofDocument.deleteMany({}),
    prisma.careerJourneyEntry.deleteMany({}),
    prisma.skill.deleteMany({}),
    prisma.alumniProfile.deleteMany({}),
    prisma.studentProfile.deleteMany({}),
    prisma.user.deleteMany({ where: { role: { not: 'SUPER_ADMIN' } } }),
    prisma.department.deleteMany({}),
  ]);

  if (fs.existsSync(UPLOADS_DIR)) {
    for (const file of fs.readdirSync(UPLOADS_DIR)) {
      if (file === '.gitkeep') continue;
      fs.unlinkSync(path.join(UPLOADS_DIR, file));
    }
  }

  res.json({ message: 'All non-Super Admin data has been deleted' });
}

// PATCH /api/super-admin/staff-admins/:id/edit — edit staff details
async function editStaffAdmin(req, res) {
  const staffAdmin = await prisma.user.findUnique({ where: { id: Number(req.params.id) } });
  if (!staffAdmin || staffAdmin.role !== 'STAFF_ADMIN') {
    return res.status(404).json({ message: 'Staff admin not found' });
  }

  const { email, username, departmentId } = req.body;
  const data = {};

  if (email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== staffAdmin.id) {
      return res.status(409).json({ message: 'Email already in use' });
    }
    data.email = email;
  }

  if (username) {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing && existing.id !== staffAdmin.id) {
      return res.status(409).json({ message: 'Username already taken' });
    }
    data.username = username;
  }

  if (departmentId) {
    const dept = await prisma.department.findUnique({ where: { id: Number(departmentId) } });
    if (!dept) return res.status(400).json({ message: 'Invalid department' });
    data.departmentId = dept.id;
  }

  const updated = await prisma.user.update({
    where: { id: staffAdmin.id },
    data,
    include: { department: true },
  });

  res.json({
    id: updated.id, email: updated.email, username: updated.username,
    isActive: updated.isActive, department: updated.department,
  });
}

// DELETE /api/super-admin/staff-admins/:id
async function deleteStaffAdmin(req, res) {
  const staffAdmin = await prisma.user.findUnique({ where: { id: Number(req.params.id) } });
  if (!staffAdmin || staffAdmin.role !== 'STAFF_ADMIN') {
    return res.status(404).json({ message: 'Staff admin not found' });
  }

  await prisma.user.delete({ where: { id: staffAdmin.id } });
  res.status(204).send();
}

// PATCH /api/super-admin/staff-admins/:id/password — reset staff admin password
async function resetStaffAdminPassword(req, res) {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters' });

  const staffAdmin = await prisma.user.findUnique({ where: { id: Number(req.params.id) } });
  if (!staffAdmin || staffAdmin.role !== 'STAFF_ADMIN') {
    return res.status(404).json({ message: 'Staff admin not found' });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: staffAdmin.id }, data: { password: hashed } });
  res.json({ message: 'Password reset successfully' });
}

// GET /api/super-admin/alumni/:id/full — full alumni profile (no department restriction)
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

  if (!profile) return res.status(404).json({ message: 'Alumni not found' });
  res.json(profile);
}

module.exports = {
  createStaffAdmin,
  listStaffAdmins,
  activateStaffAdmin,
  deactivateStaffAdmin,
  editStaffAdmin,
  listAllAlumni,
  listAllStudents,
  dashboard,
  exportAllAlumni,
  exportAllStudents,
  exportMentors,
  exportDepartmentReport,
  exportExcel,
  deleteStaffAdmin,
  resetStaffAdminPassword,
  resetAllData,
  getFullAlumniProfile,
  listPending,
  approveAlumni,
  rejectAlumni,
  exportPending,
};
