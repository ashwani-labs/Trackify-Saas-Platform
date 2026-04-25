import React from 'react';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="auth-container">
      <div className="auth-bg-blob"></div>
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
