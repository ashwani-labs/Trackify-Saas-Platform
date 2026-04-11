import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadTenants, selectAllTenants, selectTenantLoading } from '../features/tenants/tenantSlice';
import { useAuth } from '../hooks/useAuth';
import { Users, Globe, Activity, ShieldAlert, CheckCircle2 } from 'lucide-react';
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
import styles from './DashboardPage.module.css';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { role } = useAuth({ requireAuth: true });
  const tenants = useSelector(selectAllTenants);
  const isLoading = useSelector(selectTenantLoading);

  useEffect(() => {
    dispatch(loadTenants());
  }, [dispatch]);

  const totalTenants = tenants.length;
  const activeTenants = tenants.filter(t => t.status === 'ACTIVE').length;
  const inactiveTenants = tenants.filter(t => t.status === 'INACTIVE').length;

  const statusData = [
    { name: 'Active', value: activeTenants, color: '#34d399' },
    { name: 'Inactive', value: inactiveTenants, color: '#fb7185' },
  ];

  // Mock distribution by month for visualization
  const distributionData = [
    { month: 'Jan', count: Math.max(0, totalTenants - 4) },
    { month: 'Feb', count: Math.max(0, totalTenants - 2) },
    { month: 'Mar', count: totalTenants },
  ];

  return (
    <div className={styles.dashboardWrapper}>
      <section className={styles.welcomeSection}>
        <h1 className={styles.title}>Platform Overview</h1>
        <p className={styles.subtitle}>
          Welcome back. You are authenticated as {role || 'MASTER'}. Monitor global platform metrics here.
        </p>
      </section>

      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(124, 111, 255, 0.1)', color: '#a78bfa' }}>
            <Globe size={26} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{isLoading ? '-' : totalTenants}</span>
            <span className={styles.statLabel}>Total Organizations</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(52, 211, 153, 0.1)', color: '#34d399' }}>
            <CheckCircle2 size={26} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{isLoading ? '-' : activeTenants}</span>
            <span className={styles.statLabel}>Active Workspaces</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#fb7185' }}>
            <ShieldAlert size={26} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{isLoading ? '-' : inactiveTenants}</span>
            <span className={styles.statLabel}>Inactive / Suspended</span>
          </div>
        </div>
      </section>

      <section className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Workspace Status Distribution</h3>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={statusData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Provisioning Trend</h3>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={distributionData}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className={styles.recentSection}>
        <h2 className={styles.sectionTitle}>Recent Organizations</h2>
        {tenants.length === 0 ? (
          <div className={styles.emptyState}>
            No tenants provisioned yet. Switch to the Tenants tab to create one.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {tenants.slice(0, 3).map(tenant => (
              <div key={tenant.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ 
                    width: '40px', height: '40px', borderRadius: '8px', 
                    background: '#1e293b', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', fontWeight: 'bold' 
                  }}>
                    {tenant.name.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, color: '#f8fafc' }}>{tenant.name}</h4>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{tenant.domain}.trackify.io</span>
                  </div>
                </div>
                <span style={{
                  padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600',
                  background: tenant.status === 'ACTIVE' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                  color: tenant.status === 'ACTIVE' ? '#34d399' : '#fb7185'
                }}>
                  {tenant.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default DashboardPage;
