import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  loadTenants,
  loadDashboardStats,
  loadTenantDetail,
  selectAllTenants,
  selectTenantLoading,
  selectTenantStatsLoading,
  selectDashboardStats,
} from '../features/tenants/tenantSlice';
import { ROUTES } from '../constants/routes';
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
import { PageHeader, Button, Badge, EmptyState } from '@trackify/shared';

const CHART_TOOLTIP_STYLE = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-main)',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--shadow-md)',
  fontSize: '0.75rem',
};

const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
    { name: 'Active', value: activeTenants, color: 'var(--success)' },
    { name: 'Inactive', value: inactiveTenants, color: 'var(--danger)' },
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

  const provisioningData = useMemo(() => {
    if (!dashboardStats?.provisioning?.length) {
      return [];
    }
    return dashboardStats.provisioning.map((point) => ({
      month: point.label,
      count: point.count,
    }));
  }, [dashboardStats]);

  const statCards = [
    {
      label: 'Organizations',
      value: totalTenants,
      icon: <Globe size={18} />,
      accent: 'primary',
    },
    {
      label: 'Active Workspaces',
      value: activeTenants,
      icon: <CheckCircle2 size={18} />,
      accent: 'success',
    },
    {
      label: 'Inactive',
      value: inactiveTenants,
      icon: <ShieldAlert size={18} />,
      accent: 'danger',
    },
  ];

  const statsLoading = isStatsLoading && !dashboardStats;

  const handleManageTenant = (tenantId) => {
    dispatch(loadTenantDetail(tenantId));
    navigate(ROUTES.TENANTS);
  };

  return (
    <div className="page">
      <PageHeader
        breadcrumb={
          <>
            Administration / <strong>Dashboard</strong>
          </>
        }
        title="Platform Overview"
        subtitle="Real-time insights into global platform health and organizational metrics."
      />

      <section className="stats-grid">
        {statCards.map((card) => (
          <div key={card.label} className={`stat-card stat-card--${card.accent}`}>
            <div className="stat-header stat-header--between">
              <span className="stat-label">{card.label}</span>
              <span className={`stat-card__icon--${card.accent}`}>{card.icon}</span>
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

      <section className="dashboard-grid dashboard-grid--compact">
        <div className="card chart-card">
          <h3 className="chart-title">Workspace Distribution</h3>
          <div className="chart-container--sm">
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
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '0.75rem' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card chart-card">
          <h3 className="chart-title">Total Workspaces</h3>
          <div className="chart-container--sm">
            {statsLoading ? (
              <div className="skeleton chart-empty" />
            ) : growthData.length === 0 ? (
              <div className="chart-empty">No tenant growth data yet.</div>
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
                    cursor={{ fill: 'color-mix(in srgb, var(--text-main) 5%, transparent)' }}
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(value) => [`${value} workspaces`, 'Cumulative']}
                  />
                  <Bar dataKey="count" fill="var(--primary)" radius={[2, 2, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card chart-card">
          <h3 className="chart-title">New Provisioning</h3>
          <div className="chart-container--sm">
            {statsLoading ? (
              <div className="skeleton chart-empty" />
            ) : provisioningData.length === 0 ? (
              <div className="chart-empty">No provisioning data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={provisioningData}>
                  <XAxis
                    dataKey="month"
                    stroke="var(--text-muted)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'color-mix(in srgb, var(--text-main) 5%, transparent)' }}
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(value) => [`${value} new`, 'Provisioned']}
                  />
                  <Bar dataKey="count" fill="var(--success)" radius={[2, 2, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="list-section-header">
          <h2 className="list-section-title">Recent Organizations</h2>
          <Button variant="secondary" size="sm" onClick={() => navigate(ROUTES.TENANTS)}>
            View all tenants
          </Button>
        </div>

        {isLoading && tenants.length === 0 ? (
          <div className="card card--spaced">
            <div className="skeleton" style={{ height: '1.5rem', width: '40%' }} />
          </div>
        ) : tenants.length === 0 ? (
          <EmptyState title="No tenants provisioned yet." className="card--spaced" />
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
                      <div className="org-row">
                        <div className="org-avatar" aria-hidden>
                          {tenant.name.charAt(0)}
                        </div>
                        <span className="org-name">{tenant.name}</span>
                      </div>
                    </td>
                    <td>
                      <code className="domain-code">{tenant.domain}.trackify.io</code>
                    </td>
                    <td>
                      <Badge variant={tenant.status === 'ACTIVE' ? 'success' : 'danger'}>
                        {tenant.status}
                      </Badge>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleManageTenant(tenant.id)}
                      >
                        Manage
                      </Button>
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
