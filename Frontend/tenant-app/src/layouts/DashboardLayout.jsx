import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink, useNavigate, useMatch, useLocation } from 'react-router-dom';
import CreateMenu from '../components/common/CreateMenu';
import GlobalSearch from '../components/common/GlobalSearch';
import NotificationBell from '../components/common/NotificationBell';
import { logout } from '../features/auth/authSlice';
import { useTheme } from '../hooks/useTheme';
import {
  ROLES,
  KeyboardShortcutsPanel,
  useKeyboardShortcuts,
  useRecentItems,
} from '@trackify/shared';
import {
  LayoutDashboard,
  LogOut,
  ClipboardList,
  UserCheck,
  Users2,
  Sun,
  Moon,
  Menu,
  X,
  User,
  Settings,
  ScrollText,
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const searchRef = useRef(null);
  const { user, tenantLogo, primaryColor } = useSelector((state) => state.auth);
  const { currentProject } = useSelector((state) => state.projects);
  const projectMatch = useMatch('/projects/:id');
  const location = useLocation();
  const activeProject =
    projectMatch && currentProject?.id === Number(projectMatch.params.id) ? currentProject : null;
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: recentItems, trackVisit } = useRecentItems('trackify-recent-nav');
  const { showHelp, setShowHelp } = useKeyboardShortcuts({
    onSearchFocus: () => searchRef.current?.focus?.(),
    onNavigate: (path) => navigate(path),
  });

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Projects', path: '/projects', icon: <ClipboardList size={18} /> },
    { name: 'Team', path: '/team', icon: <Users2 size={18} />, adminOnly: true },
    {
      name: 'Pending Users',
      path: '/pending-users',
      icon: <UserCheck size={18} />,
      adminOnly: true,
    },
    {
      name: 'Workspace',
      path: '/workspace-settings',
      icon: <Settings size={18} />,
      adminOnly: true,
    },
    {
      name: 'Audit log',
      path: '/workspace-audit',
      icon: <ScrollText size={18} />,
      adminOnly: true,
    },
    { name: 'Profile', path: '/profile', icon: <User size={18} /> },
  ];

  const filteredMenu = menuItems.filter((item) => !item.adminOnly || user?.role === ROLES.ADMIN);

  useEffect(() => {
    if (activeProject?.id) {
      trackVisit({
        id: `project-${activeProject.id}`,
        label: activeProject.name,
        path: `/projects/${activeProject.id}`,
      });
    }
  }, [activeProject?.id, activeProject?.name, trackVisit]);

  return (
    <div className="layout-container layout-container--stacked">
      <KeyboardShortcutsPanel isOpen={showHelp} onClose={() => setShowHelp(false)} />

      <header className="top-bar">
        <button
          type="button"
          className="theme-toggle show-mobile"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="topbar-brand" onClick={() => navigate('/dashboard')} role="presentation">
          {tenantLogo ? (
            <img src={tenantLogo} alt="Logo" className="topbar-brand__logo-img" />
          ) : (
            <div
              className="topbar-brand__logo"
              style={{ backgroundColor: primaryColor || 'var(--primary)' }}
            >
              <LayoutDashboard size={16} color="white" />
            </div>
          )}
          <span className="topbar-brand__name">Trackify</span>
        </div>

        <GlobalSearch inputRef={searchRef} />

        <div className="topbar-actions">
          <CreateMenu />
          <NotificationBell />

          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            style={{ width: '32px', height: '32px' }}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <div
            className="avatar-circle"
            role="img"
            aria-label="User profile"
            onClick={() => navigate('/profile')}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/profile')}
            tabIndex={0}
            style={{
              width: '28px',
              height: '28px',
              fontSize: '0.75rem',
              overflow: 'hidden',
              backgroundColor: !user?.profilePhotoUrl
                ? primaryColor || 'var(--primary)'
                : undefined,
              cursor: 'pointer',
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
        <aside
          className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'open' : ''}`}
          onMouseEnter={() => setCollapsed(false)}
          onMouseLeave={() => setCollapsed(true)}
        >
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

          {!collapsed && activeProject && (
            <div className="sidebar-context">
              <span className="sidebar-context__label">Current project</span>
              <p className="sidebar-context__name" title={activeProject.name}>
                {activeProject.name}
              </p>
            </div>
          )}

          {!collapsed && recentItems.length > 0 && (
            <div className="sidebar-recent">
              <span className="sidebar-context__label">Recent</span>
              <ul className="sidebar-recent__list">
                {recentItems.slice(0, 3).map((item) => (
                  <li key={`${item.id}-${item.path}`}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `sidebar-recent__link${isActive || location.pathname === item.path ? ' sidebar-recent__link--active' : ''}`
                      }
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
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

          <div className="sidebar-footer">
            <button type="button" className="nav-item" onClick={handleLogout}>
              <span>
                <LogOut size={18} />
              </span>
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </aside>

        <main className="main-content main-content--constrained">
          <div className="page-body page-body--scroll">{children}</div>
        </main>
      </div>

      {mobileOpen && (
        <div
          className="modal-overlay"
          style={{ zIndex: 45 }}
          onClick={() => setMobileOpen(false)}
          role="presentation"
        />
      )}
    </div>
  );
};

export default DashboardLayout;
