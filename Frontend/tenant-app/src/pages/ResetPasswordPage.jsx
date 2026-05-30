import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { getApiErrorMessage, Button, Input, Alert } from '@trackify/shared';
import axios from '../utils/axios';
import AuthLayout from '../layouts/AuthLayout';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token || !email) {
      setError('Invalid reset link. Missing token or email parameter.');
    }
  }, [token, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token || !email) return;

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await axios.post('/auth/reset-password', {
        email,
        token,
        newPassword,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to reset password. The link may have expired.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Choose a new password" subtitle="Create a secure password for your account">
      {success ? (
        <div className="auth-success">
          <div className="auth-icon-circle auth-icon-circle--success">
            <CheckCircle2 size={32} />
          </div>
          <p className="auth-message">Your password has been successfully reset.</p>
          <p className="auth-muted-note">Redirecting to login...</p>
          <Link to="/login" className="btn btn--primary btn--full btn--lg">
            Log in now
          </Link>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          <Input
            id="new-password"
            label="New password"
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            size="lg"
          />

          <Input
            id="confirm-password"
            label="Confirm password"
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            size="lg"
          />

          {error && (
            <Alert variant="danger" center className="auth-alert">
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={isLoading}
            disabled={!token || !email || !newPassword || !confirmPassword}
          >
            Reset password
          </Button>

          <div className="auth-divider">
            <Link to="/login" className="auth-link">
              Back to login
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};

export default ResetPasswordPage;
