import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchProjectStats } from '../features/projects/projectSlice';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  CircleDot,
  AlertCircle,
  ArrowRight,
  Users,
  Copy,
  ExternalLink,
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
      icon: <FolderKanban size={24} />,
      sub: 'Active workspaces',
    },
    {
      label: 'Total Issues',
      value: stats?.totalIssues ?? '0',
      icon: <CircleDot size={24} />,
      sub: 'Across all projects',
    },
    {
      label: 'To Do',
      value: stats?.todoCount ?? '0',
      icon: <AlertCircle size={24} />,
      sub: 'Awaiting start',
    },
    {
      label: 'In Progress',
      value: stats?.inProgressCount ?? '0',
      icon: <Clock size={24} />,
      sub: 'Active tasks',
    },
    {
      label: 'Done',
      value: stats?.doneCount ?? '0',
      icon: <CheckCircle2 size={24} />,
      sub: 'Completed',
    },
  ];

  const issueDistributionData = [
    { name: 'To Do', value: stats?.todoCount || 0, color: 'var(--text-muted)' },
    { name: 'In Progress', value: stats?.inProgressCount || 0, color: 'var(--warning)' },
    { name: 'Done', value: stats?.doneCount || 0, color: 'var(--success)' },
  ];

  const workloadData = [
    { name: 'Issues', total: stats?.totalIssues || 0, active: (stats?.todoCount || 0) + (stats?.inProgressCount || 0) },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      {/* Hero Header */}
      <div className="hero-section">
        <div>
          <p style={{ color: 'var(--text-muted)', fontWeight: '500' }}>{greeting()},</p>
          <h1 className="hero-title">{user?.email?.split('@')[0]} 👋</h1>
          <p style={{ color: 'var(--text-muted)' }}>Here's what's happening in your workspace today.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-primary" onClick={() => navigate('/projects')}>
            View Projects <ArrowRight size={18} />
          </button>
          {user?.role === 'ADMIN' && (
            <button className="btn btn-secondary" onClick={() => navigate('/team')}>
              <Users size={18} /> Manage Team
            </button>
          )}
        </div>
      </div>
      
      {/* Workspace Info Banner (Admin Only) */}
      {user?.role === 'ADMIN' && (
        <div className="info-banner">
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Globe style={{ color: 'var(--primary)' }} size={24} />
              <h3 style={{ fontSize: '1.25rem' }}>Your Workspace</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Workspace ID</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <code style={{ background: 'var(--bg-input)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>{tenantId}</code>
                  <button onClick={() => copyToClipboard(tenantId, 'ID')} className="theme-toggle" style={{ width: '28px', height: '28px' }}>
                    <Copy size={14} />
                  </button>
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Login URL for Employees</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <code style={{ background: 'var(--bg-input)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>{tenantUrl}</code>
                  <button onClick={() => copyToClipboard(tenantUrl, 'URL')} className="theme-toggle" style={{ width: '28px', height: '28px' }}>
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <a href={tenantUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ height: 'fit-content' }}>
            Visit App <ExternalLink size={16} />
          </a>
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        {statCards.map((card) => (
          <div key={card.label} className="stat-card">
            <div className="stat-header">
              {card.icon}
              <span style={{ fontWeight: '500' }}>{card.label}</span>
            </div>
            <div className="stat-value">
              {statsLoading ? <div className="skeleton" style={{ height: '2.5rem', width: '50%' }} /> : card.value}
            </div>
            <div className="stat-footer">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Advanced Analytics */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        <div className="card glass-panel">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Issue Distribution</h3>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={issueDistributionData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {issueDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-main)', borderRadius: '8px', backdropFilter: 'blur(8px)' }}
                  itemStyle={{ color: 'var(--text-main)' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card glass-panel">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Workload Overview</h3>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadData}>
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-main)', borderRadius: '8px', backdropFilter: 'blur(8px)' }}
                />
                <Bar dataKey="total" name="Total Issues" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="active" name="Active Issues" fill="var(--accent)" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <div style={{ marginTop: '4rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Quick Actions</h2>
        <div className="quick-actions-grid">
          <div className="action-card" onClick={() => navigate('/projects')}>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: 'var(--radius-lg)' }}>
              <FolderKanban size={32} />
            </div>
            <span style={{ fontWeight: '600' }}>Browse Projects</span>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Manage and track project progress</p>
          </div>
          
          {user?.role === 'ADMIN' && (
            <div className="action-card" onClick={() => navigate('/pending-users')}>
              <div style={{ background: 'rgba(167, 139, 250, 0.1)', padding: '1rem', borderRadius: 'var(--radius-lg)' }}>
                <Users size={32} />
              </div>
              <span style={{ fontWeight: '600' }}>User Approvals</span>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Approve new employee requests</p>
            </div>
          )}
          
          {user?.role === 'ADMIN' && (
            <div className="action-card" onClick={() => navigate('/team')}>
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: 'var(--radius-lg)' }}>
                <Users size={32} />
              </div>
              <span style={{ fontWeight: '600' }}>Team Members</span>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Manage existing team members</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
