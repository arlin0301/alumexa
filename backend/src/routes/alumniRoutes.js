const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/alumniController');
const proof = require('../controllers/proofController');
const account = require('../controllers/accountController');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Public
router.post('/register', ctrl.register);

// Authenticated — Alumni only
router.use(authenticate, requireRole('ALUMNI'));

router.get('/me', ctrl.getMyProfile);
router.patch('/me', ctrl.updateMyProfile);

// Information section
router.patch('/me/basic-info', ctrl.updateBasicInfo);
router.patch('/me/current-status', ctrl.updateCurrentStatus);

// Career journey
router.post('/me/career-entries', ctrl.addCareerEntry);
router.patch('/me/career-entries/:id', ctrl.updateCareerEntry);
router.delete('/me/career-entries/:id', ctrl.deleteCareerEntry);

// Skills
router.post('/me/skills', ctrl.addSkill);
router.delete('/me/skills/:id', ctrl.deleteSkill);

// Proof documents — registration level
router.post('/me/proofs', upload.single('file'), handleUploadError, proof.uploadRegistrationProof);
router.get('/me/proofs', proof.listMyProofs);
router.get('/me/proofs/:id/download', proof.downloadMyProof);
router.patch('/me/proofs/:id/description', proof.updateProofDescription);
router.delete('/me/proofs/:id', proof.deleteProof);

// Proof documents — career entry level
router.post('/me/career-entries/:id/proofs', upload.single('file'), handleUploadError, proof.uploadCareerEntryProof);

// Account settings
router.patch('/me/account/password', account.changePassword);
router.patch('/me/account/username', account.changeUsername);

module.exports = router;
