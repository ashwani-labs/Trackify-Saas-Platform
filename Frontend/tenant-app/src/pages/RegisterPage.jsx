import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, clearError } from '../features/auth/authSlice';
import AuthLayout from '../layouts/AuthLayout';
import styles from './RegisterPage.module.css';
import { UserPlus, Mail, Lock, User, Loader2, CheckCircle2 } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    tenantId: '', // In a real app, this might be inferred from the URL or a separate step
  });
  const [isSuccess, setIsSuccess] = useState(false);
  
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(registerUser(formData));
    if (registerUser.fulfilled.match(result)) {
      setIsSuccess(true);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout 
        title="Check your email" 
        subtitle="We've received your request"
      >
        <div className={styles.successContainer}>
          <div className={styles.successIconWrapper}>
            <CheckCircle2 className={styles.successIcon} size={48} />
          </div>
          <p className={styles.successText}>
            Your registration is pending approval by your workspace administrator. You'll receive an email once your account is active.
          </p>
          <Link to="/login" className={styles.backBtn}>
            Back to Login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Join your team" 
      subtitle="Create an account to start collaborating"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="fullName" className={styles.label}>Full Name</label>
          <div className={styles.inputWrapper}>
            <User className={styles.icon} size={18} />
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="e.g. Alex Rivera"
              value={formData.fullName}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="email" className={styles.label}>Email Address</label>
          <div className={styles.inputWrapper}>
            <Mail className={styles.icon} size={18} />
            <input
              id="email"
              name="email"
              type="email"
              placeholder="e.g. alex@company.com"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="tenantId" className={styles.label}>Workspace ID</label>
          <div className={styles.inputWrapper}>
            <CheckCircle2 className={styles.icon} size={18} />
            <input
              id="tenantId"
              name="tenantId"
              type="number"
              placeholder="e.g. 1"
              value={formData.tenantId}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password" className={styles.label}>Password</label>
          <div className={styles.inputWrapper}>
            <Lock className={styles.icon} size={18} />
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
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
              Request Access
              <UserPlus size={18} className={styles.btnIcon} />
            </>
          )}
        </button>

        <p className={styles.footer}>
          Already have an account? <Link to="/login" className={styles.link}>Sign in instead</Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
