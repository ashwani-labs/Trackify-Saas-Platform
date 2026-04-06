import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadTenants, toggleTenantStatus, selectAllTenants, selectTenantLoading } from '../features/tenants/tenantSlice';
import styles from './TenantManagementPage.module.css';
import { Users, Globe, Activity, ShieldCheck, ShieldAlert, RefreshCw, Plus } from 'lucide-react';

const TenantManagementPage = () => {
  const dispatch = useDispatch();
  const tenants = useSelector(selectAllTenants);
  const isLoading = useSelector(selectTenantLoading);

  useEffect(() => {
    dispatch(loadTenants());
  }, [dispatch]);

  const handleToggleStatus = (id, currentStatus) => {
    if (window.confirm(`Are you sure you want to ${currentStatus === 'ACTIVE' ? 'deactivate' : 'activate'} this tenant?`)) {
      dispatch(toggleTenantStatus({ id, currentStatus }));
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Tenant Management</h1>
          <p className={styles.subtitle}>View and manage all active organizations on the platform.</p>
        </div>
        <button className={styles.addBtn}>
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
          <button className={styles.refreshBtn} onClick={() => dispatch(loadTenants())} disabled={isLoading}>
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
                    <button 
                      onClick={() => handleToggleStatus(tenant.id, tenant.status)}
                      className={`${styles.actionBtn} ${tenant.status === 'ACTIVE' ? styles.deactivateBtn : styles.activateBtn}`}
                    >
                      {tenant.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </button>
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
      </div>
    </div>
  );
};

export default TenantManagementPage;
