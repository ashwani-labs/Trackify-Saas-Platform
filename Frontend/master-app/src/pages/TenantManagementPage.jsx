import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadTenants, toggleTenantStatus, deleteTenantAsync, selectAllTenants, selectTenantLoading, selectTenantCurrentPage, selectTenantTotalPages } from '../features/tenants/tenantSlice';
import CreateTenantModal from '../components/tenants/CreateTenantModal';
import Pagination from '../components/common/Pagination';
import { Globe, Activity, RefreshCw, Plus, Trash2, Mail, ShieldCheck, ShieldAlert } from 'lucide-react';

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
    const warning = currentStatus === 'ACTIVE' 
      ? "\nNote: This will prevent users from logging in to this organization."
      : "";

    if (window.confirm(`Are you sure you want to ${action} this organization?${warning}`)) {
      dispatch(toggleTenantStatus({ id, currentStatus }));
    }
  };

  const handleDeleteTenant = (id, name) => {
    if (window.confirm(`⚠️ PERMANENT DELETION WARNING ⚠️\n\nAre you sure you want to PERMANENTLY delete "${name}"?\n\nThis will drop the organization's database and remove ALL data. This action CANNOT be undone.`)) {
      dispatch(deleteTenantAsync(id));
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <header className="hero-section">
        <div>
          <h1 className="hero-title">Tenant Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>View and manage all active organizations on the platform.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Create Tenant
        </button>
      </header>

      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="stat-header">
            <Globe size={20} color="var(--primary)" />
            <span style={{ fontWeight: '500' }}>Total Tenants</span>
          </div>
          <div className="stat-value">{tenants.length}</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--success)' }}>
          <div className="stat-header">
            <Activity size={20} color="var(--success)" />
            <span style={{ fontWeight: '500' }}>Active Now</span>
          </div>
          <div className="stat-value">{tenants.filter(t => t.status === 'ACTIVE').length}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-main)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1.1rem' }}>Organization List</h2>
          <button className="theme-toggle" onClick={() => dispatch(loadTenants({ page: currentPage, size: 10 }))} disabled={isLoading}>
            <RefreshCw size={18} style={{ animation: isLoading ? 'loading 2s linear infinite' : 'none' }} />
          </button>
        </div>

        <div className="table-wrapper" style={{ border: 'none', marginTop: 0, borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Organization</th>
                <th>Domain</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr key={tenant.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ 
                        width: '36px', height: '36px', borderRadius: '8px', 
                        background: 'var(--bg-input)', display: 'flex', alignItems: 'center', 
                        justifyContent: 'center', fontWeight: 'bold', color: 'var(--primary)'
                      }}>
                        {tenant.name.charAt(0)}
                      </div>
                      <span style={{ fontWeight: '600' }}>{tenant.name}</span>
                    </div>
                  </td>
                  <td><code style={{ fontSize: '0.85rem' }}>{tenant.domain}.trackify.io</code></td>
                  <td>
                    <span className="badge badge-primary" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
                      {tenant.plan}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${tenant.status === 'ACTIVE' ? 'success' : 'danger'}`}>
                      {tenant.status === 'ACTIVE' ? <ShieldCheck size={14} style={{ marginRight: '4px' }} /> : <ShieldAlert size={14} style={{ marginRight: '4px' }} />}
                      {tenant.status}
                    </span>
                  </td>
                  <td>{new Date(tenant.createdAt).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button 
                        onClick={() => handleToggleStatus(tenant.id, tenant.status)}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                      >
                        {tenant.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </button>
                      
                      {tenant.status === 'INACTIVE' && (
                        <button 
                          onClick={() => handleDeleteTenant(tenant.id, tenant.name)}
                          className="theme-toggle"
                          style={{ color: 'var(--danger)' }}
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {tenants.length === 0 && !isLoading && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>No tenants found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {tenants.length > 0 && totalPages > 1 && (
          <div style={{ padding: '1rem' }}>
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => dispatch(loadTenants({ page, size: 10 }))}
            />
          </div>
        )}
      </div>

      <CreateTenantModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default TenantManagementPage;
