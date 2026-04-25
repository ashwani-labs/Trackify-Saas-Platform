import '../../styles/variables.css';

/**
 * Spinner — animated SVG loading indicator.
 * Props:
 *   size    — px number (default 20)
 *   color   — CSS color string (default var(--clr-accent))
 *   label   — aria-label for accessibility
 */
const Spinner = ({ size = 20, color = 'var(--clr-accent)', label = 'Loading…' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-label={label}
      role="status"
      style={{
        animation: 'spin 0.8s linear infinite',
        display: 'block',
        flexShrink: 0,
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke={color}
        strokeWidth="2.5"
        strokeOpacity="0.2"
        strokeLinecap="round"
      />
      <path d="M12 3a9 9 0 0 1 9 9" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
};

export default Spinner;
