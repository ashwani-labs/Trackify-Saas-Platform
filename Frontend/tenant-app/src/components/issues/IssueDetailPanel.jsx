import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearSelectedIssue,
  fetchIssueComments,
  addComment,
  updateIssue,
  deleteIssue,
  addAttachment,
  deleteAttachment,
} from '../../features/issues/issueSlice';
import styles from './IssueDetailPanel.module.css';

const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const STATUS_OPTIONS = ['TODO', 'IN_PROGRESS', 'DONE'];
const PRIORITY_OPTIONS = ['HIGH', 'MEDIUM', 'LOW'];

const STATUS_LABELS = { TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' };
const PRIORITY_COLORS = {
  HIGH:   styles.prioHigh,
  MEDIUM: styles.prioMedium,
  LOW:    styles.prioLow,
};

const IssueDetailPanel = () => {
  const dispatch = useDispatch();
  const { selectedIssue, comments, isCommentLoading, isAttachmentLoading } = useSelector((s) => s.issues);

  const [commentText, setCommentText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  // Fetch comments when issue selected
  useEffect(() => {
    if (selectedIssue) {
      dispatch(fetchIssueComments(selectedIssue.id));
      setIsEditing(false);
      setEditData({
        title: selectedIssue.title,
        description: selectedIssue.description || '',
        status: selectedIssue.status,
        priority: selectedIssue.priority,
        sprintId: selectedIssue.sprintId || '',
      });
    }
  }, [selectedIssue?.id]);

  if (!selectedIssue) return null;

  const issueComments = comments[selectedIssue.id] || [];

  const handleClose = () => dispatch(clearSelectedIssue());

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    dispatch(addComment({ issueId: selectedIssue.id, content: commentText }));
    setCommentText('');
  };

  const handleEditSave = () => {
    dispatch(updateIssue({
      id: selectedIssue.id,
      data: {
        ...editData,
        sprintId: editData.sprintId ? Number(editData.sprintId) : null,
        projectId: selectedIssue.projectId,
        assigneeId: selectedIssue.assigneeId,
      },
    }));
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this issue?')) {
      dispatch(deleteIssue(selectedIssue.id));
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      dispatch(addAttachment({ issueId: selectedIssue.id, file }));
    }
  };

  const handleDeleteAttachment = (attachmentId) => {
    if (window.confirm('Delete this attachment?')) {
      dispatch(deleteAttachment({ issueId: selectedIssue.id, attachmentId }));
    }
  };

  const handleDownload = (attachmentId) => {
    window.open(`http://localhost:8080/issues/attachments/${attachmentId}/download`, '_blank');
  };

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={handleClose} />

      {/* Slide-in Panel */}
      <aside className={styles.panel}>
        {/* ── Panel Header ── */}
        <div className={styles.panelHeader}>
          <span className={styles.issueKey}>
            {selectedIssue.projectHeaderName}-{selectedIssue.id}
          </span>
          <div className={styles.headerActions}>
            {!isEditing ? (
              <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
                ✏️ Edit
              </button>
            ) : (
              <>
                <button className={styles.saveBtn} onClick={handleEditSave}>
                  ✓ Save
                </button>
                <button className={styles.cancelEditBtn} onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
              </>
            )}
            <button className={styles.deleteBtn} onClick={handleDelete}>🗑</button>
            <button className={styles.closeBtn} onClick={handleClose}>×</button>
          </div>
        </div>

        <div className={styles.body}>
          {/* ── Title ── */}
          {isEditing ? (
            <input
              className={styles.editTitle}
              name="title"
              value={editData.title}
              onChange={handleEditChange}
            />
          ) : (
            <h2 className={styles.title}>{selectedIssue.title}</h2>
          )}

          {/* ── Meta Row ── */}
          <div className={styles.metaRow}>
            {/* Status */}
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Status</span>
              {isEditing ? (
                <select
                  name="status"
                  value={editData.status}
                  onChange={handleEditChange}
                  className={styles.metaSelect}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              ) : (
                <span className={`${styles.statusBadge} ${styles[`status_${selectedIssue.status}`]}`}>
                  {STATUS_LABELS[selectedIssue.status]}
                </span>
              )}
            </div>

            {/* Priority */}
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Priority</span>
              {isEditing ? (
                <select
                  name="priority"
                  value={editData.priority}
                  onChange={handleEditChange}
                  className={styles.metaSelect}
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              ) : (
                <span className={`${styles.priorityBadge} ${PRIORITY_COLORS[selectedIssue.priority]}`}>
                  {selectedIssue.priority}
                </span>
              )}
            </div>

            {/* Reporter */}
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Reporter</span>
              <span className={styles.metaValue}>#{selectedIssue.reporterId}</span>
            </div>

            {/* Sprint */}
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Sprint</span>
              {isEditing ? (
                <input
                  type="number"
                  name="sprintId"
                  value={editData.sprintId}
                  onChange={handleEditChange}
                  placeholder="ID or empty"
                  className={styles.metaSelect}
                  style={{ width: '80px' }}
                />
              ) : (
                <span className={styles.metaValue}>
                  {selectedIssue.sprintId ? `Sprint ID: ${selectedIssue.sprintId}` : 'Backlog'}
                </span>
              )}
            </div>
          </div>

          {/* ── Description ── */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Description</h4>
            {isEditing ? (
              <textarea
                name="description"
                value={editData.description}
                onChange={handleEditChange}
                className={styles.editTextarea}
                rows="5"
                placeholder="Add a description..."
              />
            ) : (
              <p className={styles.description}>
                {selectedIssue.description || (
                  <em className={styles.noDesc}>No description provided.</em>
                )}
              </p>
            )}
          </div>

          {/* ── Attachments ── */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>
              Attachments ({selectedIssue.attachments?.length || 0})
            </h4>

            {/* Upload Zone */}
            <div className={styles.uploadZone}>
              {isAttachmentLoading ? (
                <div className={styles.uploadingOverlay}>
                  <div className="spinner-small" />
                  <span>Uploading...</span>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    className={styles.uploadZoneInput}
                    onChange={handleFileChange}
                    title=""
                  />
                  <div className={styles.uploadContent}>
                    <span className={styles.uploadIcon}>📁</span>
                    <span className={styles.uploadText}>Click to upload a file</span>
                    <span className={styles.uploadSubtext}>Max size: 10MB</span>
                  </div>
                </>
              )}
            </div>

            {/* Attachment List */}
            <div className={styles.attachmentList}>
              {!selectedIssue.attachments || selectedIssue.attachments.length === 0 ? (
                <p className={styles.noAttachments}>No attachments yet.</p>
              ) : (
                selectedIssue.attachments.map((a) => (
                  <div key={a.id} className={styles.attachmentItem}>
                    <div className={styles.fileIcon}>
                      {a.contentType?.startsWith('image/') ? '🖼️' : '📄'}
                    </div>
                    <div className={styles.fileInfo}>
                      <span className={styles.fileNameLabel} title={a.fileName}>
                        {a.fileName}
                      </span>
                      <span className={styles.fileMeta}>
                        {formatBytes(a.fileSize)} • {new Date(a.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className={styles.fileActions}>
                      <button 
                        className={styles.downloadBtn} 
                        onClick={() => handleDownload(a.id)}
                        title="Download"
                      >
                        ⬇️
                      </button>
                      <button 
                        className={styles.removeAttachmentBtn} 
                        onClick={() => handleDeleteAttachment(a.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── Comments ── */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>
              Comments ({issueComments.length})
            </h4>

            {/* Add Comment */}
            <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
              <textarea
                className={styles.commentInput}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment…"
                rows="2"
              />
              <button
                type="submit"
                className={styles.commentSubmitBtn}
                disabled={!commentText.trim() || isCommentLoading}
              >
                {isCommentLoading ? 'Posting…' : 'Post Comment'}
              </button>
            </form>

            {/* Comment List */}
            <div className={styles.commentList}>
              {issueComments.length === 0 ? (
                <p className={styles.noComments}>No comments yet. Be the first!</p>
              ) : (
                issueComments.map((c) => (
                  <div key={c.id} className={styles.commentItem}>
                    <div className={styles.commentMeta}>
                      <span className={styles.commentAuthor}>User #{c.userId}</span>
                      <span className={styles.commentTime}>
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className={styles.commentContent}>{c.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default IssueDetailPanel;
