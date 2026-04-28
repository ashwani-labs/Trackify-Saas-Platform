const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="auth-container" style={{ backgroundColor: '#F4F5F7' }}>
      <div className="auth-card" style={{ boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-main)', borderRadius: '3px', padding: '3rem' }}>
        <div className="auth-header">
           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                 <LogIn size={20} />
              </div>
              <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)' }}>Trackify</span>
           </div>
          <h1 className="auth-title" style={{ fontSize: '1.25rem', fontWeight: '600' }}>{title}</h1>
          <p className="auth-subtitle" style={{ fontSize: '0.875rem' }}>{subtitle}</p>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

import { LogIn } from 'lucide-react';

export default AuthLayout;
