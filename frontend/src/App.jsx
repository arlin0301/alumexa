import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import AlumniRegister from './pages/AlumniRegister';
import StudentRegister from './pages/StudentRegister';
import ProtectedRoute from './components/ProtectedRoute';

import SuperAdminDashboard from './pages/super-admin/Dashboard';
import Departments from './pages/super-admin/Departments';
import StaffAdmins from './pages/super-admin/StaffAdmins';
import AllAlumni from './pages/super-admin/AllAlumni';
import AllStudents from './pages/super-admin/AllStudents';
import SuperPendingVerification from './pages/super-admin/PendingVerification';

import StaffAdminDashboard from './pages/staff-admin/Dashboard';
import StaffPendingVerification from './pages/staff-admin/PendingVerification';
import DepartmentAlumni from './pages/staff-admin/DepartmentAlumni';

import AlumniProfile from './pages/alumni/Profile';
import FindAlumni from './pages/student/FindAlumni';
import MentorMatch from './pages/student/MentorMatch';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register/alumni" element={<AlumniRegister />} />
      <Route path="/register/student" element={<StudentRegister />} />

      {/* Super Admin */}
      <Route path="/super-admin" element={<ProtectedRoute roles={['SUPER_ADMIN']}><SuperAdminDashboard /></ProtectedRoute>} />
      <Route path="/super-admin/departments" element={<ProtectedRoute roles={['SUPER_ADMIN']}><Departments /></ProtectedRoute>} />
      <Route path="/super-admin/staff-admins" element={<ProtectedRoute roles={['SUPER_ADMIN']}><StaffAdmins /></ProtectedRoute>} />
      <Route path="/super-admin/alumni" element={<ProtectedRoute roles={['SUPER_ADMIN']}><AllAlumni /></ProtectedRoute>} />
      <Route path="/super-admin/students" element={<ProtectedRoute roles={['SUPER_ADMIN']}><AllStudents /></ProtectedRoute>} />
      <Route path="/super-admin/pending" element={<ProtectedRoute roles={['SUPER_ADMIN']}><SuperPendingVerification /></ProtectedRoute>} />

      {/* Staff Admin */}
      <Route path="/staff-admin" element={<ProtectedRoute roles={['STAFF_ADMIN']}><StaffAdminDashboard /></ProtectedRoute>} />
      <Route path="/staff-admin/pending" element={<ProtectedRoute roles={['STAFF_ADMIN']}><StaffPendingVerification /></ProtectedRoute>} />
      <Route path="/staff-admin/alumni" element={<ProtectedRoute roles={['STAFF_ADMIN']}><DepartmentAlumni /></ProtectedRoute>} />

      {/* Alumni */}
      <Route path="/alumni" element={<ProtectedRoute roles={['ALUMNI']}><AlumniProfile /></ProtectedRoute>} />

      {/* Student */}
      <Route path="/student" element={<ProtectedRoute roles={['STUDENT']}><FindAlumni /></ProtectedRoute>} />
      <Route path="/student/mentor-match" element={<ProtectedRoute roles={['STUDENT']}><MentorMatch /></ProtectedRoute>} />

      <Route path="*" element={<Home />} />
    </Routes>
  );
}
