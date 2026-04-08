import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { LayoutDashboard, Users, LogOut, Bell, Search, Settings } from 'lucide-react';
import styles from './DashboardLayout.module.css';

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logoContainer}>
          <div className={styles.logo}>
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <path d="M16 3L29 9.5V22.5L16 29L3 22.5V9.5L16 3Z" fill="url(#layoutG)"/>
              <path d="M11 16l3.5 3.5L21 12" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="layoutG" x1="3" y1="3" x2="29" y2="29" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#7c6fff"/>
                  <stop offset="1" stopColor="#a78bfa"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className={styles.brandName}>Master<span style={{color: '#a78bfa'}}>.App</span></span>
        </div>

        <nav className={styles.nav}>
          <NavLink 
            to={ROUTES.DASHBOARD} 
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink 
            to={ROUTES.TENANTS} 
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <Users size={20} />
            <span>Tenants</span>
          </NavLink>
          
          {/* Placeholder for future features */}
          <div className={styles.navItemDisabled} title="Coming Soon">
            <Settings size={20} />
            <span>Settings</span>
          </div>
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={20} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        {/* Top Navbar */}
        <header className={styles.topNav}>
          <div className={styles.searchBar}>
            <Search size={18} className={styles.searchIcon} />
            <input type="text" placeholder="Search across all tenants..." className={styles.searchInput} />
          </div>
          
          <div className={styles.navActions}>
            <button className={styles.iconBtn}>
              <Bell size={20} />
              <span className={styles.badge}></span>
            </button>
            <div className={styles.userProfile}>
              <div className={styles.avatar}>M</div>
              <span className={styles.userName}>Master Admin</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className={styles.pageWrapper}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
