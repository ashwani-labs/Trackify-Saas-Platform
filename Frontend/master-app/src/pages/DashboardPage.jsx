import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  loadTenants,
  selectAllTenants,
  selectTenantLoading,
} from '../features/tenants/tenantSlice';
import { useAuth } from '../hooks/useAuth';
import { Users, Globe, CheckCircle2, ShieldAlert, TrendingUp } from 'lucide-react';
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
  const { role } = useAuth({ requireAuth: true });
  const tenants = useSelector(selectAllTenants);
  const isLoading = useSelector(selectTenantLoading);

  useEffect(() => {
    dispatch(loadTenants());
  }, [dispatch]);

  const totalTenants = tenants.length;
  const activeTenants = tenants.filter((t) => t.status === 'ACTIVE').length;
  const inactiveTenants = tenants.filter((t) => t.status === 'INACTIVE').length;

  const statusData = [
    { name: 'Active', value: activeTenants, color: 'var(--success)' },
    { name: 'Inactive', value: inactiveTenants, color: 'var(--danger)' },
  ];

  const distributionData = [
    { month: 'Jan', count: Math.max(0, totalTenants - 4) },
    { month: 'Feb', count: Math.max(0, totalTenants - 2) },
    { month: 'Mar', count: totalTenants },
  ];

  const statCards = [
    {
      label: 'Total Organizations',
      value: totalTenants,
      icon: <Globe size={24} />,
      color: 'primary',
    },
    {
      label: 'Active Workspaces',
      value: activeTenants,
      icon: <CheckCircle2 size={24} />,
      color: 'success',
    },
    {
      label: 'Inactive / Suspended',
      value: inactiveTenants,
      icon: <ShieldAlert size={24} />,
      color: 'danger',
    },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <section className="hero-section">
        <div>
          <h1 className="hero-title">Platform Overview</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Monitor global platform metrics and organizational health. Authenticated as{' '}
            <strong>{role || 'MASTER'}</strong>.
          </p>
        </div>
      </section>

      <section className="stats-grid">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="stat-card"
            style={{ borderLeft: `4px solid var(--${card.color})` }}
          >
            <div className="stat-header">
              <span style={{ color: `var(--${card.color})` }}>{card.icon}</span>
              <span style={{ fontWeight: '500' }}>{card.label}</span>
            </div>
            <div className="stat-value">
              {isLoading ? (
                <div className="skeleton" style={{ height: '2.5rem', width: '50%' }} />
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
          gap: '2rem',
          marginBottom: '3rem',
        }}
      >
        <div className="card glass-panel">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
            Workspace Status Distribution
          </h3>
          <div style={{ height: '240px', minWidth: 0, position: 'relative' }}>
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
                    borderRadius: '8px',
                    backdropFilter: 'blur(8px)',
                  }}
                  itemStyle={{ color: 'var(--text-main)' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card glass-panel">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Provisioning Trend</h3>
          <div style={{ height: '240px', minWidth: 0, position: 'relative' }}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={distributionData}>
                <XAxis
                  dataKey="month"
                  stroke="var(--text-muted)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-main)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section>
        <h2
          style={{
            marginBottom: '1.5rem',
            fontSize: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <TrendingUp size={24} color="var(--primary)" /> Recent Organizations
        </h2>
        {tenants.length === 0 ? (
          <div
            className="card"
            style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}
          >
            No tenants provisioned yet.
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Organization</th>
                  <th>Domain</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tenants.slice(0, 5).map((tenant) => (
                  <tr key={tenant.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            background: 'var(--bg-input)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            color: 'var(--primary)',
                          }}
                        >
                          {tenant.name.charAt(0)}
                        </div>
                        <span style={{ fontWeight: '600' }}>{tenant.name}</span>
                      </div>
                    </td>
                    <td>
                      <code style={{ fontSize: '0.85rem' }}>{tenant.domain}.trackify.io</code>
                    </td>
                    <td>
                      <span
                        className={`badge badge-${tenant.status === 'ACTIVE' ? 'success' : 'danger'}`}
                      >
                        {tenant.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="theme-toggle"
                        style={{ fontSize: '0.8rem', color: 'var(--primary)' }}
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
