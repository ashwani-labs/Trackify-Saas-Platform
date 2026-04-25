import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { useTheme } from '../context/ThemeContext';
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
    { name: 'Dashboard', path: ROUTES.DASHBOARD, icon: <LayoutDashboard size={20} /> },
    { name: 'Tenants', path: ROUTES.TENANTS, icon: <Users size={20} /> },
  ];

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                padding: '0.5rem',
                background: 'var(--primary)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <Layout size={20} color="white" />
            </div>
            <span className="logo-text">Master.App</span>
          </div>
          <button className="theme-toggle show-mobile" onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>
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
            <LogOut size={20} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <button className="theme-toggle show-mobile" onClick={() => setMobileOpen(true)}>
            <Menu size={24} />
          </button>

          <div
            className="hide-mobile"
            style={{
              alignItems: 'center',
              gap: '1rem',
              flex: 1,
              maxWidth: '400px',
              margin: '0 2rem',
            }}
          >
            <div style={{ position: 'relative', width: '100%' }}>
              <Search
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
                size={16}
              />
              <input
                type="text"
                className="input-field"
                placeholder="Search tenants..."
                style={{ paddingLeft: '2.5rem', height: '40px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto' }}>
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <div className="avatar-circle">M</div>
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
