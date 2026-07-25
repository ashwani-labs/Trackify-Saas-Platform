import React from 'react';
const Select = ({
  id,
  name,
  label,
  value,
  onChange,
  options = [],
  placeholder,
  required = false,
  icon: Icon = null,
  error,
  hint,
  className = '',
  selectClassName = '',
  ...rest
}) => (
  <div className={`form-group ${className}`}>
    {label && (
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
    )}
    <div className="input-wrap">
      {Icon && <Icon className="input-wrap__icon" size={16} aria-hidden />}
      <select
        id={id}
        name={name}
        className={`input ${Icon ? 'input--with-icon' : ''} select-input ${selectClassName}`.trim()}
        value={value}
        onChange={onChange}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => {
          const optionValue = typeof option === 'object' ? option.value : option;
          const optionLabel = typeof option === 'object' ? option.label : option;
          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
    </div>
    {hint && <span className="form-hint">{hint}</span>}
    {error && <span className="field-error">{error}</span>}
  </div>
);

export default Select;
