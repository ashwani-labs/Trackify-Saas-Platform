import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createProject } from '../../features/projects/projectSlice';
import { X, Briefcase, Key, Database, Loader2 } from 'lucide-react';

const CreateProjectModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.projects);
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
    category: 'Software'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'name' && !formData.key ? { key: value.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '') } : {})
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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.25rem' }}>Create New Project</h2>
          <button className="theme-toggle" onClick={onClose} style={{ width: '32px', height: '32px' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <form id="create-project-form" onSubmit={handleSubmit}>
            {error && (
              <div className="badge badge-danger" style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
                {error}
              </div>
            )}
            
            <div className="form-group">
              <label className="form-label" htmlFor="name">Project Name *</label>
              <div style={{ position: 'relative' }}>
                <Briefcase style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
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
              <label className="form-label" htmlFor="key">Project Key *</label>
              <div style={{ position: 'relative' }}>
                <Key style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
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
              <small style={{ display: 'block', marginTop: '0.4rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                Used as a prefix for issue IDs (e.g. APO-123).
              </small>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="category">Category</label>
              <div style={{ position: 'relative' }}>
                <Database style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
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
              <label className="form-label" htmlFor="description">Description (optional)</label>
              <textarea
                id="description"
                name="description"
                className="input-field"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Briefly describe the project goals..."
                style={{ resize: 'vertical' }}
              ></textarea>
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button 
            type="submit" 
            form="create-project-form"
            className="btn btn-primary" 
            disabled={isLoading}
            style={{ minWidth: '140px' }}
          >
            {isLoading ? <Loader2 size={18} style={{ animation: 'loading 2s linear infinite' }} /> : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;
