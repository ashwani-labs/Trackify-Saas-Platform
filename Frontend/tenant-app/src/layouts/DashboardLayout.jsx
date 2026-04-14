import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../features/auth/authSlice';
import styles from './DashboardLayout.module.css';
import { 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  ClipboardList,
  UserCheck,
  Users2,
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard',     path: '/',              icon: <LayoutDashboard size={20} /> },
    { name: 'Projects',      path: '/projects',      icon: <ClipboardList size={20} /> },
    { name: 'Team',          path: '/team',           icon: <Users2 size={20} />,    adminOnly: true },
    { name: 'Pending Users', path: '/pending-users',  icon: <UserCheck size={20} />, adminOnly: true },
  ];

  const filteredMenu = menuItems.filter(item => !item.adminOnly || user?.role === 'ADMIN');

  return (
    <div className={styles.container}>
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          {!collapsed && <span className={styles.logo}>Trackify</span>}
          <button className={styles.toggleBtn} onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className={styles.nav}>
          {filteredMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {!collapsed && <span className={styles.navText}>{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={20} />
            {!collapsed && <span className={styles.navText}>Logout</span>}
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.userSection}>
              <div className={styles.userAvatar}>
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user?.email?.split('@')[0]}</span>
                <span className={styles.userRole}>{user?.role}</span>
              </div>
            </div>
          </div>
        </header>

        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
