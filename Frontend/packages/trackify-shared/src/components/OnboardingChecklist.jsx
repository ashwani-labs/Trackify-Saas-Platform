import { CheckCircle2, Circle } from 'lucide-react';
import Button from './Button.jsx';

/**
 * Guided setup steps for new workspaces (first project, first teammate, etc.).
 */
const OnboardingChecklist = ({
  title = 'Get your workspace ready',
  subtitle = 'Complete these steps to start collaborating with your team.',
  steps = [],
  className = '',
}) => {
  const completedCount = steps.filter((s) => s.done).length;
  const allDone = steps.length > 0 && completedCount === steps.length;

  if (allDone) {
    return null;
  }

  return (
    <section className={`card onboarding-checklist ${className}`.trim()} aria-label="Workspace setup">
      <div className="onboarding-checklist__header">
        <div>
          <h2 className="onboarding-checklist__title">{title}</h2>
          <p className="onboarding-checklist__subtitle">{subtitle}</p>
        </div>
        <span className="onboarding-checklist__progress">
          {completedCount} of {steps.length} complete
        </span>
      </div>
      <ol className="onboarding-checklist__steps">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={`onboarding-checklist__step${step.done ? ' onboarding-checklist__step--done' : ''}`}
          >
            <span className="onboarding-checklist__step-icon" aria-hidden>
              {step.done ? (
                <CheckCircle2 size={20} className="onboarding-checklist__icon--done" />
              ) : (
                <Circle size={20} className="onboarding-checklist__icon--pending" />
              )}
            </span>
            <div className="onboarding-checklist__step-body">
              <span className="onboarding-checklist__step-label">
                Step {index + 1}: {step.label}
              </span>
              {step.description && (
                <p className="onboarding-checklist__step-desc">{step.description}</p>
              )}
            </div>
            {!step.done && step.actionLabel && step.onAction && (
              <Button variant="secondary" size="sm" onClick={step.onAction}>
                {step.actionLabel}
              </Button>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
};

export default OnboardingChecklist;
