import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createIssue } from '../../features/issues/issueSlice';
import styles from './CreateIssueModal.module.css';

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
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2>Create Issue</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Title */}
          <div className={styles.formGroup}>
            <label htmlFor="issue-title">Issue title *</label>
            <input
              id="issue-title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="What needs to be done?"
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div className={styles.formGroup}>
            <label htmlFor="issue-desc">Description</label>
            <textarea
              id="issue-desc"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Add more detail about this issue..."
            />
          </div>

          {/* Priority + Status Row */}
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label htmlFor="issue-priority">Priority</label>
              <select
                id="issue-priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="HIGH">🔴 High</option>
                <option value="MEDIUM">🟡 Medium</option>
                <option value="LOW">🔵 Low</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="issue-status">Initial Status</label>
              <select
                id="issue-status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={isLoading}>
              {isLoading ? 'Creating…' : 'Create Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateIssueModal;
