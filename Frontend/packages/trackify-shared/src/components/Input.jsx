const Input = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  size = 'md',
  className = '',
  inputClassName = '',
  error,
  ...rest
}) => (
  <div className={`form-group ${className}`}>
    {label && (
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
    )}
    <input
      id={id}
      type={type}
      className={`input ${size === 'lg' ? 'input--lg' : ''} ${inputClassName}`.trim()}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      aria-invalid={error ? 'true' : undefined}
      {...rest}
    />
    {error && <span className="field-error">{error}</span>}
  </div>
);

export default Input;
