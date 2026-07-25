import React from 'react';
const EmptyState = ({ icon, title, description, action, className = '' }) => (
  <div className={`card empty-state ${className}`.trim()}>
    {icon && <div className="empty-state__icon">{icon}</div>}
    <div>
      <h2 className="empty-state__title">{title}</h2>
      {description && <p className="empty-state__text">{description}</p>}
    </div>
    {action}
  </div>
);

export default EmptyState;
