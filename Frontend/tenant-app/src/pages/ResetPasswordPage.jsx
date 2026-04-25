import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import axios from '../utils/axios';
import AuthLayout from '../layouts/AuthLayout';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token || !email) {
      setError('Invalid reset link. Missing token or email parameter.');
    }
  }, [token, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token || !email) return;

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await axios.post('http://localhost:8080/auth/reset-password', {
        email,
        token,
        newPassword,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to reset password. The link may have expired.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Set New Password" subtitle="Please enter your new password below">
      {success ? (
        <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease-out' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              color: 'var(--success)',
            }}
          >
            <CheckCircle2 size={32} />
          </div>
          <p style={{ color: 'var(--text-main)', marginBottom: '2rem', lineHeight: '1.6' }}>
            Your password has been successfully reset.
          </p>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Redirecting to login in a few seconds...
          </div>
          <Link
            to="/login"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1.5rem' }}
          >
            Go to Login <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <div style={{ position: 'relative' }}>
              <Lock
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
                size={18}
              />
              <input
                type="password"
                className="input-field"
                style={{ paddingLeft: '3rem' }}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <Lock
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
                size={18}
              />
              <input
                type="password"
                className="input-field"
                style={{ paddingLeft: '3rem' }}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <div
              className="badge badge-danger"
              style={{
                width: '100%',
                padding: '0.75rem',
                marginBottom: '1.5rem',
                justifyContent: 'center',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', height: '48px', marginBottom: '1.5rem' }}
            disabled={isLoading || !token || !email || !newPassword || !confirmPassword}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>

          <p className="form-footer">
            <Link to="/login" className="form-link">
              Cancel and return to login
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
};

export default ResetPasswordPage;
