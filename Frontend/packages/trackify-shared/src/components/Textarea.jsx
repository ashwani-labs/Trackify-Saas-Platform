const Textarea = ({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  rows = 3,
  error,
  hint,
  className = '',
  textareaClassName = '',
  ...rest
}) => (
  <div className={`form-group ${className}`}>
    {label && (
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
    )}
    <textarea
      id={id}
      name={name}
      className={`input textarea-input ${textareaClassName}`.trim()}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      rows={rows}
      aria-invalid={error ? 'true' : undefined}
      {...rest}
    />
    {hint && <span className="form-hint">{hint}</span>}
    {error && <span className="field-error">{error}</span>}
  </div>
);

export default Textarea;
