import React from 'react';
import { TENANT_THEME_LIST } from '../themes/tenantThemes.js';

const ThemeSelector = ({ value, onChange, name = 'theme', label = 'Workspace theme' }) => {
  return (
    <fieldset className="theme-selector">
      <legend className="form-label">{label}</legend>
      <p className="form-hint theme-selector__hint">
        Applies across the tenant app — buttons, navigation, charts, and accents.
      </p>
      <div className="theme-selector__grid" role="radiogroup" aria-label={label}>
        {TENANT_THEME_LIST.map((theme) => {
          const selected = value === theme.id;
          return (
            <label
              key={theme.id}
              className={`theme-selector__option${selected ? ' theme-selector__option--selected' : ''}`}
            >
              <input
                type="radio"
                name={name}
                value={theme.id}
                checked={selected}
                onChange={() => onChange(theme.id)}
                className="sr-only"
              />
              <span
                className="theme-selector__swatch"
                style={{ background: theme.gradientBrand }}
                aria-hidden
              />
              <span className="theme-selector__label">{theme.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
};

export default ThemeSelector;
