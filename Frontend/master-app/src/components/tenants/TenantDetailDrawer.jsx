import React, { useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  X,
  Copy,
  Database,
  Users,
  Palette,
  ExternalLink,
  Globe,
  Calendar,
  Trash2,
} from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  useFocusTrap,
  useEscapeKey,
} from '@trackify/shared';
import {
  clearSelectedTenant,
  selectSelectedTenant,
  selectDetailTenantId,
  selectTenantDetailLoading,
  selectTenantDetailError,
  loadTenantDetail,
} from '../../features/tenants/tenantSlice';

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const statusVariant = (status) => {
  if (status === 'ACTIVE') return 'success';
  if (status === 'SUSPENDED') return 'warning';
  return 'danger';
};

const DetailField = ({ label, children }) => (
  <div className="tenant-detail-panel__field">
    <span className="tenant-detail-panel__field-label">{label}</span>
    <div className="tenant-detail-panel__field-value">{children}</div>
  </div>
);

const TenantDetailDrawer = ({ onToggleStatus, onDelete }) => {
  const dispatch = useDispatch();
  const panelRef = useRef(null);
  const tenant = useSelector(selectSelectedTenant);
  const detailTenantId = useSelector(selectDetailTenantId);
  const isLoading = useSelector(selectTenantDetailLoading);
  const error = useSelector(selectTenantDetailError);

  const isOpen = Boolean(detailTenantId);
  const workspaceUrl = tenant?.domain ? `https://${tenant.domain}.trackify.io` : null;

  const handleClose = useCallback(() => dispatch(clearSelectedTenant()), [dispatch]);

  useFocusTrap(panelRef, isOpen);
  useEscapeKey(isOpen, handleClose);

  const handleCopyUrl = async () => {
    if (!workspaceUrl) return;
    try {
      await navigator.clipboard.writeText(workspaceUrl);
      toast.success('Workspace URL copied');
    } catch {
      toast.error('Could not copy URL');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="modal-overlay"
        style={{ zIndex: 90 }}
        onClick={handleClose}
        role="presentation"
      />

      <aside
        ref={panelRef}
        className="issue-detail-panel tenant-detail-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tenant-detail-title"
        aria-busy={isLoading}
      >
        <div className="issue-detail-panel__sticky">
          <div className="issue-detail-panel__header">
            <Badge variant={tenant ? statusVariant(tenant.status) : 'primary'}>
              {tenant?.status || 'Loading'}
            </Badge>
            <div className="issue-detail-panel__actions">
              <button
                type="button"
                className="btn btn-secondary icon-btn"
                aria-label="Close tenant details"
                onClick={handleClose}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="issue-detail-panel__title-wrap">
            <h2 id="tenant-detail-title" className="issue-detail-panel__title">
              {isLoading ? 'Loading organization…' : tenant?.name}
            </h2>
            {tenant?.companyName && tenant.companyName !== tenant.name && (
              <p className="tenant-detail-panel__subtitle">{tenant.companyName}</p>
            )}
          </div>
        </div>

        <div className="issue-detail-panel__body">
          {error && (
            <Alert className="tenant-detail-panel__alert">
              {error}
              <Button
                variant="secondary"
                size="sm"
                className="tenant-detail-panel__retry"
                onClick={() => dispatch(loadTenantDetail(detailTenantId))}
              >
                Retry
              </Button>
            </Alert>
          )}

          {isLoading && (
            <div className="tenant-detail-panel__skeleton" aria-hidden>
              <div className="skeleton" style={{ height: '120px', marginBottom: '1.5rem' }} />
              <div className="skeleton" style={{ height: '80px', marginBottom: '1.5rem' }} />
              <div className="skeleton" style={{ height: '160px' }} />
            </div>
          )}

          {!isLoading && tenant && (
            <>
              <div className="issue-detail-panel__section">
                <h3 className="issue-detail-panel__section-title">
                  <Globe size={16} aria-hidden />
                  Overview
                </h3>
                <div className="tenant-detail-panel__grid">
                  <DetailField label="Domain">
                    <code className="domain-code">{tenant.domain}.trackify.io</code>
                  </DetailField>
                  <DetailField label="Plan">
                    <Badge variant="primary">{tenant.plan}</Badge>
                  </DetailField>
                  <DetailField label="Workspace URL">
                    <div className="tenant-detail-panel__copy-row">
                      <a
                        href={workspaceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tenant-detail-panel__link"
                      >
                        {workspaceUrl}
                        <ExternalLink size={14} aria-hidden />
                      </a>
                      <button
                        type="button"
                        className="btn btn-secondary icon-btn"
                        aria-label="Copy workspace URL"
                        onClick={handleCopyUrl}
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </DetailField>
                  <DetailField label="Created">
                    <span className="tenant-detail-panel__date">
                      <Calendar size={14} aria-hidden />
                      {formatDate(tenant.createdAt)}
                    </span>
                  </DetailField>
                  <DetailField label="Last updated">
                    <span className="tenant-detail-panel__date">
                      <Calendar size={14} aria-hidden />
                      {formatDate(tenant.updatedAt)}
                    </span>
                  </DetailField>
                </div>
              </div>

              <div className="issue-detail-panel__section">
                <h3 className="issue-detail-panel__section-title">
                  <Palette size={16} aria-hidden />
                  Branding
                </h3>
                <div className="tenant-detail-panel__brand">
                  {tenant.logoUrl ? (
                    <img
                      src={tenant.logoUrl}
                      alt={`${tenant.name} logo`}
                      className="tenant-detail-panel__logo"
                    />
                  ) : (
                    <div className="tenant-detail-panel__logo tenant-detail-panel__logo--placeholder">
                      {tenant.name.charAt(0)}
                    </div>
                  )}
                  <div className="tenant-detail-panel__brand-meta">
                    <DetailField label="Company name">
                      {tenant.companyName || tenant.name}
                    </DetailField>
                    <DetailField label="Primary color">
                      {tenant.primaryColor ? (
                        <span className="tenant-detail-panel__color">
                          <span
                            className="tenant-detail-panel__swatch"
                            style={{ backgroundColor: tenant.primaryColor }}
                            aria-hidden
                          />
                          <code>{tenant.primaryColor}</code>
                        </span>
                      ) : (
                        <span className="issue-detail-panel__empty">Not set</span>
                      )}
                    </DetailField>
                  </div>
                </div>
              </div>

              <div className="issue-detail-panel__section">
                <h3 className="issue-detail-panel__section-title">
                  <Database size={16} aria-hidden />
                  Infrastructure
                </h3>
                <div className="tenant-detail-panel__grid">
                  <DetailField label="Database">
                    <code>{tenant.dbName || '—'}</code>
                  </DetailField>
                  <DetailField label="Host">
                    <code>{tenant.dbHost || '—'}</code>
                  </DetailField>
                  <DetailField label="Port">
                    <code>{tenant.dbPort ?? '—'}</code>
                  </DetailField>
                </div>
              </div>

              <div className="issue-detail-panel__section">
                <h3 className="issue-detail-panel__section-title">
                  <Users size={16} aria-hidden />
                  Usage
                </h3>
                <div className="tenant-detail-panel__stats">
                  <div className="tenant-detail-panel__stat">
                    <span className="tenant-detail-panel__stat-value">
                      {tenant.totalUsers ?? 0}
                    </span>
                    <span className="tenant-detail-panel__stat-label">Total users</span>
                  </div>
                  <div className="tenant-detail-panel__stat">
                    <span className="tenant-detail-panel__stat-value">
                      {tenant.activeUsers ?? 0}
                    </span>
                    <span className="tenant-detail-panel__stat-label">Active</span>
                  </div>
                  <div className="tenant-detail-panel__stat">
                    <span className="tenant-detail-panel__stat-value">
                      {tenant.pendingUsers ?? 0}
                    </span>
                    <span className="tenant-detail-panel__stat-label">Pending</span>
                  </div>
                </div>
              </div>

              <div className="tenant-detail-panel__footer">
                <Button
                  variant="secondary"
                  onClick={() => onToggleStatus(tenant.id, tenant.status, tenant.name)}
                >
                  {tenant.status === 'ACTIVE' ? 'Suspend organization' : 'Activate organization'}
                </Button>
                {tenant.status === 'INACTIVE' && (
                  <Button
                    variant="ghost"
                    className="btn--danger-text"
                    leftIcon={<Trash2 size={14} />}
                    onClick={() => onDelete(tenant.id, tenant.name)}
                  >
                    Delete permanently
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
};

export default TenantDetailDrawer;
