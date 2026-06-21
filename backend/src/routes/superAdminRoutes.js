const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/superAdminController');
const { createDepartment } = require('../controllers/departmentController');
const proof = require('../controllers/proofController');
const account = require('../controllers/accountController');

const router = express.Router();

router.use(authenticate, requireRole('SUPER_ADMIN'));

// Departments
router.post('/departments', createDepartment);

// Staff Admin management
router.post('/staff-admins', ctrl.createStaffAdmin);
router.get('/staff-admins', ctrl.listStaffAdmins);
router.patch('/staff-admins/:id/activate', ctrl.activateStaffAdmin);
router.patch('/staff-admins/:id/deactivate', ctrl.deactivateStaffAdmin);
router.patch('/staff-admins/:id/edit', ctrl.editStaffAdmin);
router.delete('/staff-admins/:id', ctrl.deleteStaffAdmin);
router.patch('/staff-admins/:id/password', ctrl.resetStaffAdminPassword);

// Alumni / Student visibility
router.get('/alumni', ctrl.listAllAlumni);
router.get('/alumni/:id/full', ctrl.getFullAlumniProfile);
router.get('/students', ctrl.listAllStudents);

// Proof documents — super admin can view/download any alumni's proofs
router.get('/alumni/:alumniProfileId/proofs', proof.superAdminListProofs);
router.get('/proofs/:id/download', proof.superAdminDownloadProof);
router.get('/proofs/:id/view', proof.superAdminViewProof);

// Pending verifications (college-wide)
router.get('/pending', ctrl.listPending);
router.patch('/alumni/:id/approve', ctrl.approveAlumni);
router.patch('/alumni/:id/reject', ctrl.rejectAlumni);

// Dashboard
router.get('/dashboard', ctrl.dashboard);

// Exports
router.get('/export/pending', ctrl.exportPending);
router.get('/export/alumni', ctrl.exportAllAlumni);
router.get('/export/students', ctrl.exportAllStudents);
router.get('/export/mentors', ctrl.exportMentors);
router.get('/export/department/:id', ctrl.exportDepartmentReport);
router.get('/export/excel', ctrl.exportExcel);
router.delete('/reset-data', ctrl.resetAllData);

// Account settings
router.patch('/account/password', account.changePassword);
router.patch('/account/username', account.changeUsername);

module.exports = router;
