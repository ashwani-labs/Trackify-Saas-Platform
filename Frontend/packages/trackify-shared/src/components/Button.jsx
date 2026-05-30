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
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;
    const classes = [
      'btn',
      `btn--${variant}`,
      fullWidth && 'btn--full',
      size === 'lg' && 'btn--lg',
      size === 'sm' && 'btn--sm',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button ref={ref} type={type} disabled={isDisabled} className={classes} {...rest}>
        {isLoading ? (
          <Loader2
            size={size === 'lg' ? 18 : 16}
            className="btn-spinner"
          />
        ) : (
          leftIcon
        )}
        {children != null && children !== '' && <span>{children}</span>}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
