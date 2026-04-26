import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createTenantAsync } from '../../features/tenants/tenantSlice';
import { X, Globe, Mail, Briefcase, Loader2 } from 'lucide-react';

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

  if (!isOpen) return null;

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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.25rem' }}>Provision New Organization</h2>
          <button
            className="theme-toggle"
            onClick={onClose}
            style={{ width: '32px', height: '32px' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <form id="create-tenant-form" onSubmit={handleSubmit}>
            {errors.form && (
              <div
                className="badge badge-danger"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  marginBottom: '1.5rem',
                  justifyContent: 'center',
                }}
              >
                {errors.form}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Organization Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Acme Corp"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {errors.name && (
                <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Tenant Domain Code</label>
              <div style={{ position: 'relative' }}>
                <Globe
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                  size={16}
                />
                <input
                  type="text"
                  className="input-field"
                  style={{ paddingLeft: '2.5rem', paddingRight: '7rem' }}
                  placeholder="acme"
                  value={formData.code}
                  onChange={(e) => {
                    const val = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '');
                    setFormData({ ...formData, code: val });
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem',
                  }}
                >
                  .trackify.io
                </span>
              </div>
              {errors.code && (
                <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.code}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Admin Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                  size={16}
                />
                <input
                  type="email"
                  className="input-field"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="admin@organization.com"
                  value={formData.adminEmail}
                  onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                />
              </div>
              {errors.adminEmail && (
                <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>
                  {errors.adminEmail}
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Company Display Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Acme Corporation"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Primary Color</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="color"
                    className="input-field"
                    style={{ width: '45px', padding: '2px', height: '42px' }}
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  />
                  <input
                    type="text"
                    className="input-field"
                    style={{ flex: 1 }}
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Company Logo URL</label>
              <input
                type="text"
                className="input-field"
                placeholder="https://example.com/logo.png"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                Paste a direct link to your organization's logo.
              </span>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Subscription Plan</label>
              <div style={{ position: 'relative' }}>
                <Briefcase
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                  size={16}
                />
                <select
                  className="input-field"
                  style={{ paddingLeft: '2.5rem', appearance: 'none' }}
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
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{ minWidth: '160px' }}
          >
            {isSubmitting ? (
              <Loader2 size={18} style={{ animation: 'loading 2s linear infinite' }} />
            ) : (
              'Provision Tenant'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTenantModal;
