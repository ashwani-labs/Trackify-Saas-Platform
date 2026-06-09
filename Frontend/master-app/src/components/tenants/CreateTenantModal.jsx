import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createTenantAsync } from '../../features/tenants/tenantSlice';
import { Globe, Mail, Briefcase } from 'lucide-react';
import { Alert, Button, Input, Modal } from '@trackify/shared';

const CreateTenantModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    adminEmail: '',
    plan: 'FREE',
    companyName: '',
    logoUrl: '',
    primaryColor: '#6366f1',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Organization name is required';
    if (!formData.code.trim()) {
      newErrors.code = 'Domain code is required';
    } else if (!/^[a-z0-9]+$/.test(formData.code)) {
      newErrors.code = 'Use lowercase letters and numbers only';
    }
    if (!formData.adminEmail.trim()) {
      newErrors.adminEmail = 'Admin email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.adminEmail)) {
      newErrors.adminEmail = 'Invalid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await dispatch(createTenantAsync(formData)).unwrap();
      onClose();
    } catch (err) {
      setErrors({ form: err || 'Failed to create tenant' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Provision New Organization"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="create-tenant-form" isLoading={isSubmitting}>
            Provision Tenant
          </Button>
        </>
      }
    >
      <form id="create-tenant-form" className="form-stack" onSubmit={handleSubmit}>
        {errors.form && (
          <Alert variant="danger" center>
            {errors.form}
          </Alert>
        )}

        <Input
          id="tenant-name"
          label="Organization name"
          placeholder="e.g. Acme Corp"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
        />

        <div className="form-group">
          <label className="form-label" htmlFor="tenant-code">
            Tenant domain code
          </label>
          <div className="input-wrap">
            <Globe className="input-wrap__icon" size={16} aria-hidden />
            <input
              id="tenant-code"
              type="text"
              className="input input--with-icon input--domain"
              placeholder="acme"
              value={formData.code}
              onChange={(e) => {
                const val = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '');
                setFormData({ ...formData, code: val });
              }}
            />
            <span className="input-suffix">.trackify.io</span>
          </div>
          {errors.code && <span className="field-error">{errors.code}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="tenant-admin-email">
            Admin email address
          </label>
          <div className="input-wrap">
            <Mail className="input-wrap__icon" size={16} aria-hidden />
            <input
              id="tenant-admin-email"
              type="email"
              className="input input--with-icon"
              placeholder="admin@organization.com"
              value={formData.adminEmail}
              onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
            />
          </div>
          {errors.adminEmail && <span className="field-error">{errors.adminEmail}</span>}
        </div>

        <div className="form-grid-2">
          <Input
            id="tenant-company"
            label="Company display name"
            placeholder="e.g. Acme Corporation"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          />

          <div className="form-group">
            <label className="form-label" htmlFor="tenant-color">
              Primary color
            </label>
            <div className="color-input-row">
              <input
                id="tenant-color"
                type="color"
                className="input"
                value={formData.primaryColor}
                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
              />
              <input
                type="text"
                className="input input--flex"
                value={formData.primaryColor}
                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
              />
            </div>
          </div>
        </div>

        <Input
          id="tenant-logo"
          label="Company logo URL"
          placeholder="https://example.com/logo.png"
          value={formData.logoUrl}
          onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
        />
        <span className="field-hint--sm">
          Paste a direct link to your organization&apos;s logo.
        </span>

        <div className="form-group">
          <label className="form-label" htmlFor="tenant-plan">
            Subscription plan
          </label>
          <div className="input-wrap">
            <Briefcase className="input-wrap__icon" size={16} aria-hidden />
            <select
              id="tenant-plan"
              className="input select-input"
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
            >
              <option value="FREE">Free Tier</option>
              <option value="PREMIUM">Premium Tier</option>
              <option value="ENTERPRISE">Enterprise Tier</option>
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTenantModal;
