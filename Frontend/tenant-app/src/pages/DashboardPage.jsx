import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchDashboard } from '../features/dashboard/dashboardSlice';
import { fetchAllUsers } from '../features/users/userSlice';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  Copy,
  Globe,
  ListTodo,
  Bell,
  Zap,
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
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { PageHeader, Button, Alert, OnboardingChecklist, ROLES, Select } from '@trackify/shared';
import MyOpenIssuesWidget from '../components/dashboard/MyOpenIssuesWidget';
import RecentActivityWidget from '../components/dashboard/RecentActivityWidget';
import RecentProjectsWidget from '../components/dashboard/RecentProjectsWidget';
import { getTenantWorkspaceBaseUrl, copyToClipboard } from '../utils/workspaceUrl';

const CHART_TOOLTIP_STYLE = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-main)',
  borderRadius: 'var(--radius-md)',
  fontSize: '0.8rem',
  boxShadow: 'var(--shadow-md)',
};

const PRIORITY_COLORS = {
  LOW: 'var(--text-muted)',
  MEDIUM: 'var(--primary)',
  HIGH: 'var(--warning)',
  URGENT: 'var(--danger)',
};

const DATE_RANGE_OPTIONS = [
  { value: '', label: 'All time' },
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
];

const STATUS_CHART_MAP = {
  'To Do': 'TODO',
  'In Progress': 'IN_PROGRESS',
  Done: 'DONE',
};

const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, tenantId, tenantDomain } = useSelector((s) => s.auth);
  const { data: dashboard, isLoading, error } = useSelector((s) => s.dashboard);
  const { allUsersTotalElements, isLoading: usersLoading } = useSelector((s) => s.users);
  const isAdmin = user?.role === ROLES.ADMIN;
  const [chartDays, setChartDays] = useState('');

  const stats = dashboard?.summary;
  const tenantUrl = getTenantWorkspaceBaseUrl(tenantDomain);

  const handleCopy = async (text, label) => {
    const copied = await copyToClipboard(text);
    if (copied) toast.success(`${label} copied`);
    else toast.error(`Could not copy ${label.toLowerCase()}`);
  };

  useEffect(() => {
    const days = chartDays ? Number(chartDays) : undefined;
    dispatch(fetchDashboard(days));
  }, [dispatch, chartDays]);

  useEffect(() => {
    if (isAdmin && tenantId) {
      dispatch(fetchAllUsers({ tenantId, page: 0, size: 10 }));
    }
  }, [dispatch, isAdmin, tenantId]);

  const hasProject = (stats?.totalProjects ?? 0) > 0;
  const hasTeam = (allUsersTotalElements ?? 0) > 1;

  const showOnboarding = isAdmin && !isLoading && !usersLoading && (!hasProject || !hasTeam || (stats?.totalIssues ?? 0) === 0);

  const onboardingSteps = useMemo(
    () => [
      {
        id: 'project',
        label: 'Create your first project',
        description: 'Organize issues, sprints, and boards in a dedicated workspace.',
        done: hasProject,
        actionLabel: 'Create project',
        onAction: () => navigate('/projects', { state: { openCreate: true } }),
      },
      {
        id: 'issue',
        label: 'Create your first issue',
        description: 'Add work items to your board and start tracking progress.',
        done: (stats?.totalIssues ?? 0) > 0,
        actionLabel: 'Go to projects',
        onAction: () => navigate('/projects'),
      },
      {
        id: 'team',
        label: 'Invite your first teammate',
        description: 'Add colleagues or share your self-registration link so others can join.',
        done: hasTeam,
        actionLabel: 'Add member',
        onAction: () => navigate('/team', { state: { openAdd: true } }),
      },
      {
        id: 'sprint',
        label: 'Plan your first sprint',
        description: 'Group issues into a sprint and track burndown on the backlog view.',
        done: (stats?.activeSprints ?? 0) > 0,
        actionLabel: 'Open a project',
        onAction: () => navigate('/projects'),
      },
    ],
    [hasProject, hasTeam, navigate, stats?.totalIssues, stats?.activeSprints]
  );

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

  const insightCards = [
    {
      label: 'Assigned to me',
      value: dashboard?.assignedToMeCount ?? 0,
      icon: <ListTodo size={18} />,
      accent: 'primary',
      onClick: () => navigate('/projects'),
    },
    {
      label: 'Active sprints',
      value: dashboard?.activeSprintCount ?? 0,
      icon: <Zap size={18} />,
      accent: 'warning',
      onClick: () => navigate('/projects'),
    },
    {
      label: 'Unread alerts',
      value: dashboard?.unreadNotifications ?? 0,
      icon: <Bell size={18} />,
      accent: 'accent',
      onClick: () => navigate('/notification-preferences'),
    },
  ];

  const openProjectFilter = (params) => {
    const project = dashboard?.recentProjects?.[0];
    if (project) {
      const query = new URLSearchParams(params).toString();
      navigate(`/projects/${project.id}${query ? `?${query}` : ''}`);
      return;
    }
    navigate('/projects');
  };

  const handleStatusChartClick = (entry) => {
    const status = STATUS_CHART_MAP[entry?.name];
    if (status) openProjectFilter({ status });
  };

  const handlePriorityChartClick = (entry) => {
    if (entry?.name) openProjectFilter({ priority: entry.name });
  };

  const issueDistributionData = [
    { name: 'To Do', value: stats?.todoCount || 0, color: 'var(--chart-todo)' },
    { name: 'In Progress', value: stats?.inProgressCount || 0, color: 'var(--chart-progress)' },
    { name: 'Done', value: stats?.doneCount || 0, color: 'var(--chart-done)' },
  ];

  const priorityData = (dashboard?.priorityBreakdown ?? []).map((item) => ({
    name: item.priority,
    count: item.count,
    color: PRIORITY_COLORS[item.priority] || 'var(--primary)',
  }));

  const hasIssueChartData = issueDistributionData.some((item) => item.value > 0);
  const hasPriorityChartData = priorityData.some((item) => item.count > 0);

  return (
    <div className="page page--dashboard">
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
            <Select
              id="dashboard-chart-days"
              label="Chart range"
              value={chartDays}
              onChange={(e) => setChartDays(e.target.value)}
              options={DATE_RANGE_OPTIONS}
              className="dashboard-range-select"
            />
            <Button onClick={() => navigate('/projects')}>Browse Projects</Button>
            {user?.role === 'ADMIN' && (
              <Button variant="secondary" onClick={() => navigate('/team')}>
                Team
              </Button>
            )}
          </>
        }
      />

      <div className="dashboard-sections">
      {error && <Alert className="page-alert">{error}</Alert>}

      {showOnboarding && (
        <OnboardingChecklist
          title="Welcome to your workspace"
          subtitle="A quick setup checklist — finish these steps to unlock the full Trackify experience."
          steps={onboardingSteps}
        />
      )}

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
                  onClick={() => handleCopy(tenantId, 'ID')}
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
                  onClick={() => handleCopy(tenantUrl, 'URL')}
                  leftIcon={<Copy size={12} />}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {isAdmin && (
      <div className="stats-grid">
        {statCards.map((card) => (
          <div key={card.label} className={`stat-card stat-card--${card.accent}`}>
            <div className="stat-header stat-header--between">
              <span className="stat-label">{card.label}</span>
              <span className={`stat-card__icon--${card.accent}`}>{card.icon}</span>
            </div>
            <div className="stat-value stat-value--lg">
              {isLoading ? (
                <div className="skeleton" style={{ height: '2rem', width: '40%' }} />
              ) : (
                card.value
              )}
            </div>
            <div className="stat-sub">{card.sub}</div>
          </div>
        ))}
      </div>
      )}

      <div className="stats-grid stats-grid--insights">
        {insightCards.map((card) => {
          const content = (
            <>
              <div className="stat-header stat-header--between">
                <span className="stat-label">{card.label}</span>
                <span className={`stat-card__icon--${card.accent}`}>{card.icon}</span>
              </div>
              <div className="stat-value">
                {isLoading ? (
                  <div className="skeleton" style={{ height: '1.75rem', width: '30%' }} />
                ) : (
                  card.value
                )}
              </div>
            </>
          );

          if (card.onClick) {
            return (
              <button
                key={card.label}
                type="button"
                className={`stat-card stat-card--${card.accent} stat-card--interactive`}
                onClick={card.onClick}
              >
                {content}
              </button>
            );
          }

          return (
            <div key={card.label} className={`stat-card stat-card--${card.accent}`}>
              {content}
            </div>
          );
        })}
      </div>

      <div className="dashboard-grid dashboard-grid--widgets">
        <MyOpenIssuesWidget issues={dashboard?.myOpenIssues} isLoading={isLoading} />
        <RecentActivityWidget activity={dashboard?.recentActivity} isLoading={isLoading} />
      </div>

      {isAdmin && (
      <div className="dashboard-grid">
        <div className="card chart-card">
          <h3 className="chart-title">Issue Status Distribution</h3>
          <div className="chart-container">
            {isLoading ? (
              <div className="skeleton chart-empty" />
            ) : !hasIssueChartData ? (
              <div className="chart-empty">
                <p>No issues yet.</p>
                <Button size="sm" onClick={() => navigate('/projects')}>
                  Create a project
                </Button>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={issueDistributionData}
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    onClick={(_, index) => handleStatusChartClick(issueDistributionData[index])}
                    style={{ cursor: 'pointer' }}
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
            )}
          </div>
        </div>

        <div className="card chart-card">
          <h3 className="chart-title">Issues by Priority</h3>
          <div className="chart-container">
            {isLoading ? (
              <div className="skeleton chart-empty" />
            ) : !hasPriorityChartData ? (
              <div className="chart-empty">
                <p>No priority data yet.</p>
                <Button size="sm" onClick={() => navigate('/projects')}>
                  Go to projects
                </Button>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <XAxis
                    dataKey="name"
                    stroke="var(--text-muted)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis hide allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={CHART_TOOLTIP_STYLE} />
                  <Bar
                    dataKey="count"
                    name="Issues"
                    radius={[4, 4, 0, 0]}
                    barSize={36}
                    onClick={(entry) => handlePriorityChartClick(entry)}
                    style={{ cursor: 'pointer' }}
                  >
                    {priorityData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
      )}

      <RecentProjectsWidget projects={dashboard?.recentProjects} isLoading={isLoading} />

      <section className="dashboard-quick-access">
        <h2 className="section-title">Quick Access</h2>
        <div className="quick-actions-grid">
          <div className="action-card action-card__body" onClick={() => navigate('/projects')}>
            <div className="action-card__icon action-card__icon--primary">
              <FolderKanban size={24} />
            </div>
            <span className="action-card__title">Projects</span>
            <p className="action-card__desc">Manage project boards and track team velocity.</p>
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
    </div>
  );
};

export default DashboardPage;
