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
      icon: <FolderKanban size={18} />,
      sub: 'Active workspaces',
      color: '#0052CC'
    },
    {
      label: 'To Do',
      value: stats?.todoCount ?? '0',
      icon: <AlertCircle size={18} />,
      sub: 'Awaiting start',
      color: '#42526E'
    },
    {
      label: 'In Progress',
      value: stats?.inProgressCount ?? '0',
      icon: <Clock size={18} />,
      sub: 'Active tasks',
      color: '#FFAB00'
    },
    {
      label: 'Done',
      value: stats?.doneCount ?? '0',
      icon: <CheckCircle2 size={18} />,
      sub: 'Completed',
      color: '#36B37E'
    },
  ];

  const issueDistributionData = [
    { name: 'To Do', value: stats?.todoCount || 0, color: '#42526E' },
    { name: 'In Progress', value: stats?.inProgressCount || 0, color: '#FFAB00' },
    { name: 'Done', value: stats?.doneCount || 0, color: '#36B37E' },
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
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <nav style={{ marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        Workspaces / <span style={{ color: 'var(--text-main)' }}>Overview</span>
      </nav>

      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.25rem' }}>
            {greeting()}, {user?.email?.split('@')[0]}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Track your team's progress and manage project deliverables.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={() => navigate('/projects')} style={{ height: '32px' }}>
             Browse Projects
          </button>
          {user?.role === 'ADMIN' && (
            <button className="btn btn-secondary" onClick={() => navigate('/team')} style={{ height: '32px' }}>
              Team
            </button>
          )}
        </div>
      </header>

      {/* Workspace Info (Admin Only) */}
      {user?.role === 'ADMIN' && (
        <div className="card" style={{ marginBottom: '2.5rem', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <Globe style={{ color: 'var(--primary)' }} size={20} />
            <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Workspace Configuration</h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Workspace ID</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <code style={{ background: '#F4F5F7', padding: '0.2rem 0.5rem', borderRadius: '3px', fontSize: '0.75rem' }}>{tenantId}</code>
                <button onClick={() => copyToClipboard(tenantId, 'ID')} className="theme-toggle" style={{ width: '24px', height: '24px' }}>
                  <Copy size={12} />
                </button>
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Login URL</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <code style={{ background: '#F4F5F7', padding: '0.2rem 0.5rem', borderRadius: '3px', fontSize: '0.75rem' }}>{tenantUrl}</code>
                <button onClick={() => copyToClipboard(tenantUrl, 'URL')} className="theme-toggle" style={{ width: '24px', height: '24px' }}>
                  <Copy size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
        {statCards.map((card) => (
          <div key={card.label} className="stat-card" style={{ borderLeft: `3px solid ${card.color}` }}>
            <div className="stat-header" style={{ justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>{card.label}</span>
              <span style={{ color: card.color }}>{card.icon}</span>
            </div>
            <div className="stat-value" style={{ fontSize: '1.75rem' }}>
              {statsLoading ? <div className="skeleton" style={{ height: '2rem', width: '40%' }} /> : card.value}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Analytics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            Issue Status Distribution
          </h3>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={issueDistributionData} innerRadius={70} outerRadius={90} paddingAngle={4} dataKey="value">
                  {issueDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--bg-surface)', 
                    border: '1px solid var(--border-main)', 
                    borderRadius: '3px', 
                    fontSize: '0.8rem',
                    boxShadow: 'var(--shadow-md)'
                  }} 
                />
                <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '0.8rem', paddingTop: '1rem' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            Workspace Health
          </h3>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" hide />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ 
                    background: 'var(--bg-surface)', 
                    border: '1px solid var(--border-main)', 
                    borderRadius: '3px',
                    fontSize: '0.8rem'
                  }} 
                />
                <Bar dataKey="todo" name="To Do" fill="#42526E" radius={[2, 2, 0, 0]} barSize={40} />
                <Bar dataKey="inProgress" name="In Progress" fill="#FFAB00" radius={[2, 2, 0, 0]} barSize={40} />
                <Bar dataKey="done" name="Completed" fill="#36B37E" radius={[2, 2, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Access */}
      <section>
        <h2 style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
          Quick Access
        </h2>
        <div className="quick-actions-grid">
          <div className="action-card" onClick={() => navigate('/projects')} style={{ padding: '1.5rem', alignItems: 'flex-start', textAlign: 'left' }}>
             <div style={{ background: '#DEEBFF', color: '#0052CC', padding: '0.75rem', borderRadius: '3px', marginBottom: '1rem' }}>
                <FolderKanban size={24} />
             </div>
             <span style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '0.25rem' }}>Projects</span>
             <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Manage project boards and track team velocity.</p>
          </div>
          
          {user?.role === 'ADMIN' && (
            <div className="action-card" onClick={() => navigate('/team')} style={{ padding: '1.5rem', alignItems: 'flex-start', textAlign: 'left' }}>
               <div style={{ background: '#EAE6FF', color: '#6554C0', padding: '0.75rem', borderRadius: '3px', marginBottom: '1rem' }}>
                  <Users size={24} />
               </div>
               <span style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '0.25rem' }}>Team Management</span>
               <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Invite members and manage permissions.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
