import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  loadTenants,
  toggleTenantStatus,
  deleteTenantAsync,
  selectAllTenants,
  selectTenantLoading,
  selectTenantCurrentPage,
  selectTenantTotalPages,
} from '../features/tenants/tenantSlice';
import CreateTenantModal from '../components/tenants/CreateTenantModal';
import Pagination from '../components/common/Pagination';
import {
  Globe,
  Activity,
  RefreshCw,
  Plus,
  Trash2,
  Mail,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

const TenantManagementPage = () => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tenants = useSelector(selectAllTenants);
  const isLoading = useSelector(selectTenantLoading);
  const currentPage = useSelector(selectTenantCurrentPage);
  const totalPages = useSelector(selectTenantTotalPages);

  useEffect(() => {
    dispatch(loadTenants({ page: 0, size: 10 }));
  }, [dispatch]);

  const handleToggleStatus = (id, currentStatus) => {
    const action = currentStatus === 'ACTIVE' ? 'mark as INACTIVE' : 'mark as ACTIVE';
    const warning =
      currentStatus === 'ACTIVE'
        ? '\nNote: This will prevent users from logging in to this organization.'
        : '';

    if (window.confirm(`Are you sure you want to ${action} this organization?${warning}`)) {
      dispatch(toggleTenantStatus({ id, currentStatus }));
    }
  };

  const handleDeleteTenant = (id, name) => {
    if (
      window.confirm(
        `⚠️ PERMANENT DELETION WARNING ⚠️\n\nAre you sure you want to PERMANENTLY delete "${name}"?\n\nThis will drop the organization's database and remove ALL data. This action CANNOT be undone.`
      )
    ) {
      dispatch(deleteTenantAsync(id));
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <nav style={{ marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        Administration / <span style={{ color: 'var(--text-main)' }}>Tenants</span>
      </nav>

      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.25rem' }}>Tenant Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Centralized control for all active organizations and infrastructure provisioning.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ height: '32px' }}>
          <Plus size={16} /> Create Tenant
        </button>
      </header>

      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-header">
            <span>Total Tenants</span>
            <Globe size={16} color="var(--primary)" />
          </div>
          <div className="stat-value">{tenants.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <span>Active Workspaces</span>
            <Activity size={16} color="var(--success)" />
          </div>
          <div className="stat-value">{tenants.filter((t) => t.status === 'ACTIVE').length}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2 style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Organization List
          </h2>
          <button
            className="theme-toggle"
            onClick={() => dispatch(loadTenants({ page: currentPage, size: 10 }))}
            disabled={isLoading}
            style={{ width: '32px', height: '32px' }}
          >
            <RefreshCw
              size={16}
              style={{ animation: isLoading ? 'loading 2s linear infinite' : 'none' }}
            />
          </button>
        </div>

        <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: '25%' }}>Organization</th>
                <th style={{ width: '25%' }}>Domain</th>
                <th style={{ width: '15%' }}>Plan</th>
                <th style={{ width: '15%' }}>Status</th>
                <th style={{ width: '10%' }}>Joined</th>
                <th style={{ width: '10%', textAlign: 'right' }}>Actions</th>
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
                      <span style={{ fontWeight: '500', fontSize: '0.875rem' }}>{tenant.name}</span>
                    </div>
                  </td>
                  <td>
                    <code style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{tenant.domain}.trackify.io</code>
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: '#DEEBFF',
                        color: '#0052CC',
                        fontSize: '0.65rem'
                      }}
                    >
                      {tenant.plan}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge badge-${tenant.status === 'ACTIVE' ? 'success' : 'danger'}`}
                      style={{ fontSize: '0.65rem' }}
                    >
                      {tenant.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(tenant.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleToggleStatus(tenant.id, tenant.status)}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.7rem', height: '24px', padding: '0 0.5rem' }}
                      >
                        {tenant.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </button>

                      {tenant.status === 'INACTIVE' && (
                        <button
                          onClick={() => handleDeleteTenant(tenant.id, tenant.name)}
                          className="theme-toggle"
                          style={{ color: 'var(--danger)', width: '24px', height: '24px' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {tenants.length === 0 && !isLoading && (
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}
                  >
                    No tenants found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {tenants.length > 0 && totalPages > 1 && (
          <div style={{ padding: '1rem', borderTop: '1px solid var(--border-main)' }}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => dispatch(loadTenants({ page, size: 10 }))}
            />
          </div>
        )}
      </div>

      <CreateTenantModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default TenantManagementPage;
