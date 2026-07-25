import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Kanban,
  Users,
  Zap,
  Shield,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Bell,
  Moon,
  Sun,
} from 'lucide-react';
import { Button } from '@trackify/shared';
import { useTheme } from '../hooks/useTheme';

const FEATURES = [
  {
    icon: Kanban,
    title: 'Kanban boards',
    description: 'Move issues across columns, update status inline, and keep work visible.',
  },
  {
    icon: Users,
    title: 'Isolated workspaces',
    description: 'Each organization gets its own database, roles, and branding.',
  },
  {
    icon: Zap,
    title: 'Sprints & backlog',
    description: 'Plan iterations, groom the backlog, and track delivery without another tool.',
  },
  {
    icon: BarChart3,
    title: 'Workspace dashboards',
    description: 'See open work, recent activity, and progress filters that match your role.',
  },
  {
    icon: Shield,
    title: 'Role-based access',
    description: 'JWT auth with admin approval for new members and platform-level controls.',
  },
  {
    icon: Bell,
    title: 'Notifications',
    description: 'In-app alerts for assignments and approvals, with optional email delivery.',
  },
];

const LandingPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dashboardPath = '/dashboard';

  return (
    <div className="landing">
      <header className="landing-nav">
        <Link to="/" className="landing-nav__brand">
          <span className="landing-nav__logo">
            <LayoutDashboard size={20} />
          </span>
          <span className="landing-nav__name">Trackify</span>
        </Link>

        <nav className="landing-nav__links" aria-label="Main navigation">
          <a href="#features" className="landing-nav__link">
            Features
          </a>
          <a href="#how-it-works" className="landing-nav__link">
            How it works
          </a>
        </nav>

        <div className="landing-nav__actions">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <Link to="/login" className="landing-nav__link landing-nav__link--login">
            Log in
          </Link>
          <Link to={isAuthenticated ? dashboardPath : '/register'}>
            <Button size="sm">{isAuthenticated ? 'Dashboard' : 'Get started'}</Button>
          </Link>
        </div>
      </header>

      <section className="landing-hero">
        <h1 className="landing-hero__title">
          Trackify
          <span className="landing-hero__gradient"> for project teams</span>
        </h1>
        <p className="landing-hero__subtitle">
          Multi-tenant project and issue tracking with Kanban boards, sprints, and workspace
          isolation — built for organizations that need their own space.
        </p>
        <div className="landing-hero__cta">
          <Link to={isAuthenticated ? dashboardPath : '/register'}>
            <Button size="lg" rightIcon={<ArrowRight size={18} />}>
              {isAuthenticated ? 'Go to dashboard' : 'Create an account'}
            </Button>
          </Link>
          <Link to={isAuthenticated ? dashboardPath : '/login'}>
            <Button variant="outline" size="lg">
              {isAuthenticated ? 'Open workspace' : 'Sign in'}
            </Button>
          </Link>
        </div>
      </section>

      <section id="features" className="landing-section">
        <div className="landing-section__header">
          <h2 className="landing-section__title">What you get</h2>
          <p className="landing-section__subtitle">
            Boards, sprints, team approvals, and admin tooling in one stack.
          </p>
        </div>
        <div className="landing-features">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="landing-feature-card">
              <div className="landing-feature-card__icon">
                <feature.icon size={22} />
              </div>
              <h3 className="landing-feature-card__title">{feature.title}</h3>
              <p className="landing-feature-card__desc">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="landing-section landing-section--alt">
        <div className="landing-section__header">
          <h2 className="landing-section__title">How it works</h2>
        </div>
        <ol className="landing-steps">
          <li className="landing-step">
            <span className="landing-step__num">1</span>
            <div>
              <h3 className="landing-step__title">Provision a workspace</h3>
              <p className="landing-step__desc">
                A platform admin creates an organization; Trackify stands up a dedicated database
                and admin user.
              </p>
            </div>
          </li>
          <li className="landing-step">
            <span className="landing-step__num">2</span>
            <div>
              <h3 className="landing-step__title">Invite the team</h3>
              <p className="landing-step__desc">
                Members register or get invited, then an admin approves access before they can work.
              </p>
            </div>
          </li>
          <li className="landing-step">
            <span className="landing-step__num">3</span>
            <div>
              <h3 className="landing-step__title">Run projects</h3>
              <p className="landing-step__desc">
                Create projects, plan sprints, and move issues across the board.
              </p>
            </div>
          </li>
        </ol>
      </section>

      <section className="landing-cta">
        <div className="landing-cta__content">
          <h2 className="landing-cta__title">Ready to open a workspace?</h2>
          <p className="landing-cta__subtitle">
            Register with your organization ID, or ask your admin for an invite.
          </p>
          <ul className="landing-cta__checks">
            <li>
              <CheckCircle2 size={16} /> Per-tenant database isolation
            </li>
            <li>
              <CheckCircle2 size={16} /> Kanban, sprints, and dashboards
            </li>
            <li>
              <CheckCircle2 size={16} /> Admin approval for new users
            </li>
          </ul>
          <Link to={isAuthenticated ? dashboardPath : '/register'}>
            <Button size="lg" rightIcon={<ArrowRight size={18} />}>
              {isAuthenticated ? 'Go to dashboard' : 'Create your account'}
            </Button>
          </Link>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer__brand">
          <span className="landing-nav__logo">
            <LayoutDashboard size={16} />
          </span>
          <span>Trackify</span>
        </div>
        <p className="landing-footer__copy">
          &copy; {new Date().getFullYear()} Trackify. All rights reserved.
        </p>
        <div className="landing-footer__links">
          <Link to="/login">Log in</Link>
          <Link to="/register">Sign up</Link>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
