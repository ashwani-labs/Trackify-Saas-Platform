import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { useTheme } from '../hooks/useTheme';
import { useMasterSearch } from '../hooks/useMasterSearch';
import { LayoutDashboard, Users, LogOut, Sun, Moon, Menu, X, Search, Layout } from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();
  const { query, setQuery } = useMasterSearch();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const navItems = [
    { name: 'Dashboard', path: ROUTES.DASHBOARD, icon: <LayoutDashboard size={18} /> },
    { name: 'Tenants', path: ROUTES.TENANTS, icon: <Users size={18} /> },
    { name: 'Audit log', path: ROUTES.AUDIT, icon: <Search size={18} /> },
  ];

  return (
    <div className="layout-container layout-container--column">
      <header className="top-bar">
        <button
          type="button"
          className="theme-toggle show-mobile"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="top-bar__brand-group">
          <button
            type="button"
            className="top-bar__brand"
            onClick={() => navigate(ROUTES.DASHBOARD)}
          >
            <span className="top-bar__brand-icon">
              <Layout size={18} color="white" />
            </span>
            <span className="top-bar__brand-text">
              Trackify <span className="top-bar__brand-muted">Master</span>
            </span>
          </button>
        </div>

        <div className="hide-mobile master-search">
          <div className="input-wrap">
            <Search className="input-wrap__icon" size={14} aria-hidden />
            <input
              type="search"
              className="input input--with-icon master-search__input"
              placeholder="Search tenants by name, domain, plan..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search tenants"
            />
          </div>
        </div>

        <div className="top-bar__actions">
          <button
            type="button"
            className="btn btn--primary hide-mobile top-bar__create"
            onClick={() => navigate(ROUTES.TENANTS)}
          >
            Create tenant
          </button>

          <button
            type="button"
            className="theme-toggle top-bar__icon-btn"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <div className="avatar-circle top-bar__avatar" title="Master admin" aria-hidden>
            M
          </div>
        </div>
      </header>

      <div className="layout-body">
        <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
          <div className="sidebar-header show-mobile">
            <span className="logo-text">Trackify</span>
            <button
              type="button"
              className="theme-toggle"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
            >
              <X size={20} />
            </button>
          </div>

          <div className="sidebar-section-label">
            <span>Administration</span>
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
            <button type="button" className="nav-item nav-item--button" onClick={handleLogout}>
              <LogOut size={18} />
              <span>Sign out</span>
            </button>
          </div>
        </aside>

        <main className="main-content">
          <div className="page-body">{children}</div>
        </main>
      </div>

      {mobileOpen && (
        <div
          className="modal-overlay modal-overlay--nav"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}
    </div>
  );
};

export default DashboardLayout;
