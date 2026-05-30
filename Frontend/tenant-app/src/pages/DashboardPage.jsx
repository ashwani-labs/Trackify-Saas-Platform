import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchProjectStats } from '../features/projects/projectSlice';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  Copy,
  Globe,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { PageHeader, Button } from '@trackify/shared';

const CHART_TOOLTIP_STYLE = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-main)',
  borderRadius: 'var(--radius-md)',
  fontSize: '0.8rem',
  boxShadow: 'var(--shadow-md)',
};

const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, tenantId, tenantDomain } = useSelector((s) => s.auth);
  const { stats, statsLoading } = useSelector((s) => s.projects);

  const tenantUrl = `http://${tenantDomain}.trackify.com:5174`;

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  useEffect(() => {
    dispatch(fetchProjectStats());
  }, [dispatch]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const statCards = [
    {
      label: 'Projects',
      value: stats?.totalProjects ?? '0',
      icon: <FolderKanban size={18} />,
      sub: 'Active workspaces',
      accent: 'primary',
    },
    {
      label: 'To Do',
      value: stats?.todoCount ?? '0',
      icon: <AlertCircle size={18} />,
      sub: 'Awaiting start',
      accent: 'muted',
    },
    {
      label: 'In Progress',
      value: stats?.inProgressCount ?? '0',
      icon: <Clock size={18} />,
      sub: 'Active tasks',
      accent: 'warning',
    },
    {
      label: 'Done',
      value: stats?.doneCount ?? '0',
      icon: <CheckCircle2 size={18} />,
      sub: 'Completed',
      accent: 'success',
    },
  ];

  const issueDistributionData = [
    { name: 'To Do', value: stats?.todoCount || 0, color: 'var(--chart-todo)' },
    { name: 'In Progress', value: stats?.inProgressCount || 0, color: 'var(--chart-progress)' },
    { name: 'Done', value: stats?.doneCount || 0, color: 'var(--chart-done)' },
  ];

  const workloadData = [
    {
      name: 'Status',
      todo: stats?.todoCount || 0,
      inProgress: stats?.inProgressCount || 0,
      done: stats?.doneCount || 0,
    },
  ];

  return (
    <div className="page">
      <PageHeader
        breadcrumb={
          <>
            Workspaces / <strong>Overview</strong>
          </>
        }
        title={`${greeting()}, ${user?.email?.split('@')[0]}`}
        subtitle="Track your team's progress and manage project deliverables."
        actions={
          <>
            <Button onClick={() => navigate('/projects')}>Browse Projects</Button>
            {user?.role === 'ADMIN' && (
              <Button variant="secondary" onClick={() => navigate('/team')}>
                Team
              </Button>
            )}
          </>
        }
      />

      {user?.role === 'ADMIN' && (
        <div className="card workspace-card">
          <div className="workspace-card__header">
            <Globe className="workspace-card__icon" size={20} aria-hidden />
            <h3 className="workspace-card__title">Workspace Configuration</h3>
          </div>
          <div className="workspace-meta-grid">
            <div className="meta-field">
              <span className="meta-field__label">Workspace ID</span>
              <div className="meta-field__row">
                <code className="code-inline">{tenantId}</code>
                <Button
                  variant="ghost"
                  className="icon-btn"
                  aria-label="Copy workspace ID"
                  onClick={() => copyToClipboard(tenantId, 'ID')}
                  leftIcon={<Copy size={12} />}
                />
              </div>
            </div>
            <div className="meta-field">
              <span className="meta-field__label">Login URL</span>
              <div className="meta-field__row">
                <code className="code-inline">{tenantUrl}</code>
                <Button
                  variant="ghost"
                  className="icon-btn"
                  aria-label="Copy login URL"
                  onClick={() => copyToClipboard(tenantUrl, 'URL')}
                  leftIcon={<Copy size={12} />}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="stats-grid stats-grid--spaced">
        {statCards.map((card) => (
          <div key={card.label} className={`stat-card stat-card--${card.accent}`}>
            <div className="stat-header stat-header--between">
              <span className="stat-label">{card.label}</span>
              <span className={`stat-card__icon--${card.accent}`}>{card.icon}</span>
            </div>
            <div className="stat-value stat-value--lg">
              {statsLoading ? (
                <div className="skeleton" style={{ height: '2rem', width: '40%' }} />
              ) : (
                card.value
              )}
            </div>
            <div className="stat-sub">{card.sub}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="card chart-card">
          <h3 className="chart-title">Issue Status Distribution</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={issueDistributionData}
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {issueDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '0.8rem', paddingTop: '1rem' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card chart-card">
          <h3 className="chart-title">Workspace Health</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" hide />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={CHART_TOOLTIP_STYLE} />
                <Bar
                  dataKey="todo"
                  name="To Do"
                  fill="var(--chart-todo)"
                  radius={[2, 2, 0, 0]}
                  barSize={40}
                />
                <Bar
                  dataKey="inProgress"
                  name="In Progress"
                  fill="var(--chart-progress)"
                  radius={[2, 2, 0, 0]}
                  barSize={40}
                />
                <Bar
                  dataKey="done"
                  name="Completed"
                  fill="var(--chart-done)"
                  radius={[2, 2, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <section>
        <h2 className="section-title">Quick Access</h2>
        <div className="quick-actions-grid">
          <div className="action-card action-card__body" onClick={() => navigate('/projects')}>
            <div className="action-card__icon action-card__icon--primary">
              <FolderKanban size={24} />
            </div>
            <span className="action-card__title">Projects</span>
            <p className="action-card__desc">
              Manage project boards and track team velocity.
            </p>
          </div>

          {user?.role === 'ADMIN' && (
            <div className="action-card action-card__body" onClick={() => navigate('/team')}>
              <div className="action-card__icon action-card__icon--accent">
                <Users size={24} />
              </div>
              <span className="action-card__title">Team Management</span>
              <p className="action-card__desc">Invite members and manage permissions.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
