import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  loadTenants,
  loadDashboardStats,
  selectAllTenants,
  selectTenantLoading,
  selectTenantStatsLoading,
  selectDashboardStats,
} from '../features/tenants/tenantSlice';
import { useAuth } from '../hooks/useAuth';
import { Globe, CheckCircle2, ShieldAlert } from 'lucide-react';
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
  useAuth({ requireAuth: true });
  const tenants = useSelector(selectAllTenants);
  const isLoading = useSelector(selectTenantLoading);
  const isStatsLoading = useSelector(selectTenantStatsLoading);
  const dashboardStats = useSelector(selectDashboardStats);

  useEffect(() => {
    dispatch(loadTenants({ page: 0, size: 5 }));
    dispatch(loadDashboardStats({ months: 6 }));
  }, [dispatch]);

  const totalTenants = dashboardStats?.totalTenants ?? 0;
  const activeTenants = dashboardStats?.activeTenants ?? 0;
  const inactiveTenants = dashboardStats?.inactiveTenants ?? 0;

  const statusData = [
    { name: 'Active', value: activeTenants, color: '#36B37E' },
    { name: 'Inactive', value: inactiveTenants, color: '#FF5630' },
  ];

  const growthData = useMemo(() => {
    if (!dashboardStats?.growth?.length) {
      return [];
    }
    return dashboardStats.growth.map((point) => ({
      month: point.label,
      count: point.count,
    }));
  }, [dashboardStats]);

  const statCards = [
    {
      label: 'Organizations',
      value: totalTenants,
      icon: <Globe size={18} />,
      color: '#0052CC',
    },
    {
      label: 'Active Workspaces',
      value: activeTenants,
      icon: <CheckCircle2 size={18} />,
      color: '#36B37E',
    },
    {
      label: 'Inactive',
      value: inactiveTenants,
      icon: <ShieldAlert size={18} />,
      color: '#FF5630',
    },
  ];

  const statsLoading = isStatsLoading && !dashboardStats;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <nav style={{ marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        Administration / <span style={{ color: 'var(--text-main)' }}>Dashboard</span>
      </nav>

      <section style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.25rem' }}>
          Platform Overview
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Real-time insights into global platform health and organizational metrics.
        </p>
      </section>

      <section className="stats-grid">
        {statCards.map((card) => (
          <div key={card.label} className="stat-card">
            <div className="stat-header">
              <span>{card.label}</span>
              <span style={{ color: card.color }}>{card.icon}</span>
            </div>
            <div className="stat-value">
              {statsLoading ? (
                <div className="skeleton" style={{ height: '2rem', width: '40%' }} />
              ) : (
                card.value
              )}
            </div>
          </div>
        ))}
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem',
        }}
      >
        <div className="card">
          <h3
            style={{
              marginBottom: '1.25rem',
              fontSize: '0.875rem',
              fontWeight: '700',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
            }}
          >
            Workspace Distribution
          </h3>
          <div style={{ height: '240px', minWidth: 0 }}>
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
                  contentStyle={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-main)',
                    borderRadius: '3px',
                    boxShadow: 'var(--shadow-md)',
                    fontSize: '0.75rem',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '0.75rem' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3
            style={{
              marginBottom: '1.25rem',
              fontSize: '0.875rem',
              fontWeight: '700',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
            }}
          >
            Provisioning Growth
          </h3>
          <div style={{ height: '240px', minWidth: 0 }}>
            {statsLoading ? (
              <div className="skeleton" style={{ height: '100%', width: '100%' }} />
            ) : growthData.length === 0 ? (
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.875rem',
                }}
              >
                No tenant growth data yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={growthData}>
                  <XAxis
                    dataKey="month"
                    stroke="var(--text-muted)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(9, 30, 66, 0.05)' }}
                    contentStyle={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-main)',
                      borderRadius: '3px',
                      boxShadow: 'var(--shadow-md)',
                      fontSize: '0.75rem',
                    }}
                    formatter={(value) => [`${value} tenants`, 'Total']}
                  />
                  <Bar dataKey="count" fill="var(--primary)" radius={[2, 2, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      <section>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}
        >
          <h2
            style={{
              fontSize: '1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            Recent Organizations
          </h2>
          <button className="btn btn-secondary" style={{ height: '32px', fontSize: '0.75rem' }}>
            View all tenants
          </button>
        </div>

        {isLoading && tenants.length === 0 ? (
          <div className="card" style={{ padding: '2rem' }}>
            <div className="skeleton" style={{ height: '1.5rem', width: '40%' }} />
          </div>
        ) : tenants.length === 0 ? (
          <div
            className="card"
            style={{
              textAlign: 'center',
              padding: '3rem',
              color: 'var(--text-muted)',
              fontSize: '0.875rem',
            }}
          >
            No tenants provisioned yet.
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>Organization</th>
                  <th style={{ width: '30%' }}>Domain</th>
                  <th style={{ width: '15%' }}>Status</th>
                  <th style={{ width: '15%', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant) => (
                  <tr key={tenant.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '3px',
                            background: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            color: 'white',
                          }}
                        >
                          {tenant.name.charAt(0)}
                        </div>
                        <span style={{ fontWeight: '500', fontSize: '0.875rem' }}>
                          {tenant.name}
                        </span>
                      </div>
                    </td>
                    <td>
                      <code style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>
                        {tenant.domain}.trackify.io
                      </code>
                    </td>
                    <td>
                      <span
                        className={`badge badge-${tenant.status === 'ACTIVE' ? 'success' : 'danger'}`}
                        style={{ fontSize: '0.65rem' }}
                      >
                        {tenant.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ height: '24px', padding: '0 0.5rem', fontSize: '0.7rem' }}
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default DashboardPage;
