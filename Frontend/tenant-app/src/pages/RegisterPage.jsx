import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { registerUser } from '../features/auth/authSlice';
import AuthLayout from '../layouts/AuthLayout';
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Loader2,
  CheckCircle2,
  ChevronRight,
  Globe,
} from 'lucide-react';

const RegisterPage = () => {
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
        <div
          style={{ textAlign: 'center', animation: 'fadeIn 0.4s ease-out', marginTop: '1.5rem' }}
        >
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
          <p
            style={{
              color: 'var(--text-main)',
              marginBottom: '2rem',
              lineHeight: '1.6',
              fontSize: '0.875rem',
            }}
          >
            Your registration is pending approval by your workspace administrator. You'll receive an
            email once your account is active.
          </p>
          <Link
            to="/login"
            className="btn btn-primary"
            style={{
              width: '100%',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Back to Login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Sign up for an account" subtitle="Join your team and start collaborating">
      <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label
            className="form-label"
            style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)' }}
          >
            FULL NAME
          </label>
          <input
            name="fullName"
            className="input-field"
            type="text"
            placeholder="e.g. Alex Rivera"
            value={formData.fullName}
            onChange={handleChange}
            required
            style={{ height: '40px', fontSize: '0.875rem' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label
            className="form-label"
            style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)' }}
          >
            EMAIL ADDRESS
          </label>
          <input
            name="email"
            className="input-field"
            type="email"
            placeholder="e.g. alex@company.com"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ height: '40px', fontSize: '0.875rem' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label
            className="form-label"
            style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)' }}
          >
            WORKSPACE ID
          </label>
          <input
            name="tenantId"
            className="input-field"
            type="number"
            placeholder="Enter your workspace ID"
            value={formData.tenantId}
            onChange={handleChange}
            required
            style={{ height: '40px', fontSize: '0.875rem' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label
            className="form-label"
            style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)' }}
          >
            PASSWORD
          </label>
          <input
            name="password"
            className="input-field"
            type="password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleChange}
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
              border: '1px solid #FFBDAD',
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
            'Sign up'
          )}
        </button>

        <div
          style={{
            marginTop: '2rem',
            textAlign: 'center',
            borderTop: '1px solid var(--border-main)',
            paddingTop: '1.5rem',
          }}
        >
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>
              Log in
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
