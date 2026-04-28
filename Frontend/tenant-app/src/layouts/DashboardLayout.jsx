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
  Search,
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(true);
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

  const filteredMenu = menuItems.filter((item) => !item.adminOnly || user?.role === 'ADMIN');

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

        <div className="hide-mobile" style={{ flex: 1, maxWidth: '400px', margin: '0 2rem' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
              size={14}
            />
            <input
              type="text"
              className="input-field"
              placeholder="Search..."
              style={{ 
                paddingLeft: '2.25rem', 
                height: '32px', 
                fontSize: '0.875rem',
                backgroundColor: 'transparent',
                border: '2px solid var(--border-main)'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
          <button className="btn btn-primary hide-mobile" style={{ height: '32px', padding: '0 0.75rem' }}>
            Create
          </button>

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

          {!collapsed && (
            <div style={{ padding: '1.5rem 0.75rem 0.5rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', paddingLeft: '0.75rem' }}>
                Project Context
              </span>
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
