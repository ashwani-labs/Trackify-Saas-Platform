import { Link } from 'react-router-dom';
import { LayoutDashboard, Kanban, Users, BarChart3, CheckCircle2 } from 'lucide-react';

const HIGHLIGHTS = [
  { icon: Kanban, text: 'Kanban boards & issue tracking' },
  { icon: Users, text: 'Isolated multi-tenant workspaces' },
  { icon: BarChart3, text: 'Dashboards and sprint planning' },
];

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="auth-shell">
      <aside className="auth-panel" aria-hidden="true">
        <div className="auth-panel__inner">
          <Link to="/" className="auth-panel__brand">
            <span className="auth-panel__logo">
              <LayoutDashboard size={22} />
            </span>
            <span className="auth-panel__name">Trackify</span>
          </Link>

          <div className="auth-panel__content">
            <h2 className="auth-panel__headline">
              Your team&apos;s
              <br />
              <span className="auth-panel__gradient">project workspace</span>
            </h2>
            <p className="auth-panel__desc">
              Sign in to manage projects, issues, and sprints in your organization&apos;s dedicated
              workspace.
            </p>

            <ul className="auth-panel__highlights">
              {HIGHLIGHTS.map((item) => {
                const HighlightIcon = item.icon;
                return (
                  <li key={item.text}>
                    <CheckCircle2 size={16} className="auth-panel__check" />
                    <HighlightIcon size={16} />
                    {item.text}
                  </li>
                );
              })}
            </ul>
          </div>

          <p className="auth-panel__footer">Trackify · multi-tenant project management</p>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-card auth-card--elevated">
          <div className="auth-header">
            <Link to="/" className="auth-brand auth-brand--mobile">
              <div className="auth-brand__logo">
                <LayoutDashboard size={20} />
              </div>
              <span className="auth-brand__name">Trackify</span>
            </Link>
            <h1 className="auth-title">{title}</h1>
            <p className="auth-subtitle">{subtitle}</p>
          </div>
          <div>{children}</div>
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
