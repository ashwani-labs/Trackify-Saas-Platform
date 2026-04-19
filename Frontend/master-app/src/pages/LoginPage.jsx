import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../services/authApi';
import { useAppDispatch } from '../app/hooks';
import { setCredentials } from '../features/auth/authSlice';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/routes';
import AuthLayout from '../layouts/AuthLayout';
import { Mail, Lock, Eye, EyeOff, Shield, Loader2 } from 'lucide-react';

const LoginPage = () => {
  const navigate   = useNavigate();
  const dispatch   = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  useAuth({ requireGuest: true });

  const [form, setForm]     = useState({ email: '', password: '' });
  const [showPass, setShowPass]   = useState(false);
  const [apiError, setApiError]   = useState('');

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setApiError('');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await login({
        email:    form.email.trim().toLowerCase(),
        password: form.password,
      }).unwrap();

      dispatch(setCredentials({
        token:     result.token,
        role:      result.role,
        tenant_id: result.tenant_id,
      }));

      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      setApiError(err?.data?.message || err?.error || 'Invalid credentials');
    }
  };

  return (
    <AuthLayout>
      <div className="auth-header">
        <div style={{ 
          width: '64px', 
          height: '64px', 
          background: 'var(--primary)', 
          borderRadius: 'var(--radius-lg)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 1.5rem',
          color: 'white',
          boxShadow: '0 0 20px rgba(14, 165, 233, 0.3)'
        }}>
          <Shield size={32} />
        </div>
        <h1 className="auth-title">Master Control</h1>
        <p className="auth-subtitle">Sign in to manage the Trackify platform</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <div style={{ position: 'relative' }}>
            <Mail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
            <input
              name="email"
              type="email"
              className="input-field"
              style={{ paddingLeft: '3rem' }}
              placeholder="admin@trackify.io"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <div style={{ position: 'relative' }}>
            <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
            <input
              name="password"
              type={showPass ? 'text' : 'password'}
              className="input-field"
              style={{ paddingLeft: '3rem', paddingRight: '3rem' }}
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
            <button 
              type="button" 
              onClick={() => setShowPass(!showPass)}
              className="theme-toggle"
              style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', width: '32px', height: '32px' }}
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {apiError && (
          <div className="badge badge-danger" style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
            {apiError}
          </div>
        )}

        <button 
          type="submit" 
          disabled={isLoading} 
          className="btn btn-primary"
          style={{ width: '100%', height: '48px', fontSize: '1rem', marginTop: '1rem' }}
        >
          {isLoading ? (
            <Loader2 style={{ animation: 'loading 2s linear infinite' }} size={20} />
          ) : 'Access Master Panel'}
        </button>

        <p className="form-footer" style={{ fontSize: '0.8rem' }}>
          This portal is restricted to authorized platform owners only.
        </p>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
