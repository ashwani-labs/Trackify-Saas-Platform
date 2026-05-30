import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../services/authApi';
import { useAppDispatch } from '../app/hooks';
import { setCredentials } from '../features/auth/authSlice';
import { useAuth } from '../hooks/useAuth';
import { getApiErrorMessage, Button, Input, Alert } from '@trackify/shared';
import { ROUTES } from '../constants/routes';
import AuthLayout from '../layouts/AuthLayout';
import { Eye, EyeOff, Shield } from 'lucide-react';

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
      setApiError(getApiErrorMessage({ response: { data: err?.data } }, 'Invalid credentials'));
    }
  };

  return (
    <AuthLayout>
      <div className="auth-header">
        <div className="master-brand">
          <div className="master-brand__mark">
            <Shield size={20} />
          </div>
          <span className="master-brand__title">
            Trackify <span className="master-brand__subtitle">Master</span>
          </span>
        </div>
        <h1 className="auth-title">Access Master Panel</h1>
        <p className="auth-subtitle">Sign in to manage the Trackify platform</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <Input
          id="login-email"
          name="email"
          label="Email address"
          type="email"
          placeholder="admin@trackify.io"
          value={form.email}
          onChange={handleChange}
          required
          size="lg"
        />

        <div className="form-group">
          <label className="form-label" htmlFor="login-password">
            Password
          </label>
          <div className="input-wrap">
            <input
              id="login-password"
              name="password"
              type={showPass ? 'text' : 'password'}
              className="input input--lg"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="btn btn--ghost password-toggle icon-btn"
              aria-label={showPass ? 'Hide password' : 'Show password'}
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {apiError && (
          <Alert variant="danger" center className="auth-alert">
            {apiError}
          </Alert>
        )}

        <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
          Log in
        </Button>

        <p className="auth-note">Authorized platform administrators only.</p>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
