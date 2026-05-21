import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, clearError } from '../features/auth/authSlice';
import AuthLayout from '../layouts/AuthLayout';
import { Button, Input, Alert } from '@trackify/shared';

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
    <AuthLayout
      title="Log in to continue"
      subtitle="Enter your credentials to access your workspace"
    >
      <form onSubmit={handleSubmit} className="auth-form">
        <Input
          id="email"
          label="Email address"
          type="email"
          placeholder="e.g. alex@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          size="lg"
        />

        <div className="form-group">
          <div className="form-label-row">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <Link to="/forgot-password" className="auth-link">
              Can&apos;t log in?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            className="input input--lg"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <Alert center className="auth-alert">
            {error}
          </Alert>
        )}

        <Button type="submit" variant="primary" fullWidth size="lg" isLoading={loading}>
          Log in
        </Button>

        <div className="auth-footer">
          <p className="auth-footer__text">
            New to Trackify?{' '}
            <Link to="/register" className="auth-link">
              Create an account
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
