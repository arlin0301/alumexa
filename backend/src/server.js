require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const alumniRoutes = require('./routes/alumniRoutes');
const studentRoutes = require('./routes/studentRoutes');
const staffAdminRoutes = require('./routes/staffAdminRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');

const app = express();

app.use(cors());
app.use(express.json());

const { UPLOADS_DIR } = require('./middleware/upload');

// Serve uploaded proof documents (access controlled via API routes above)
app.use('/uploads', express.static(UPLOADS_DIR));

app.get('/api/health', (req, res) => res.json({ status: 'ok', name: 'Alumexa API' }));

app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/staff-admin', staffAdminRoutes);
app.use('/api/super-admin', superAdminRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Alumexa API running on http://localhost:${PORT}`);
});
