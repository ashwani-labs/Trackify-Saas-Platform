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
  selectTenantError,
} from '../features/tenants/tenantSlice';
import CreateTenantModal from '../components/tenants/CreateTenantModal';
import Pagination from '../components/common/Pagination';
import { Globe, Activity, RefreshCw, Plus, Trash2 } from 'lucide-react';
import { PageHeader, Button, Badge, Alert, EmptyState } from '@trackify/shared';

const TenantManagementPage = () => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tenants = useSelector(selectAllTenants);
  const isLoading = useSelector(selectTenantLoading);
  const currentPage = useSelector(selectTenantCurrentPage);
  const totalPages = useSelector(selectTenantTotalPages);
  const error = useSelector(selectTenantError);

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
    <div className="page">
      <PageHeader
        breadcrumb={
          <>
            Administration / <strong>Tenants</strong>
          </>
        }
        title="Tenant Management"
        subtitle="Centralized control for all active organizations and infrastructure provisioning."
        actions={
          <Button leftIcon={<Plus size={16} />} onClick={() => setIsModalOpen(true)}>
            Create Tenant
          </Button>
        }
      />

      {error && <Alert className="page-alert">{error}</Alert>}

      <div className="stats-grid">
        <div className="stat-card stat-card--primary">
          <div className="stat-header stat-header--between">
            <span className="stat-label">Total Tenants</span>
            <Globe size={16} className="stat-card__icon--primary" aria-hidden />
          </div>
          <div className="stat-value">{tenants.length}</div>
        </div>
        <div className="stat-card stat-card--success">
          <div className="stat-header stat-header--between">
            <span className="stat-label">Active Workspaces</span>
            <Activity size={16} className="stat-card__icon--success" aria-hidden />
          </div>
          <div className="stat-value">{tenants.filter((t) => t.status === 'ACTIVE').length}</div>
        </div>
      </div>

      <div className="card card--flush">
        <div className="card-section-header">
          <h2 className="card-section-title">Organization List</h2>
          <Button
            variant="ghost"
            className="icon-btn"
            aria-label="Refresh tenant list"
            isLoading={isLoading}
            onClick={() => dispatch(loadTenants({ page: currentPage, size: 10 }))}
            leftIcon={!isLoading ? <RefreshCw size={16} /> : null}
          />
        </div>

        <div className="table-wrapper table-wrapper--embedded">
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
              {isLoading && tenants.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="skeleton" style={{ height: '200px', width: '100%' }} />
                  </td>
                </tr>
              ) : (
                tenants.map((tenant) => (
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
                    <Badge variant="primary">{tenant.plan}</Badge>
                  </td>
                  <td>
                    <Badge variant={tenant.status === 'ACTIVE' ? 'success' : 'danger'}>
                      {tenant.status}
                    </Badge>
                  </td>
                  <td className="member-email">
                    {new Date(tenant.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="table-actions">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleToggleStatus(tenant.id, tenant.status)}
                      >
                        {tenant.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </Button>

                      {tenant.status === 'INACTIVE' && (
                        <Button
                          variant="ghost"
                          className="icon-btn btn--danger-text"
                          aria-label={`Delete ${tenant.name}`}
                          onClick={() => handleDeleteTenant(tenant.id, tenant.name)}
                          leftIcon={<Trash2 size={14} />}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))
              )}
              {tenants.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      title="No tenants yet"
                      description="Create your first organization to get started."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {tenants.length > 0 && totalPages > 1 && (
          <div className="card-footer">
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
