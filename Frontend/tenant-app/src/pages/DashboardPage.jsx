import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchProjectStats } from '../features/projects/projectSlice';
import { fetchIssuesByProject } from '../features/issues/issueSlice';
import styles from './DashboardPage.module.css';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  CircleDot,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Users,
} from 'lucide-react';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, tenantId } = useSelector((s) => s.auth);
  const { projects, stats, statsLoading } = useSelector((s) => s.projects);

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
      label: 'Total Projects',
      value: stats?.totalProjects ?? '—',
      icon: <FolderKanban size={22} />,
      color: 'blue',
      sub: 'Active workspaces',
    },
    {
      label: 'Total Issues',
      value: stats?.totalIssues ?? '—',
      icon: <CircleDot size={22} />,
      color: 'purple',
      sub: 'Across all projects',
    },
    {
      label: 'To Do',
      value: stats?.todoCount ?? '—',
      icon: <AlertCircle size={22} />,
      color: 'orange',
      sub: 'Awaiting start',
    },
    {
      label: 'In Progress',
      value: stats?.inProgressCount ?? '—',
      icon: <Clock size={22} />,
      color: 'yellow',
      sub: 'Being worked on',
    },
    {
      label: 'Done',
      value: stats?.doneCount ?? '—',
      icon: <CheckCircle2 size={22} />,
      color: 'green',
      sub: 'Completed issues',
    },
  ];

  return (
    <div className={styles.page}>
      {/* ── Hero greeting ── */}
      <div className={styles.hero}>
        <div className={styles.heroLeft}>
          <p className={styles.greeting}>{greeting()},</p>
          <h1 className={styles.userName}>{user?.email?.split('@')[0]} 👋</h1>
          <p className={styles.subtitle}>Here's what's happening in your workspace today.</p>
        </div>
        <div className={styles.heroRight}>
          <button className={styles.ctaBtn} onClick={() => navigate('/projects')}>
            View Projects <ArrowRight size={16} />
          </button>
          {user?.role === 'ADMIN' && (
            <button className={styles.secondaryBtn} onClick={() => navigate('/team')}>
              <Users size={16} /> Manage Team
            </button>
          )}
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className={styles.statsGrid}>
        {statCards.map((card) => (
          <div key={card.label} className={`${styles.statCard} ${styles[card.color]}`}>
            <div className={styles.cardTop}>
              <div className={styles.cardIcon}>{card.icon}</div>
              <span className={styles.cardLabel}>{card.label}</span>
            </div>
            <div className={styles.cardValue}>
              {statsLoading ? <div className={styles.skeleton} /> : card.value}
            </div>
            <p className={styles.cardSub}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.quickActions}>
          <button className={styles.actionCard} onClick={() => navigate('/projects')}>
            <FolderKanban size={28} />
            <span>Browse Projects</span>
          </button>
          {user?.role === 'ADMIN' && (
            <button className={styles.actionCard} onClick={() => navigate('/pending-users')}>
              <Users size={28} />
              <span>User Approvals</span>
            </button>
          )}
          {user?.role === 'ADMIN' && (
            <button className={styles.actionCard} onClick={() => navigate('/team')}>
              <Users size={28} />
              <span>Team Members</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
