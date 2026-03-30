import { forwardRef, useState, useId } from 'react';
import styles from './Input.module.css';

/**
 * Input — controlled input field with label, icon, and error support.
 * Props: label, error, hint, leftIcon, rightIcon, type, ...native input props
 */
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
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && <span className={styles.required} aria-hidden="true"> *</span>}
        </label>
      )}

      <div
        className={[
          styles.wrapper,
          focused    ? styles['wrapper--focused']  : '',
          error      ? styles['wrapper--error']    : '',
          disabled   ? styles['wrapper--disabled'] : '',
        ].filter(Boolean).join(' ')}
      >
        {leftIcon && (
          <span className={styles.icon} aria-hidden="true">{leftIcon}</span>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={styles.input}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />

        {rightIcon && (
          <span className={styles.iconRight} aria-hidden="true">{rightIcon}</span>
        )}
      </div>

      {error && (
        <p id={`${inputId}-error`} className={styles.error} role="alert">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 3.5a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4.5Zm0 6.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/>
          </svg>
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${inputId}-hint`} className={styles.hint}>{hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
