import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { useTheme } from '../hooks/useTheme';
import { LayoutDashboard, Users, LogOut, Sun, Moon, Menu, X, Search, Layout } from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const navItems = [
    { name: 'Dashboard', path: ROUTES.DASHBOARD, icon: <LayoutDashboard size={18} /> },
    { name: 'Tenants', path: ROUTES.TENANTS, icon: <Users size={18} /> },
  ];

  return (
    <div className="layout-container" style={{ flexDirection: 'column' }}>
      {/* Top Navigation */}
      <header className="top-bar">
        <button className="theme-toggle show-mobile" onClick={() => setMobileOpen(true)}>
          <Menu size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => navigate(ROUTES.DASHBOARD)}>
            <div
              style={{
                padding: '0.4rem',
                background: 'var(--primary)',
                borderRadius: '3px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Layout size={18} color="white" />
            </div>
            <span style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
              Trackify <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>Master</span>
            </span>
          </div>

          <nav className="hide-mobile" style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
             {/* Global Nav Links can go here in Jira, but we'll keep them in sidebar for now or move some here */}
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
              cursor: 'pointer',
              border: '2px solid transparent'
            }}
          >
            M
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
          <div className="sidebar-header show-mobile">
             <span className="logo-text">Trackify</span>
             <button className="theme-toggle" onClick={() => setMobileOpen(false)}>
               <X size={20} />
             </button>
          </div>

          <div style={{ padding: '1.5rem 0.75rem 0.5rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', paddingLeft: '0.75rem' }}>
              Administration
            </span>
          </div>

          <nav className="nav-menu">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-footer">
            <button
              className="nav-item"
              onClick={handleLogout}
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <LogOut size={18} />
              <span>Sign out</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <div className="page-body">{children}</div>
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
