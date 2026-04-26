import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../features/auth/authSlice';
import { useTheme } from '../hooks/useTheme';
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
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, tenantLogo, primaryColor } = useSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Projects', path: '/projects', icon: <ClipboardList size={20} /> },
    { name: 'Team', path: '/team', icon: <Users2 size={20} />, adminOnly: true },
    {
      name: 'Pending Users',
      path: '/pending-users',
      icon: <UserCheck size={20} />,
      adminOnly: true,
    },
    { name: 'Profile', path: '/profile', icon: <User size={20} /> },
  ];

  const filteredMenu = menuItems.filter((item) => !item.adminOnly || user?.role === 'ADMIN');

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-header" style={{ borderBottomColor: primaryColor }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {tenantLogo ? (
                <img src={tenantLogo} alt="Logo" style={{ height: '32px', borderRadius: '4px' }} />
              ) : (
                <span className="logo-text">Trackify</span>
              )}
            </div>
          )}
          <button
            className="theme-toggle hide-mobile"
            onClick={() => setCollapsed(!collapsed)}
            style={{ marginLeft: 'auto' }}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
          <button className="theme-toggle show-mobile" onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>

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

        <div className="sidebar-footer">
          <button
            className="nav-item"
            onClick={handleLogout}
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <LogOut size={20} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <button className="theme-toggle show-mobile" onClick={() => setMobileOpen(true)}>
            <Menu size={24} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto' }}>
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                paddingLeft: '1rem',
                borderLeft: '1px solid var(--border-main)',
              }}
            >
              <div
                className="avatar-circle"
                style={{
                  overflow: 'hidden',
                  backgroundColor: !user?.profilePhotoUrl ? primaryColor : undefined,
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
              <div className="hide-mobile" style={{ flexDirection: 'column' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                  {user?.email?.split('@')[0]}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="page-body">{children}</div>
      </main>

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
