import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
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
    <AuthLayout title="Choose a new password" subtitle="Create a secure password for your account">
      {success ? (
        <div style={{ textAlign: 'center', animation: 'fadeIn 0.4s ease-out', marginTop: '1.5rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#E3FCEF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              color: '#36B37E',
            }}
          >
            <CheckCircle2 size={32} />
          </div>
          <p style={{ color: 'var(--text-main)', marginBottom: '1.5rem', lineHeight: '1.6', fontSize: '0.875rem' }}>
            Your password has been successfully reset.
          </p>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '2rem' }}>
            Redirecting to login...
          </div>
          <Link
            to="/login"
            className="btn btn-primary"
            style={{ width: '100%', height: '40px' }}
          >
            Log in now
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)' }}>NEW PASSWORD</label>
            <input
              type="password"
              className="input-field"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={{ height: '40px', fontSize: '0.875rem' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)' }}>CONFIRM PASSWORD</label>
            <input
              type="password"
              className="input-field"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ height: '40px', fontSize: '0.875rem' }}
            />
          </div>

          {error && (
            <div
                style={{
                  padding: '0.75rem',
                  marginBottom: '1.5rem',
                  backgroundColor: '#FFEBE6',
                  color: '#BF2600',
                  borderRadius: '3px',
                  fontSize: '0.8rem',
                  textAlign: 'center',
                  border: '1px solid #FFBDAD'
                }}
              >
                {error}
              </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', height: '40px', fontSize: '0.875rem', fontWeight: '600' }}
            disabled={isLoading || !token || !email || !newPassword || !confirmPassword}
          >
            {isLoading ? 'Resetting...' : 'Reset password'}
          </button>

          <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid var(--border-main)', paddingTop: '1.5rem' }}>
             <Link to="/login" style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: '600' }}>
               Back to login
             </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};

export default ResetPasswordPage;
