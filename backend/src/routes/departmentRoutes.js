const express = require('express');
const { listDepartments } = require('../controllers/departmentController');

const router = express.Router();

// Public — used by registration forms and search filters
router.get('/', listDepartments);

module.exports = router;
