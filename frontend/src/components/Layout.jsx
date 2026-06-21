import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  ClipboardCheck,
  Search,
  UserCircle,
  LogOut,
  Sparkles,
  GraduationCap as Logo,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = {
  SUPER_ADMIN: [
    { to: '/super-admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/super-admin/pending', label: 'Pending Verification', icon: ClipboardCheck },
    { to: '/super-admin/departments', label: 'Departments', icon: Building2 },
    { to: '/super-admin/staff-admins', label: 'Staff Admins', icon: Users },
    { to: '/super-admin/alumni', label: 'All Alumni', icon: GraduationCap },
    { to: '/super-admin/students', label: 'All Students', icon: UserCircle },
  ],
  STAFF_ADMIN: [
    { to: '/staff-admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/staff-admin/pending', label: 'Pending Verification', icon: ClipboardCheck },
    { to: '/staff-admin/alumni', label: 'Department Alumni', icon: GraduationCap },
  ],
  ALUMNI: [
    { to: '/alumni', label: 'My Profile', icon: UserCircle },
  ],
  STUDENT: [
    { to: '/student', label: 'Find Alumni', icon: Search },
    { to: '/student/mentor-match', label: 'Smart Mentor Match', icon: Sparkles },
  ],
};

const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Admin',
  STAFF_ADMIN: 'Staff Admin',
  ALUMNI: 'Alumni',
  STUDENT: 'Student',
};

const PAGE_TITLES = {
  '/super-admin': 'College Dashboard',
  '/super-admin/pending': 'Pending Verification',
  '/super-admin/departments': 'Departments',
  '/super-admin/staff-admins': 'Staff Admins',
  '/super-admin/alumni': 'All Alumni',
  '/super-admin/students': 'All Students',
  '/staff-admin': 'Department Dashboard',
  '/staff-admin/pending': 'Pending Verification',
  '/staff-admin/alumni': 'Department Alumni',
  '/alumni': 'My Profile',
  '/student': 'Find Alumni',
  '/student/mentor-match': 'Smart Mentor Match',
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navItems = NAV_ITEMS[user?.role] || [];

  useEffect(() => {
    setSidebarOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const currentPath = '/' + location.pathname.split('/').slice(1, 3).join('/');
  const pageTitle = PAGE_TITLES[currentPath] || PAGE_TITLES[location.pathname] || 'Dashboard';

  return (
    <div className="h-screen flex bg-surface-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          w-64 bg-brand-900 text-white
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <Logo className="h-7 w-7 text-accent-400" />
            <span className="text-lg font-bold tracking-tight">Alumexa</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-brand-100 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-white/10 text-white' : 'text-brand-100 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between bg-white border-b border-surface-200 px-4 py-3 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-slate-600 hover:text-slate-800 transition"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              <Logo className="h-6 w-6 text-brand-700" />
              <span className="font-bold text-slate-800">Alumexa</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium truncate max-w-[100px]">{user?.username}</span>
            <button
              onClick={handleLogout}
              className="text-xs text-slate-400 hover:text-rose-600 transition p-1"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Desktop top bar */}
        <header className="hidden md:flex items-center justify-between bg-white border-b border-surface-200 px-8 py-4 sticky top-0 z-30">
          <div>
            <h1 className="text-xl font-bold text-slate-800">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase tracking-wide">{ROLE_LABELS[user?.role]}</p>
              <p className="text-sm font-semibold text-slate-700">{user?.username}</p>
            </div>
            <button
              onClick={handleLogout}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              <LogOut className="h-3.5 w-3.5" /> Log out
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto overflow-x-hidden scrollbar-brand">
          {children}
        </main>
      </div>
    </div>
  );
}