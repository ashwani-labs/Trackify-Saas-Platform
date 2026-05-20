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
      {...rest}
    />
  </div>
);

export default Input;
