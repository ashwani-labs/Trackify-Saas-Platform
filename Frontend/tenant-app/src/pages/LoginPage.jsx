import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, clearError } from '../features/auth/authSlice';
import AuthLayout from '../layouts/AuthLayout';
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
    <AuthLayout title="Log in to continue" subtitle="Enter your credentials to access your workspace">
      <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
        <div className="form-group">
          <label className="form-label" htmlFor="email" style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>
            EMAIL ADDRESS
          </label>
          <input
            id="email"
            type="email"
            className="input-field"
            placeholder="e.g. alex@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ height: '40px', fontSize: '0.875rem' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem',
            }}
          >
            <label className="form-label" style={{ marginBottom: 0, fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }} htmlFor="password">
              PASSWORD
            </label>
            <Link to="/forgot-password" style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600' }}>
              Can't log in?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            className="input-field"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          disabled={loading}
          className="btn btn-primary"
          style={{ width: '100%', height: '40px', fontSize: '0.875rem', fontWeight: '600' }}
        >
          {loading ? (
            <Loader2 style={{ animation: 'loading 2s linear infinite' }} size={18} />
          ) : (
            'Log in'
          )}
        </button>

        <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid var(--border-main)', paddingTop: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            New to Trackify?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600' }}>
              Create an account
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
