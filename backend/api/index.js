require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('../src/routes/authRoutes');
const departmentRoutes = require('../src/routes/departmentRoutes');
const alumniRoutes = require('../src/routes/alumniRoutes');
const studentRoutes = require('../src/routes/studentRoutes');
const staffAdminRoutes = require('../src/routes/staffAdminRoutes');
const superAdminRoutes = require('../src/routes/superAdminRoutes');

const app = express();

app.use(cors());
app.use(express.json());

const { UPLOADS_DIR } = require('../src/middleware/upload');
app.use('/uploads', express.static(UPLOADS_DIR));

app.get('/api/health', (req, res) => res.json({ status: 'ok', name: 'Alumexa API' }));

app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/staff-admin', staffAdminRoutes);
app.use('/api/super-admin', superAdminRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

module.exports = app;
