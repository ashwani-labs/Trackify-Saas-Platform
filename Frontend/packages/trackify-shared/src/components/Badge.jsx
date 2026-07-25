import React from 'react';
const VARIANT_MAP = {
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  primary: 'primary',
  HIGH: 'danger',
  MEDIUM: 'warning',
  LOW: 'success',
};

const Badge = ({ children, variant = 'primary', className = '', style }) => {
  const v = VARIANT_MAP[variant] || 'primary';
  return (
    <span className={`badge badge--${v} ${className}`.trim()} style={style}>
      {children}
    </span>
  );
};

export default Badge;
