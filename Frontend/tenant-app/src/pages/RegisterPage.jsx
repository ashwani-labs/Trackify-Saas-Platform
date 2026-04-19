import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../features/auth/authSlice';
import AuthLayout from '../layouts/AuthLayout';
import { UserPlus, Mail, Lock, User, Loader2, CheckCircle2, ChevronRight } from 'lucide-react';

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
      <AuthLayout 
        title="Check your email" 
        subtitle="We've received your request"
      >
        <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease-out' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            background: 'var(--success)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 2rem',
            color: 'white',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)'
          }}>
            <CheckCircle2 size={40} />
          </div>
          <p style={{ color: 'var(--text-main)', marginBottom: '2rem', lineHeight: '1.6' }}>
            Your registration is pending approval by your workspace administrator. You'll receive an email once your account is active.
          </p>
          <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
            Back to Login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Join your team" 
      subtitle="Create an account to start collaborating"
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <div style={{ position: 'relative' }}>
            <User style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
            <input
              name="fullName"
              className="input-field"
              style={{ paddingLeft: '3rem' }}
              type="text"
              placeholder="e.g. Alex Rivera"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <div style={{ position: 'relative' }}>
            <Mail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
            <input
              name="email"
              className="input-field"
              style={{ paddingLeft: '3rem' }}
              type="email"
              placeholder="e.g. alex@company.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Workspace ID</label>
          <div style={{ position: 'relative' }}>
            <Globe style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
            <input
              name="tenantId"
              className="input-field"
              style={{ paddingLeft: '3rem' }}
              type="number"
              placeholder="Enter your workspace ID"
              value={formData.tenantId}
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
              className="input-field"
              style={{ paddingLeft: '3rem' }}
              type="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {error && (
          <div className="badge badge-danger" style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
            {error}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading} 
          className="btn btn-primary"
          style={{ width: '100%', height: '48px', marginTop: '1rem' }}
        >
          {loading ? (
            <Loader2 style={{ animation: 'loading 2s linear infinite' }} size={20} />
          ) : (
            <>
              Request Access <ChevronRight size={18} />
            </>
          )}
        </button>

        <p className="form-footer">
          Already have an account? <Link to="/login" className="form-link">Sign in instead</Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
