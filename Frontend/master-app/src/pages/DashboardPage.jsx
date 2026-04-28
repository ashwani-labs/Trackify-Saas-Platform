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
    { name: 'Active', value: activeTenants, color: '#36B37E' }, // Success G300
    { name: 'Inactive', value: inactiveTenants, color: '#FF5630' }, // Danger R300
  ];

  const distributionData = [
    { month: 'Jan', count: Math.max(0, totalTenants - 4) },
    { month: 'Feb', count: Math.max(0, totalTenants - 2) },
    { month: 'Mar', count: totalTenants },
  ];

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

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <nav style={{ marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        Administration / <span style={{ color: 'var(--text-main)' }}>Dashboard</span>
      </nav>

      <section style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.25rem' }}>Platform Overview</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Real-time insights into global platform health and organizational metrics.
        </p>
      </section>

      <section className="stats-grid">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="stat-card"
          >
            <div className="stat-header">
              <span>{card.label}</span>
              <span style={{ color: card.color }}>{card.icon}</span>
            </div>
            <div className="stat-value">
              {isLoading ? (
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
          <h3 style={{ marginBottom: '1.25rem', fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
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
                    fontSize: '0.75rem'
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '0.75rem' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1.25rem', fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Provisioning Growth
          </h3>
          <div style={{ height: '240px', minWidth: 0 }}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={distributionData}>
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
                    fontSize: '0.75rem'
                  }}
                />
                <Bar dataKey="count" fill="var(--primary)" radius={[2, 2, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             Recent Organizations
          </h2>
          <button className="btn btn-secondary" style={{ height: '32px', fontSize: '0.75rem' }}>View all tenants</button>
        </div>
        
        {tenants.length === 0 ? (
          <div
            className="card"
            style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}
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
                {tenants.slice(0, 5).map((tenant) => (
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
                        <span style={{ fontWeight: '500', fontSize: '0.875rem' }}>{tenant.name}</span>
                      </div>
                    </td>
                    <td>
                      <code style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{tenant.domain}.trackify.io</code>
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
