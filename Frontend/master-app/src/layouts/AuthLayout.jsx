import React from 'react';

const AuthLayout = ({ children }) => {
  return (
    <div
      className="auth-container"
      style={{
        backgroundColor: '#F4F5F7',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        className="auth-card"
        style={{
          backgroundColor: 'white',
          border: '1px solid var(--border-main)',
          borderRadius: '3px',
          padding: '3rem',
          boxShadow: 'var(--shadow-md)',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
