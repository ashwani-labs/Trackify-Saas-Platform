import React from 'react';

const PageLoader = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-main)',
        gap: '2rem',
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      {/* Animated logo pulse */}
      <div
        style={{
          position: 'relative',
          width: '80px',
          height: '80px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), #a78bfa)',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            opacity: 0.3,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: '10px',
            borderRadius: '50%',
            background: 'var(--bg-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: '800',
            color: 'var(--primary)',
            letterSpacing: '-0.02em',
          }}
        >
          T
        </div>
      </div>

      {/* Skeleton content block */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          width: '100%',
          maxWidth: '320px',
        }}
      >
        <div className="skeleton" style={{ height: '12px', width: '60%', borderRadius: '6px' }} />
        <div className="skeleton" style={{ height: '8px', width: '40%', borderRadius: '4px' }} />
      </div>

      {/* Loading bar */}
      <div
        style={{
          width: '200px',
          height: '3px',
          background: 'var(--bg-input)',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: '40%',
            background: 'linear-gradient(90deg, var(--primary), #a78bfa)',
            borderRadius: '4px',
            animation: 'shimmer 1.5s ease-in-out infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-200%); }
          100% { transform: translateX(600%); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.15); opacity: 0.15; }
        }
      `}</style>
    </div>
  );
};

export default PageLoader;
