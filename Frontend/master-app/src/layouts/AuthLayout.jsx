import styles from './AuthLayout.module.css';

/**
 * AuthLayout — wraps all auth pages (login, forgot password, etc.)
 * Provides the animated background, centered card grid and branding.
 */
const AuthLayout = ({ children }) => {
  return (
    <div className={styles.layout}>
      {/* Animated background orbs */}
      <div className={styles.orb} data-orb="1" aria-hidden="true" />
      <div className={styles.orb} data-orb="2" aria-hidden="true" />
      <div className={styles.orb} data-orb="3" aria-hidden="true" />

      {/* Animated dot-grid overlay */}
      <div className={styles.grid} aria-hidden="true" />

      {/* Noise texture overlay */}
      <div className={styles.noise} aria-hidden="true" />

      {/* Content */}
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
};

export default AuthLayout;
