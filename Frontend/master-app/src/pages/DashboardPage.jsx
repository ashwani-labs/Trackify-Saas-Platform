import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/routes';
import Button from '../components/ui/Button';
import styles from './DashboardPage.module.css';

/**
 * DashboardPage — placeholder for Phase 2.
 * Demonstrates that the protected route and Redux logout work correctly.
 */
const DashboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Require auth — redirects to /login if not authenticated
  const { role } = useAuth({ requireAuth: true });

  const handleLogout = () => {
    dispatch(logout());
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Logo mark */}
        <div className={styles.logo} aria-label="Trackify">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M16 3L29 9.5V22.5L16 29L3 22.5V9.5L16 3Z" fill="url(#g2)"/>
            <path d="M11 16l3.5 3.5L21 12" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="g2" x1="3" y1="3" x2="29" y2="29" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7c6fff"/>
                <stop offset="1" stopColor="#a78bfa"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className={styles.badge}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
          </svg>
          Authenticated as {role || 'MASTER'}
        </div>

        <h1 className={styles.title}>Master Dashboard</h1>
        <p className={styles.subtitle}>
          You&apos;re logged in. The full dashboard experience — tenant management, billing, and platform analytics — is coming in Phase 2.
        </p>

        <div className={styles.phases}>
          {['Phase 1: Auth + Tenant ✓', 'Phase 2: Project + Issue', 'Phase 3: Board + Notifications', 'Phase 4: Scaling + Optimization'].map((phase, i) => (
            <div key={i} className={`${styles.phase} ${i === 0 ? styles['phase--done'] : ''}`}>
              {phase}
            </div>
          ))}
        </div>

        <Button variant="ghost" onClick={handleLogout} id="logout-btn">
          Sign out
        </Button>
      </div>
    </div>
  );
};

export default DashboardPage;
