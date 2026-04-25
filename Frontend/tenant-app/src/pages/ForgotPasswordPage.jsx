import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import axios from '../utils/axios';
import AuthLayout from '../layouts/AuthLayout';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await axios.post('http://localhost:8080/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email to receive recovery instructions"
    >
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
            If an account with <strong>{email}</strong> exists, an email has been sent with further
            instructions.
          </p>
          <Link to="/login" className="btn btn-secondary" style={{ width: '100%' }}>
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail
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
                type="email"
                className="input-field"
                style={{ paddingLeft: '3rem' }}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
            disabled={isLoading || !email}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>

          <p className="form-footer">
            Remembered your password?{' '}
            <Link to="/login" className="form-link">
              Sign in
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
