import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../services/authApi';
import { useAppDispatch } from '../app/hooks';
import { setCredentials } from '../features/auth/authSlice';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/routes';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import styles from './LoginPage.module.css';

/* ── Inline SVG icons ── */
const EmailIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="3"/>
    <path d="m2 7 10 7 10-7"/>
  </svg>
);

const LockIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
    <line x1="2" x2="22" y1="2" y2="22"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
);

/* ── Validate helpers ── */
const validateEmail = (email) => {
  if (!email.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address';
  return '';
};

const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return '';
};

/* ════════════════════════════════════════════
   LOGIN PAGE
   ════════════════════════════════════════════ */
const LoginPage = () => {
  const navigate   = useNavigate();
  const dispatch   = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  // Redirect away if already logged in
  useAuth({ requireGuest: true });

  const [form, setForm]     = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [showPass, setShowPass]   = useState(false);
  const [apiError, setApiError]   = useState('');
  const [shakeForm, setShakeForm] = useState(false);

  /* Handle input changes */
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error as user types
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setApiError('');
  }, []);

  /* Validate all fields, return true if valid */
  const validateAll = () => {
    const emailErr    = validateEmail(form.email);
    const passwordErr = validatePassword(form.password);
    setErrors({ email: emailErr, password: passwordErr });
    return !emailErr && !passwordErr;
  };

  /* Submit handler */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) {
      triggerShake();
      return;
    }

    try {
      const result = await login({
        email:    form.email.trim().toLowerCase(),
        password: form.password,
      }).unwrap();

      // Save credentials in Redux + localStorage
      dispatch(setCredentials({
        token:     result.token,
        role:      result.role,
        tenant_id: result.tenant_id,
      }));

      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      const msg = err?.data?.message || err?.error || 'Invalid credentials. Please try again.';
      setApiError(msg);
      triggerShake();
    }
  };

  const triggerShake = () => {
    setShakeForm(true);
    setTimeout(() => setShakeForm(false), 600);
  };

  return (
    <AuthLayout>
      <div className={`${styles.card} ${shakeForm ? styles['card--shake'] : ''}`}>

        {/* ── Header ── */}
        <div className={styles.header}>
          {/* Logo mark */}
          <div className={styles.logoWrap}>
            <div className={styles.logoRing} aria-hidden="true" />
            <div className={styles.logoIcon} aria-label="Trackify Logo">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <path d="M16 3L29 9.5V22.5L16 29L3 22.5V9.5L16 3Z" fill="url(#logoGrad)" />
                <path d="M11 16l3.5 3.5L21 12" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="logoGrad" x1="3" y1="3" x2="29" y2="29" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#7c6fff"/>
                    <stop offset="1" stopColor="#a78bfa"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          <div className={styles.badge}>
            <ShieldIcon />
            <span>Master Control</span>
          </div>

          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>
            Sign in to your platform&nbsp;owner account to manage tenants, plans, and configurations.
          </p>
        </div>

        {/* ── Divider ── */}
        <div className={styles.divider} aria-hidden="true" />

        {/* ── Form ── */}
        <form
          className={styles.form}
          onSubmit={handleSubmit}
          noValidate
          aria-label="Master login form"
        >
          <Input
            id="master-email"
            name="email"
            type="email"
            label="Email address"
            placeholder="you@company.com"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            leftIcon={<EmailIcon />}
            autoComplete="email"
            required
            disabled={isLoading}
          />

          <Input
            id="master-password"
            name="password"
            type={showPass ? 'text' : 'password'}
            label="Password"
            placeholder="••••••••••"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            leftIcon={<LockIcon />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className={styles.eyeBtn}
                aria-label={showPass ? 'Hide password' : 'Show password'}
                tabIndex={0}
              >
                {showPass ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            }
            autoComplete="current-password"
            required
            disabled={isLoading}
          />

          {/* ── API Error Banner ── */}
          {apiError && (
            <div className={styles.errorBanner} role="alert" aria-live="assertive">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {apiError}
            </div>
          )}

          {/* ── Submit ── */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            id="login-submit-btn"
          >
            {isLoading ? 'Signing in…' : 'Sign in to Master Control'}
          </Button>
        </form>

        {/* ── Footer note ── */}
        <p className={styles.footerNote}>
          This portal is restricted to authorized platform owners only.
          <br />
          Unauthorized access attempts are monitored and logged.
        </p>

      </div>
    </AuthLayout>
  );
};

export default LoginPage;
