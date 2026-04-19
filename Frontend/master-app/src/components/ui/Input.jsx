import { forwardRef, useState, useId } from 'react';

const Input = forwardRef(({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  id: externalId,
  type = 'text',
  disabled = false,
  required = false,
  className = '',
  ...rest
}, ref) => {
  const [focused, setFocused] = useState(false);
  const generatedId = useId();
  const inputId = externalId || generatedId;

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && <span style={{ color: 'var(--danger)' }} aria-hidden="true"> *</span>}
        </label>
      )}

      <div style={{ position: 'relative' }}>
        {leftIcon && (
          <span style={{ 
            position: 'absolute', 
            left: '1rem', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: focused ? 'var(--primary)' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            transition: 'var(--transition)'
          }}>
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          required={required}
          className="input-field"
          style={{ 
            paddingLeft: leftIcon ? '2.75rem' : '1rem',
            paddingRight: rightIcon ? '2.75rem' : '1rem',
            borderColor: error ? 'var(--danger)' : focused ? 'var(--primary)' : 'var(--border-main)'
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />

        {rightIcon && (
          <span style={{ 
            position: 'absolute', 
            right: '1rem', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center'
          }}>
            {rightIcon}
          </span>
        )}
      </div>

      {error && (
        <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span aria-hidden="true">⚠️</span>
          {error}
        </p>
      )}
      {!error && hint && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.4rem' }}>{hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
