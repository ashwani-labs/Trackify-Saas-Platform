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
      const homeHref = this.props.homeHref || '/';

      return (
        <div className="error-boundary">
          <div className="error-boundary__card card">
            <div className="error-boundary__icon" aria-hidden>
              <AlertTriangle size={40} />
            </div>

            <h1 className="error-boundary__title">Oops! Something went wrong</h1>

            <p className="error-boundary__message">
              An unexpected error occurred. Please try refreshing the page or return to the home
              page.
            </p>

            <div className="error-boundary__actions">
              <button type="button" className="btn btn--secondary" onClick={() => (window.location.href = homeHref)}>
                <Home size={18} /> Go Home
              </button>
              <button type="button" className="btn btn--primary" onClick={this.handleReset}>
                <RefreshCcw size={18} /> Refresh Page
              </button>
            </div>

            {typeof import.meta !== 'undefined' && import.meta.env?.DEV && (
              <div className="error-boundary__details">
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
