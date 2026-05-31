import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createProject } from '../../features/projects/projectSlice';
import { Briefcase, Key, Database, Loader2 } from 'lucide-react';
import { Modal, Button, Alert } from '@trackify/shared';

const CreateProjectModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.projects);
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
    category: 'Software',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'name' && !formData.key
        ? {
            key: value
              .substring(0, 3)
              .toUpperCase()
              .replace(/[^A-Z]/g, ''),
          }
        : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(createProject(formData));
    if (createProject.fulfilled.match(resultAction)) {
      onClose();
      setFormData({ name: '', key: '', description: '', category: 'Software' });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Project"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" form="create-project-form" disabled={isLoading}>
            {isLoading ? (
              <Loader2 size={18} style={{ animation: 'loading 2s linear infinite' }} />
            ) : (
              'Create Project'
            )}
          </Button>
        </>
      }
    >
      <form id="create-project-form" onSubmit={handleSubmit}>
        {error && <Alert className="page-alert">{error}</Alert>}

        <div className="form-group">
          <label className="form-label" htmlFor="name">
            Project Name *
          </label>
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
              aria-hidden
            />
            <input
              type="text"
              id="name"
              name="name"
              className="input-field"
              style={{ paddingLeft: '2.5rem' }}
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Apollo Mission"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="key">
            Project Key *
          </label>
          <div style={{ position: 'relative' }}>
            <Key
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
              size={16}
              aria-hidden
            />
            <input
              type="text"
              id="key"
              name="key"
              className="input-field"
              style={{ paddingLeft: '2.5rem' }}
              value={formData.key}
              onChange={handleChange}
              placeholder="e.g. APO"
              required
              maxLength="10"
            />
          </div>
          <small className="form-hint">Used as a prefix for issue IDs (e.g. APO-123).</small>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="category">
            Category
          </label>
          <div style={{ position: 'relative' }}>
            <Database
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
              size={16}
              aria-hidden
            />
            <select
              id="category"
              name="category"
              className="input-field"
              style={{ paddingLeft: '2.5rem', appearance: 'none' }}
              value={formData.category}
              onChange={handleChange}
            >
              <option value="Software">Software Engineering</option>
              <option value="Business">Business Management</option>
              <option value="Marketing">Marketing & Growth</option>
              <option value="Finance">Finance & Operations</option>
            </select>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="description">
            Description (optional)
          </label>
          <textarea
            id="description"
            name="description"
            className="input-field"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            placeholder="Briefly describe the project goals..."
            style={{ resize: 'vertical' }}
          />
        </div>
      </form>
    </Modal>
  );
};

export default CreateProjectModal;
