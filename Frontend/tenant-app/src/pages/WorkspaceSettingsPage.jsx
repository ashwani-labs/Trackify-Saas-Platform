import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { PageHeader, Input, Button, Alert, Badge } from '@trackify/shared';
import { useFormFields } from '@trackify/shared';
import { updateWorkspaceBranding } from '../services/workspaceApi';
import { setWorkspaceBranding } from '../features/auth/authSlice';

const PLAN_LIMITS = {
  FREE: { users: 5, projects: 3, label: 'Free' },
  PRO: { users: 100, projects: 50, label: 'Pro' },
  ENTERPRISE: { users: 'Unlimited', projects: 'Unlimited', label: 'Enterprise' },
};

const validators = {
  companyName: (value) => (!value?.trim() ? 'Company name is required' : undefined),
  primaryColor: (value) =>
    value && !/^#[0-9A-Fa-f]{6}$/.test(value) ? 'Use a hex color like #2563eb' : undefined,
  logoUrl: (value) =>
    value?.trim() && !/^https?:\/\/.+/.test(value.trim())
      ? 'Enter a valid URL starting with http:// or https://'
      : undefined,
};

const WorkspaceSettingsPage = () => {
  const dispatch = useDispatch();
  const { tenantId, tenantDomain, tenantLogo, primaryColor, companyName, plan } = useSelector(
    (state) => state.auth
  );
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState(null);

  const { values, handleChange, handleBlur, validateAll, getFieldError, reset } = useFormFields(
    {
      companyName: companyName || '',
      logoUrl: tenantLogo || '',
      primaryColor: primaryColor || '#6366f1',
    },
    validators
  );

  useEffect(() => {
    reset({
      companyName: companyName || '',
      logoUrl: tenantLogo || '',
      primaryColor: primaryColor || '#6366f1',
    });
  }, [companyName, tenantLogo, primaryColor, reset]);

  const planInfo = PLAN_LIMITS[plan] || PLAN_LIMITS.FREE;

  const workspaceUrl = useMemo(
    () => (tenantDomain ? `https://${tenantDomain}.trackify.io` : ''),
    [tenantDomain]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll() || !tenantId) return;

    setSaving(true);
    setSaveError(null);
    try {
      const response = await updateWorkspaceBranding(tenantId, {
        companyName: values.companyName.trim(),
        logoUrl: values.logoUrl.trim(),
        primaryColor: values.primaryColor.trim(),
      });
      const data = response.data;
      dispatch(
        setWorkspaceBranding({
          companyName: data.companyName,
          logoUrl: data.logoUrl,
          primaryColor: data.primaryColor,
        })
      );
      toast.success('Workspace branding saved');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save workspace settings';
      setSaveError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <PageHeader
        breadcrumb={
          <>
            Administration / <strong>Workspace settings</strong>
          </>
        }
        title="Workspace settings"
        subtitle="Manage branding, plan limits, and workspace identity."
      />

      {saveError && <Alert className="page-alert">{saveError}</Alert>}

      <div className="stats-grid">
        <div className="stat-card stat-card--primary">
          <div className="stat-header">
            <span className="stat-label">Current plan</span>
          </div>
          <div className="stat-value" style={{ fontSize: '1.25rem' }}>
            <Badge variant="primary">{planInfo.label}</Badge>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">User seats</span>
          </div>
          <div className="stat-value">{planInfo.users}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Projects</span>
          </div>
          <div className="stat-value">{planInfo.projects}</div>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <form onSubmit={handleSubmit} className="workspace-settings-form">
          <Input
            id="companyName"
            name="companyName"
            label="Company name"
            value={values.companyName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={getFieldError('companyName')}
            required
          />
          <Input
            id="logoUrl"
            name="logoUrl"
            label="Logo URL"
            value={values.logoUrl}
            onChange={handleChange}
            onBlur={handleBlur}
            error={getFieldError('logoUrl')}
            placeholder="https://example.com/logo.png"
          />
          <Input
            id="primaryColor"
            name="primaryColor"
            label="Primary color"
            value={values.primaryColor}
            onChange={handleChange}
            onBlur={handleBlur}
            error={getFieldError('primaryColor')}
            placeholder="#2563eb"
          />
          <div className="workspace-settings-form__preview">
            <span
              className="tenant-detail-panel__swatch"
              style={{ backgroundColor: values.primaryColor }}
              aria-hidden
            />
            {values.logoUrl ? (
              <img src={values.logoUrl} alt="" className="tenant-detail-panel__logo" />
            ) : null}
          </div>
          {workspaceUrl && (
            <p className="form-hint">
              Workspace URL: <code>{workspaceUrl}</code>
            </p>
          )}
          <div className="workspace-settings-form__actions">
            <Button type="submit" isLoading={saving}>
              Save branding
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkspaceSettingsPage;
