import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../services/authApi';
import { useAppDispatch } from '../app/hooks';
import { setCredentials } from '../features/auth/authSlice';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/routes';
import AuthLayout from '../layouts/AuthLayout';
import { Eye, EyeOff, Shield, Loader2 } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  useAuth({ requireGuest: true });

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setApiError('');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      }).unwrap();

      dispatch(
        setCredentials({
          token: result.token,
          role: result.role,
          tenant_id: result.tenant_id,
        })
      );

      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      setApiError(err?.data?.message || err?.error || 'Invalid credentials');
    }
  };

  return (
    <AuthLayout>
      <div className="auth-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <Shield size={20} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>Trackify <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>Master</span></span>
        </div>
        <h1 className="auth-title" style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', textAlign: 'center' }}>Access Master Panel</h1>
        <p className="auth-subtitle" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center' }}>Sign in to manage the Trackify platform</p>
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
        <div className="form-group">
          <label className="form-label" style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)' }}>EMAIL ADDRESS</label>
          <input
            name="email"
            type="email"
            className="input-field"
            placeholder="admin@trackify.io"
            value={form.email}
            onChange={handleChange}
            required
            style={{ height: '40px', fontSize: '0.875rem' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)' }}>PASSWORD</label>
          <div style={{ position: 'relative' }}>
            <input
              name="password"
              type={showPass ? 'text' : 'password'}
              className="input-field"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              style={{ height: '40px', fontSize: '0.875rem' }}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="theme-toggle"
              style={{
                position: 'absolute',
                right: '0.25rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '32px',
                height: '32px',
              }}
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {apiError && (
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
            {apiError}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary"
          style={{ width: '100%', height: '40px', fontSize: '0.875rem', fontWeight: '600' }}
        >
          {isLoading ? (
            <Loader2 style={{ animation: 'loading 2s linear infinite' }} size={18} />
          ) : (
            'Log in'
          )}
        </button>

        <p className="form-footer" style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-main)', paddingTop: '1.5rem' }}>
          Authorized platform administrators only.
        </p>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
