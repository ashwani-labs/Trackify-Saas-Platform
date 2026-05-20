import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink, useNavigate, useMatch } from 'react-router-dom';
import CreateMenu from '../components/common/CreateMenu';
import GlobalSearch from '../components/common/GlobalSearch';
import { logout } from '../features/auth/authSlice';
import { useTheme } from '../hooks/useTheme';
import { ROLES } from '@trackify/shared';
import {
  LayoutDashboard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  UserCheck,
  Users2,
  Sun,
  Moon,
  Menu,
  X,
  User,
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, tenantLogo, primaryColor } = useSelector((state) => state.auth);
  const { currentProject } = useSelector((state) => state.projects);
  const projectMatch = useMatch('/projects/:id');
  const activeProject =
    projectMatch && currentProject?.id === Number(projectMatch.params.id)
      ? currentProject
      : null;
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
    { name: 'Projects', path: '/projects', icon: <ClipboardList size={18} /> },
    { name: 'Team', path: '/team', icon: <Users2 size={18} />, adminOnly: true },
    {
      name: 'Pending Users',
      path: '/pending-users',
      icon: <UserCheck size={18} />,
      adminOnly: true,
    },
    { name: 'Profile', path: '/profile', icon: <User size={18} /> },
  ];

  const filteredMenu = menuItems.filter((item) => !item.adminOnly || user?.role === ROLES.ADMIN);

  return (
    <div className="layout-container" style={{ flexDirection: 'column' }}>
      {/* Top Navigation */}
      <header className="top-bar">
        <button className="theme-toggle show-mobile" onClick={() => setMobileOpen(true)}>
          <Menu size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
            {tenantLogo ? (
              <img src={tenantLogo} alt="Logo" style={{ height: '24px', borderRadius: '3px' }} />
            ) : (
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  background: 'var(--primary)',
                  borderRadius: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <LayoutDashboard size={16} color="white" />
              </div>
            )}
            <span style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
              Trackify
            </span>
          </div>

          <nav className="hide-mobile" style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
             {/* Global navigation items could go here */}
          </nav>
        </div>

        <GlobalSearch />

        <div className="topbar-actions">
          <CreateMenu />

          <button className="theme-toggle" onClick={toggleTheme} style={{ width: '32px', height: '32px' }}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <div
            className="avatar-circle"
            style={{
              width: '28px',
              height: '28px',
              fontSize: '0.75rem',
              overflow: 'hidden',
              backgroundColor: !user?.profilePhotoUrl ? (primaryColor || 'var(--primary)') : undefined,
              cursor: 'pointer'
            }}
          >
            {user?.profilePhotoUrl ? (
              <img
                src={user.profilePhotoUrl}
                alt="Profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              user?.email?.charAt(0).toUpperCase()
            )}
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside 
          className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'open' : ''}`}
          onMouseEnter={() => setCollapsed(false)}
          onMouseLeave={() => setCollapsed(true)}
        >
          <div className="sidebar-header show-mobile">
            <span className="logo-text">Trackify</span>
            <button className="theme-toggle" onClick={() => setMobileOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {!collapsed && activeProject && (
            <div className="sidebar-context">
              <span className="sidebar-context__label">Current project</span>
              <p className="sidebar-context__name" title={activeProject.name}>
                {activeProject.name}
              </p>
            </div>
          )}

          <nav className="nav-menu">
            {filteredMenu.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <span>{item.icon}</span>
                {!collapsed && <span>{item.name}</span>}
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-footer" style={{ marginTop: 'auto', borderTop: '1px solid var(--border-main)' }}>
            <button
              className="nav-item"
              onClick={handleLogout}
              style={{ width: 'calc(100% - 1rem)', background: 'none', border: 'none', cursor: 'pointer', margin: '0.5rem' }}
            >
              <span><LogOut size={18} /></span>
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content" style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <div className="page-body" style={{ width: '100%', maxWidth: '100%', overflowY: 'auto', height: 'calc(100vh - var(--topbar-height))' }}>
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="modal-overlay"
          style={{ zIndex: 45 }}
          onClick={() => setMobileOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
