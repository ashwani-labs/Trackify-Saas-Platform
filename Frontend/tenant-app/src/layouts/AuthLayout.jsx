import { LogIn } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="auth-container">
      <div className="auth-card auth-card--elevated">
        <div className="auth-header">
          <div className="auth-brand">
            <div className="auth-brand__logo">
              <LogIn size={20} />
            </div>
            <span className="auth-brand__name">Trackify</span>
          </div>
          <h1 className="auth-title">{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
