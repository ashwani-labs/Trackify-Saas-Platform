import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
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
      title="Can't log in?"
      subtitle="We'll send a recovery link to your email"
    >
      {success ? (
        <div style={{ textAlign: 'center', animation: 'fadeIn 0.4s ease-out', marginTop: '1.5rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#DEEBFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              color: 'var(--primary)',
            }}
          >
            <Mail size={32} />
          </div>
          <p style={{ color: 'var(--text-main)', marginBottom: '2rem', lineHeight: '1.6', fontSize: '0.875rem' }}>
            If an account with <strong>{email}</strong> exists, an email has been sent with further
            instructions.
          </p>
          <Link to="/login" className="btn btn-secondary" style={{ width: '100%', height: '40px' }}>
            Return to login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)' }}>EMAIL ADDRESS</label>
            <input
              type="email"
              className="input-field"
              placeholder="e.g. alex@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            style={{ width: '100%', height: '40px', fontSize: '0.875rem', fontWeight: '600', marginBottom: '1.5rem' }}
            disabled={isLoading || !email}
          >
            {isLoading ? 'Sending link...' : 'Send recovery link'}
          </button>

          <div style={{ textAlign: 'center', borderTop: '1px solid var(--border-main)', paddingTop: '1.5rem' }}>
             <Link to="/login" style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: '600' }}>
               Return to login
             </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
