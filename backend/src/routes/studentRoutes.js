const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/studentController');

const router = express.Router();

// Public
router.post('/register', ctrl.register);

// Authenticated — Student only
router.use(authenticate, requireRole('STUDENT'));

router.get('/me', ctrl.getMyProfile);
router.patch('/me', ctrl.updateMyProfile);

router.get('/mentor-matches', ctrl.getMentorMatches);

router.get('/alumni/search', ctrl.searchAlumni);
router.get('/alumni/:id', ctrl.getAlumniProfile);

module.exports = router;
