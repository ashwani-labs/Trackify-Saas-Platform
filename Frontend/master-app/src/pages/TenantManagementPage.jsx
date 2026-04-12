import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadTenants, toggleTenantStatus, deleteTenantAsync, selectAllTenants, selectTenantLoading, selectTenantCurrentPage, selectTenantTotalPages } from '../features/tenants/tenantSlice';
import CreateTenantModal from '../components/tenants/CreateTenantModal';
import styles from './TenantManagementPage.module.css';
import Pagination from '../components/common/Pagination';
import { Users, Globe, Activity, ShieldCheck, ShieldAlert, RefreshCw, Plus, Trash2 } from 'lucide-react';

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
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Tenant Management</h1>
          <p className={styles.subtitle}>View and manage all active organizations on the platform.</p>
        </div>
        <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Create Tenant
        </button>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}>
            <Globe size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Tenants</span>
            <span className={styles.statValue}>{tenants.length}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
            <Activity size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Active Now</span>
            <span className={styles.statValue}>{tenants.filter(t => t.status === 'ACTIVE').length}</span>
          </div>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Organization List</h2>
          <button className={styles.refreshBtn} onClick={() => dispatch(loadTenants({ page: currentPage, size: 10 }))} disabled={isLoading}>
            <RefreshCw size={16} className={isLoading ? styles.spinning : ''} />
          </button>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Organization</th>
                <th>Domain</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Created At</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr key={tenant.id}>
                  <td>
                    <div className={styles.tenantInfo}>
                      <div className={styles.tenantAvatar}>{tenant.name.charAt(0)}</div>
                      <span className={styles.tenantName}>{tenant.name}</span>
                    </div>
                  </td>
                  <td><code className={styles.code}>{tenant.domain}.trackify.io</code></td>
                  <td>
                    <span className={`${styles.planBadge} ${styles[`plan-${tenant.plan.toLowerCase()}`]}`}>
                      {tenant.plan}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${tenant.status === 'ACTIVE' ? styles.statusActive : styles.statusInactive}`}>
                      {tenant.status === 'ACTIVE' ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                      {tenant.status}
                    </span>
                  </td>
                  <td>{new Date(tenant.createdAt).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div className={styles.actions}>
                      <button 
                        onClick={() => handleToggleStatus(tenant.id, tenant.status)}
                        className={`${styles.actionBtn} ${tenant.status === 'ACTIVE' ? styles.deactivateBtn : styles.activateBtn}`}
                        title={tenant.status === 'ACTIVE' ? 'Mark as Inactive' : 'Mark as Active'}
                      >
                        {tenant.status === 'ACTIVE' ? 'Mark Inactive' : 'Mark Active'}
                      </button>
                      
                      {tenant.status === 'INACTIVE' && (
                        <button 
                          onClick={() => handleDeleteTenant(tenant.id, tenant.name)}
                          className={`${styles.actionBtn} ${styles.deleteBtn}`}
                          title="Permanently Delete Organization"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {tenants.length === 0 && !isLoading && (
                <tr>
                  <td colSpan="6" className={styles.emptyState}>No tenants found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {tenants.length > 0 && totalPages > 1 && (
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => dispatch(loadTenants({ page, size: 10 }))}
          />
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
