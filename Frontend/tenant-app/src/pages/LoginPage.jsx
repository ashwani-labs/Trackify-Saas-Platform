import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, clearError } from '../features/auth/authSlice';
import AuthLayout from '../layouts/AuthLayout';
import styles from './LoginPage.module.css';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Sign in to your Trackify workspace"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="email" className={styles.label}>Email Address</label>
          <div className={styles.inputWrapper}>
            <Mail className={styles.icon} size={18} />
            <input
              id="email"
              type="email"
              placeholder="e.g. alex@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              required
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <div className={styles.labelWrapper}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <Link to="/forgot-password" className={styles.linkSmall}>Forgot password?</Link>
          </div>
          <div className={styles.inputWrapper}>
            <Lock className={styles.icon} size={18} />
            <input
              id="password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
            />
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <button 
          type="submit" 
          disabled={loading} 
          className={styles.submitBtn}
        >
          {loading ? (
            <Loader2 className={styles.spinner} size={20} />
          ) : (
            <>
              Sign In
              <LogIn size={18} className={styles.btnIcon} />
            </>
          )}
        </button>

        <p className={styles.footer}>
          New to Trackify? <Link to="/register" className={styles.link}>Join your team</Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
