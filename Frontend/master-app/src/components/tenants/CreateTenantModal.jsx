import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createTenantAsync } from '../../features/tenants/tenantSlice';
import { X } from 'lucide-react';
import styles from './CreateTenantModal.module.css';

const CreateTenantModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    adminEmail: '',
    plan: 'FREE'
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
      newErrors.code = 'Domain code can only contain lowercase letters and numbers';
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
      setErrors({ form: err || 'Failed to create tenant. The domain might be taken.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Create Organization</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {errors.form && <div className={styles.errorText} style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>{errors.form}</div>}
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Organization Name</label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g. Acme Corp"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {errors.name && <span className={styles.errorText}>{errors.name}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Tenant Domain Code</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="text"
                className={styles.input}
                placeholder="acme"
                value={formData.code}
                onChange={(e) => {
                  const val = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '');
                  setFormData({ ...formData, code: val });
                }}
              />
              <span style={{ color: '#64748b', fontSize: '0.9rem' }}>.trackify.io</span>
            </div>
            {errors.code && <span className={styles.errorText}>{errors.code}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Admin Email</label>
            <input
              type="email"
              className={styles.input}
              placeholder="admin@acme.com"
              value={formData.adminEmail}
              onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
            />
            {errors.adminEmail && <span className={styles.errorText}>{errors.adminEmail}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Subscription Plan</label>
            <select
              className={styles.input}
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
            >
              <option value="FREE">Free</option>
              <option value="PREMIUM">Premium</option>
              <option value="ENTERPRISE">Enterprise</option>
            </select>
          </div>
        </form>

        <div className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="button" className={styles.submitBtn} onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Provisioning...' : 'Provision Tenant'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTenantModal;
