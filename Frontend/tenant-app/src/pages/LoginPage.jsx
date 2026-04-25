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
    <AuthLayout title="Welcome Back" subtitle="Sign in to your Trackify workspace">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="email">
            Email Address
          </label>
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
              id="email"
              type="email"
              className="input-field"
              style={{ paddingLeft: '3rem' }}
              placeholder="e.g. alex@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem',
            }}
          >
            <label className="form-label" style={{ marginBottom: 0 }} htmlFor="password">
              Password
            </label>
            <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>
              Forgot password?
            </Link>
          </div>
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
              id="password"
              type="password"
              className="input-field"
              style={{ paddingLeft: '3rem' }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          disabled={loading}
          className="btn btn-primary"
          style={{ width: '100%', height: '48px', fontSize: '1rem' }}
        >
          {loading ? (
            <Loader2 style={{ animation: 'loading 2s linear infinite' }} size={20} />
          ) : (
            <>
              Sign In <LogIn size={18} />
            </>
          )}
        </button>

        <p className="form-footer">
          New to Trackify?{' '}
          <Link to="/register" className="form-link">
            Join your team
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
