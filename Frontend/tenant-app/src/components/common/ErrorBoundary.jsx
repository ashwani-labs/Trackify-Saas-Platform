import React from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-main)',
            color: 'var(--text-main)',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <div
            className="card"
            style={{ maxWidth: '500px', padding: '3rem', animation: 'fadeIn 0.5s ease-out' }}
          >
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--danger)',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 2rem',
              }}
            >
              <AlertTriangle size={40} />
            </div>

            <h1
              style={{ fontSize: '2rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}
            >
              Oops! Something went wrong
            </h1>

            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: '1.6' }}>
              An unexpected error occurred. Our team has been notified. Please try refreshing the
              page or return to the home page.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => (window.location.href = '/')}>
                <Home size={18} /> Go Home
              </button>
              <button className="btn btn-primary" onClick={this.handleReset}>
                <RefreshCcw size={18} /> Refresh Page
              </button>
            </div>

            {import.meta.env.DEV && (
              <div
                style={{
                  marginTop: '2rem',
                  padding: '1rem',
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'left',
                  fontSize: '0.8rem',
                  overflow: 'auto',
                  maxHeight: '200px',
                  color: 'var(--danger)',
                  border: '1px solid var(--border-main)',
                }}
              >
                <strong>Error:</strong> {this.state.error?.toString()}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
