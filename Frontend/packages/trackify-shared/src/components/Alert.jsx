import React from 'react';
const Alert = ({ children, variant = 'danger', center = false, className = '' }) => (
  <div
    className={`alert alert--${variant} ${center ? 'alert--center' : ''} ${className}`.trim()}
    role="alert"
  >
    {children}
  </div>
);

export default Alert;
