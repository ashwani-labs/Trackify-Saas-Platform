import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createIssue } from '../../features/issues/issueSlice';
import { X } from 'lucide-react';

const CreateIssueModal = ({ isOpen, onClose, projectId }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.issues);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'TODO',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(createIssue({ ...formData, projectId }));
    if (createIssue.fulfilled.match(result)) {
      setFormData({ title: '', description: '', priority: 'MEDIUM', status: 'TODO' });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Issue</h2>
          <button className="theme-toggle" onClick={onClose} style={{ width: '32px', height: '32px' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="form-label" htmlFor="issue-title">Issue title *</label>
            <input
              id="issue-title"
              type="text"
              name="title"
              className="input-field"
              value={formData.title}
              onChange={handleChange}
              placeholder="What needs to be done?"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="issue-desc">Description</label>
            <textarea
              id="issue-desc"
              name="description"
              className="input-field"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Add more detail..."
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="issue-priority">Priority</label>
              <select
                id="issue-priority"
                name="priority"
                className="input-field"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="issue-status">Status</label>
              <select
                id="issue-status"
                name="status"
                className="input-field"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-footer" style={{ border: 'none', background: 'none' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Creating…' : 'Create Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateIssueModal;
