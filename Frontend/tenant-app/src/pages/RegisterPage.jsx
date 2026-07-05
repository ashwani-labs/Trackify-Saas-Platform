import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../features/auth/authSlice';
import AuthLayout from '../layouts/AuthLayout';
import { CheckCircle2 } from 'lucide-react';
import { Button, Input, Alert, PasswordStrength } from '@trackify/shared';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    tenantId: '',
  });
  const [isSuccess, setIsSuccess] = useState(false);

  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(registerUser(formData));
    if (registerUser.fulfilled.match(result)) {
      setIsSuccess(true);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout title="Check your email" subtitle="We've received your request">
        <div className="auth-success">
          <div className="auth-icon-circle auth-icon-circle--success">
            <CheckCircle2 size={32} />
          </div>
          <p className="auth-message">
            Your registration is pending approval by your workspace administrator. You'll receive an
            email once your account is active.
          </p>
          <Button fullWidth size="lg" onClick={() => navigate('/login')}>
            Back to Login
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Sign up for an account" subtitle="Join your team and start collaborating">
      <form className="auth-form" onSubmit={handleSubmit}>
        <Input
          id="fullName"
          name="fullName"
          label="Full name"
          type="text"
          placeholder="e.g. Alex Rivera"
          value={formData.fullName}
          onChange={handleChange}
          required
          size="lg"
        />

        <Input
          id="email"
          name="email"
          label="Email address"
          type="email"
          placeholder="e.g. alex@company.com"
          value={formData.email}
          onChange={handleChange}
          required
          size="lg"
        />

        <Input
          id="tenantId"
          name="tenantId"
          label="Workspace ID"
          type="number"
          placeholder="Enter your workspace ID"
          value={formData.tenantId}
          onChange={handleChange}
          required
          size="lg"
        />

        <Input
          id="password"
          name="password"
          label="Password"
          type="password"
          placeholder="Create a strong password"
          value={formData.password}
          onChange={handleChange}
          required
          size="lg"
        />

        <PasswordStrength password={formData.password} />

        {error && (
          <Alert variant="danger" center className="auth-alert">
            {error}
          </Alert>
        )}

        <Button type="submit" fullWidth size="lg" isLoading={loading}>
          Sign up
        </Button>

        <div className="auth-footer">
          <p className="auth-footer__text">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Log in
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
