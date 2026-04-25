import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const Button = forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      fullWidth = false,
      leftIcon = null,
      rightIcon = null,
      type = 'button',
      className = '',
      onClick,
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    const getVariantClass = () => {
      switch (variant) {
        case 'primary':
          return 'btn-primary';
        case 'secondary':
          return 'btn-secondary';
        case 'danger':
          return 'btn btn-danger'; // Assuming there's a btn-danger global class or just styling here
        default:
          return 'btn-secondary';
      }
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        onClick={onClick}
        className={`btn ${getVariantClass()} ${className}`}
        style={{
          width: fullWidth ? '100%' : 'auto',
          opacity: isDisabled ? 0.6 : 1,
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          padding:
            size === 'sm' ? '0.4rem 0.8rem' : size === 'lg' ? '0.8rem 1.6rem' : '0.6rem 1.2rem',
          fontSize: size === 'sm' ? '0.8rem' : size === 'lg' ? '1rem' : '0.9rem',
        }}
        {...rest}
      >
        {isLoading ? (
          <Loader2
            size={size === 'sm' ? 14 : 18}
            style={{ animation: 'loading 2s linear infinite' }}
          />
        ) : leftIcon ? (
          <span style={{ display: 'inline-flex', marginRight: '0.5rem' }}>{leftIcon}</span>
        ) : null}

        <span>{children}</span>

        {!isLoading && rightIcon && (
          <span style={{ display: 'inline-flex', marginLeft: '0.5rem' }}>{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
