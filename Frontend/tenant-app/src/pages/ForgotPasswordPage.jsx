import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { getApiErrorMessage, Button, Input, Alert } from '@trackify/shared';
import axios from '../utils/axios';
import AuthLayout from '../layouts/AuthLayout';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await axios.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to process request. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Can't log in?" subtitle="We'll send a recovery link to your email">
      {success ? (
        <div className="auth-success">
          <div className="auth-icon-circle auth-icon-circle--primary">
            <Mail size={32} />
          </div>
          <p className="auth-message">
            If an account with <strong>{email}</strong> exists, an email has been sent with further
            instructions.
          </p>
          <Link to="/login" className="btn btn--secondary btn--full btn--lg">
            Return to login
          </Link>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          <Input
            id="forgot-email"
            label="Email address"
            type="email"
            placeholder="e.g. alex@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            size="lg"
          />

          {error && (
            <Alert variant="danger" center className="auth-alert">
              {error}
            </Alert>
          )}

          <Button type="submit" fullWidth size="lg" isLoading={isLoading} disabled={!email}>
            Send recovery link
          </Button>

          <div className="auth-divider">
            <Link to="/login" className="auth-link">
              Return to login
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
