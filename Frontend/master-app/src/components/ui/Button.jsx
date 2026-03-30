import { forwardRef } from 'react';
import Spinner from './Spinner';
import '../../styles/variables.css';
import styles from './Button.module.css';

/**
 * Button — reusable button with variant system.
 * Variants: 'primary' | 'ghost' | 'danger' | 'outline'
 * Props: variant, size ('sm'|'md'|'lg'), isLoading, leftIcon, rightIcon, fullWidth
 */
const Button = forwardRef(({
  children,
  variant    = 'primary',
  size       = 'md',
  isLoading  = false,
  disabled   = false,
  fullWidth  = false,
  leftIcon   = null,
  rightIcon  = null,
  type       = 'button',
  onClick,
  ...rest
}, ref) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={[
        styles.btn,
        styles[`btn--${variant}`],
        styles[`btn--${size}`],
        fullWidth ? styles['btn--full'] : '',
        isLoading ? styles['btn--loading'] : '',
      ].filter(Boolean).join(' ')}
      aria-busy={isLoading}
      {...rest}
    >
      {isLoading ? (
        <Spinner size={size === 'sm' ? 14 : 18} color="currentColor" />
      ) : leftIcon ? (
        <span className={styles.btn__icon} aria-hidden="true">{leftIcon}</span>
      ) : null}

      <span className={styles.btn__label}>{children}</span>

      {!isLoading && rightIcon && (
        <span className={styles.btn__icon} aria-hidden="true">{rightIcon}</span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
