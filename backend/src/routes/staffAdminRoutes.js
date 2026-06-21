const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/staffAdminController');
const proof = require('../controllers/proofController');
const account = require('../controllers/accountController');

const router = express.Router();

router.use(authenticate, requireRole('STAFF_ADMIN'));

router.get('/pending', ctrl.listPending);
router.patch('/alumni/:id/approve', ctrl.approveAlumni);
router.patch('/alumni/:id/reject', ctrl.rejectAlumni);

router.get('/alumni', ctrl.listDepartmentAlumni);
router.get('/alumni/:id/full', ctrl.getFullAlumniProfile);
router.patch('/alumni/:id', ctrl.editAlumni);

// Proof documents — view and download for department alumni
router.get('/alumni/:alumniProfileId/proofs', proof.listProofsForAlumni);
router.get('/proofs/:id/download', proof.staffDownloadProof);

router.get('/dashboard', ctrl.dashboard);

router.get('/export/department-alumni', ctrl.exportDepartmentAlumni);
router.get('/export/pending', ctrl.exportPending);
router.get('/export/verified', ctrl.exportVerified);
router.get('/export/excel', ctrl.exportExcel);

// Account settings
router.patch('/account/password', account.changePassword);
router.patch('/account/username', account.changeUsername);
router.patch('/account/email', account.changeEmail);

module.exports = router;
