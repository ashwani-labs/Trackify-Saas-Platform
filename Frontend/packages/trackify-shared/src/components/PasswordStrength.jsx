const SCORE_LABELS = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];

export function getPasswordStrength(password = '') {
  if (!password) return { score: 0, label: '', checks: {} };

  const checks = {
    length: password.length >= 8,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;
  return { score, label: SCORE_LABELS[score - 1] || '', checks };
}

const PasswordStrength = ({ password, className = '' }) => {
  const { score, label, checks } = getPasswordStrength(password);

  if (!password) return null;

  return (
    <div className={`password-strength ${className}`.trim()} aria-live="polite">
      <div className="password-strength__bars" aria-hidden>
        {[1, 2, 3, 4, 5].map((level) => (
          <span
            key={level}
            className={`password-strength__bar${level <= score ? ` password-strength__bar--${score}` : ''}`}
          />
        ))}
      </div>
      {label && <span className="password-strength__label">{label}</span>}
      <ul className="password-strength__checks">
        <li className={checks.length ? 'password-strength__check--ok' : ''}>At least 8 characters</li>
        <li className={checks.upper ? 'password-strength__check--ok' : ''}>Uppercase letter</li>
        <li className={checks.lower ? 'password-strength__check--ok' : ''}>Lowercase letter</li>
        <li className={checks.number ? 'password-strength__check--ok' : ''}>Number</li>
        <li className={checks.special ? 'password-strength__check--ok' : ''}>Special character</li>
      </ul>
    </div>
  );
};

export default PasswordStrength;
