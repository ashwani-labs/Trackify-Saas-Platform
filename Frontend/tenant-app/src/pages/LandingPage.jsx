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
  Sparkles,
  Moon,
  Sun,
} from 'lucide-react';
import { Button } from '@trackify/shared';
import { useTheme } from '../hooks/useTheme';

const FEATURES = [
  {
    icon: Kanban,
    title: 'Visual Kanban Boards',
    description:
      'Drag-and-drop issue tracking with customizable workflows that keep your team aligned.',
  },
  {
    icon: Users,
    title: 'Multi-Tenant Workspaces',
    description:
      'Isolated workspaces for every team with role-based access and seamless collaboration.',
  },
  {
    icon: Zap,
    title: 'Sprint Planning',
    description: 'Plan sprints, manage backlogs, and ship faster with built-in agile tooling.',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description: 'Track velocity, issue distribution, and team progress with live dashboards.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'JWT authentication, tenant isolation, and admin approval workflows built in.',
  },
  {
    icon: Sparkles,
    title: 'Smart Notifications',
    description: 'Stay in the loop with contextual alerts for assignments, updates, and mentions.',
  },
];

const STATS = [
  { value: '10x', label: 'Faster issue triage' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '50+', label: 'Teams onboarded' },
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
        <div className="landing-hero__badge">
          <Sparkles size={14} />
          <span>Project management, reimagined</span>
        </div>
        <h1 className="landing-hero__title">
          Ship faster with
          <span className="landing-hero__gradient"> clarity &amp; control</span>
        </h1>
        <p className="landing-hero__subtitle">
          Trackify brings kanban boards, sprint planning, and team analytics into one beautiful
          workspace — so your team can focus on building, not chasing status updates.
        </p>
        <div className="landing-hero__cta">
          <Link to={isAuthenticated ? dashboardPath : '/register'}>
            <Button size="lg" rightIcon={<ArrowRight size={18} />}>
              {isAuthenticated ? 'Go to dashboard' : 'Start for free'}
            </Button>
          </Link>
          <Link to={isAuthenticated ? dashboardPath : '/login'}>
            <Button variant="outline" size="lg">
              {isAuthenticated ? 'Open workspace' : 'Sign in to workspace'}
            </Button>
          </Link>
        </div>

        <div className="landing-hero__stats">
          {STATS.map((stat) => (
            <div key={stat.label} className="landing-stat">
              <span className="landing-stat__value">{stat.value}</span>
              <span className="landing-stat__label">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="landing-section">
        <div className="landing-section__header">
          <span className="landing-section__eyebrow">Features</span>
          <h2 className="landing-section__title">Everything your team needs to deliver</h2>
          <p className="landing-section__subtitle">
            From backlog grooming to release day — Trackify covers the full project lifecycle.
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
          <span className="landing-section__eyebrow">How it works</span>
          <h2 className="landing-section__title">Up and running in minutes</h2>
        </div>
        <ol className="landing-steps">
          <li className="landing-step">
            <span className="landing-step__num">1</span>
            <div>
              <h3 className="landing-step__title">Create your workspace</h3>
              <p className="landing-step__desc">
                Register with your workspace ID and get instant access to your team&apos;s hub.
              </p>
            </div>
          </li>
          <li className="landing-step">
            <span className="landing-step__num">2</span>
            <div>
              <h3 className="landing-step__title">Set up projects &amp; boards</h3>
              <p className="landing-step__desc">
                Create projects, configure kanban columns, and invite teammates to collaborate.
              </p>
            </div>
          </li>
          <li className="landing-step">
            <span className="landing-step__num">3</span>
            <div>
              <h3 className="landing-step__title">Track, ship, repeat</h3>
              <p className="landing-step__desc">
                Manage sprints, monitor dashboards, and deliver with full visibility.
              </p>
            </div>
          </li>
        </ol>
      </section>

      <section className="landing-cta">
        <div className="landing-cta__content">
          <h2 className="landing-cta__title">Ready to transform how your team works?</h2>
          <p className="landing-cta__subtitle">
            Join teams who ship faster with Trackify. No credit card required.
          </p>
          <ul className="landing-cta__checks">
            <li>
              <CheckCircle2 size={16} /> Free workspace setup
            </li>
            <li>
              <CheckCircle2 size={16} /> Unlimited projects
            </li>
            <li>
              <CheckCircle2 size={16} /> Role-based access control
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
