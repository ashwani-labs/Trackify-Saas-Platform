import React from 'react';

const Skeleton = ({ type = 'text', className = '', style = {} }) => {
  const baseStyle = {
    height:
      type === 'title' ? '2.5rem' : type === 'card' ? '200px' : type === 'circle' ? '40px' : '1rem',
    width: type === 'circle' ? '40px' : '100%',
    borderRadius: type === 'circle' ? '50%' : 'var(--radius-md)',
    ...style,
  };

  return <div className={`skeleton ${className}`} style={baseStyle} />;
};

export default Skeleton;
