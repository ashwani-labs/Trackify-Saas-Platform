import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearSelectedIssue,
  fetchIssueComments,
  fetchIssueActivity,
  addComment,
  updateIssue,
  deleteIssue,
  addAttachment,
  deleteAttachment,
} from '../../features/issues/issueSlice';
import { useFocusTrap, useEscapeKey } from '@trackify/shared';
import {
  X,
  Edit2,
  Check,
  Trash2,
  Paperclip,
  MessageSquare,
  Download,
  FileText,
  Image as ImageIcon,
  Send,
  Loader2,
  Plus,
} from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

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

const IssueDetailPanel = () => {
  const dispatch = useDispatch();
  const panelRef = useRef(null);
  const { selectedIssue, comments, activity, isCommentLoading, isActivityLoading, isAttachmentLoading } =
    useSelector((s) => s.issues);

  const [commentText, setCommentText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: selectedIssue?.title || '',
    description: selectedIssue?.description || '',
    status: selectedIssue?.status || 'TODO',
    priority: selectedIssue?.priority || 'MEDIUM',
    sprintId: selectedIssue?.sprintId || '',
  });

  useEffect(() => {
    if (selectedIssue?.id) {
      dispatch(fetchIssueComments(selectedIssue.id));
      dispatch(fetchIssueActivity(selectedIssue.id));
    }
  }, [selectedIssue?.id, dispatch]);

  const handleClose = useCallback(() => dispatch(clearSelectedIssue()), [dispatch]);

  useFocusTrap(panelRef, Boolean(selectedIssue));
  useEscapeKey(Boolean(selectedIssue), handleClose);

  if (!selectedIssue) return null;

  const issueComments = comments[selectedIssue.id] || [];
  const issueActivity = activity[selectedIssue.id] || [];

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    dispatch(addComment({ issueId: selectedIssue.id, content: commentText }));
    setCommentText('');
  };

  const handleEditSave = () => {
    dispatch(
      updateIssue({
        id: selectedIssue.id,
        data: {
          ...editData,
          sprintId: editData.sprintId ? Number(editData.sprintId) : null,
          projectId: selectedIssue.projectId,
          assigneeId: selectedIssue.assigneeId,
        },
      })
    );
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

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-overlay"
        style={{ zIndex: 90 }}
        onClick={handleClose}
        role="presentation"
      />

      <aside
        ref={panelRef}
        key={selectedIssue.id}
        className="issue-detail-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="issue-detail-title"
      >
        <div className="issue-detail-panel__header">
          <span className="issue-detail-panel__key">
            {selectedIssue.issueKey ||
              `${selectedIssue.projectHeaderName}-${selectedIssue.id}`}
          </span>
          <div className="issue-detail-panel__actions">
            {!isEditing ? (
              <button
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                onClick={() => setIsEditing(true)}
              >
                <Edit2 size={14} /> Edit
              </button>
            ) : (
              <>
                <button
                  className="btn btn-primary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                  onClick={handleEditSave}
                >
                  <Check size={14} /> Save
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </>
            )}
            <button
              type="button"
              className="theme-toggle"
              onClick={handleDelete}
              style={{ color: 'var(--danger)' }}
              aria-label="Delete issue"
            >
              <Trash2 size={18} />
            </button>
            <button
              type="button"
              className="theme-toggle"
              onClick={handleClose}
              aria-label="Close issue details"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="issue-detail-panel__body">
          {/* Title */}
          {isEditing ? (
            <input
              className="input-field"
              style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}
              name="title"
              value={editData.title}
              onChange={handleEditChange}
            />
          ) : (
            <h2 id="issue-detail-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
              {selectedIssue.title}
            </h2>
          )}

          {/* Meta Grid */}
          <div className="issue-detail-panel__meta">
            <div>
              <label className="form-label">Status</label>
              {isEditing ? (
                <select
                  name="status"
                  value={editData.status}
                  onChange={handleEditChange}
                  className="input-field"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              ) : (
                <span
                  className={`badge badge-${selectedIssue.status === 'DONE' ? 'success' : selectedIssue.status === 'IN_PROGRESS' ? 'primary' : 'secondary'}`}
                >
                  {STATUS_LABELS[selectedIssue.status]}
                </span>
              )}
            </div>

            <div>
              <label className="form-label">Priority</label>
              {isEditing ? (
                <select
                  name="priority"
                  value={editData.priority}
                  onChange={handleEditChange}
                  className="input-field"
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              ) : (
                <span
                  className="badge"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color:
                      selectedIssue.priority === 'HIGH'
                        ? 'var(--danger)'
                        : selectedIssue.priority === 'MEDIUM'
                          ? 'var(--warning)'
                          : 'var(--success)',
                  }}
                >
                  {selectedIssue.priority}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h4
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <FileText size={16} /> Description
            </h4>
            {isEditing ? (
              <textarea
                name="description"
                value={editData.description}
                onChange={handleEditChange}
                className="input-field"
                rows="6"
                style={{ resize: 'vertical' }}
              />
            ) : (
              <p style={{ lineHeight: '1.6', color: 'var(--text-main)' }}>
                {selectedIssue.description || (
                  <em style={{ color: 'var(--text-muted)' }}>No description provided.</em>
                )}
              </p>
            )}
          </div>

          {/* Attachments */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h4
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Paperclip size={16} /> Attachments ({selectedIssue.attachments?.length || 0})
            </h4>

            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <input
                type="file"
                onChange={handleFileChange}
                style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer' }}
              />
              <div className="btn btn-secondary" style={{ width: '100%', borderStyle: 'dashed' }}>
                {isAttachmentLoading ? (
                  <Loader2 size={16} style={{ animation: 'loading 2s linear infinite' }} />
                ) : (
                  <Plus size={16} />
                )}{' '}
                Upload File
              </div>
            </div>

            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {selectedIssue.attachments?.map((a) => (
                <div
                  key={a.id}
                  className="card"
                  style={{
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {a.contentType?.startsWith('image/') ? (
                      <ImageIcon size={18} />
                    ) : (
                      <FileText size={18} />
                    )}
                    <div>
                      <div
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          maxWidth: '200px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {a.fileName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {formatBytes(a.fileSize)}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                      type="button"
                      className="theme-toggle"
                      style={{ width: '28px', height: '28px' }}
                      onClick={() =>
                        window.open(`${API_BASE_URL}/issues/attachments/${a.id}/download`, '_blank')
                      }
                      aria-label={`Download ${a.fileName}`}
                    >
                      <Download size={14} />
                    </button>
                    <button
                      type="button"
                      className="theme-toggle"
                      style={{ width: '28px', height: '28px', color: 'var(--danger)' }}
                      onClick={() =>
                        dispatch(
                          deleteAttachment({ issueId: selectedIssue.id, attachmentId: a.id })
                        )
                      }
                      aria-label={`Delete attachment ${a.fileName}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
                marginBottom: '0.75rem',
              }}
            >
              Activity
            </h4>
            {isActivityLoading && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Loading activity…</p>
            )}
            {!isActivityLoading && issueActivity.length === 0 && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No activity yet.</p>
            )}
            <ul className="activity-timeline" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {issueActivity.map((event) => (
                <li
                  key={event.id}
                  style={{
                    padding: '0.5rem 0',
                    borderBottom: '1px solid var(--border-main)',
                    fontSize: '0.8125rem',
                  }}
                >
                  <div style={{ color: 'var(--text-main)' }}>{event.summary}</div>
                  <div style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {event.createdAt ? new Date(event.createdAt).toLocaleString() : ''}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Comments */}
          <div style={{ marginBottom: '1rem' }}>
            <h4
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <MessageSquare size={16} /> Comments ({issueComments.length})
            </h4>

            <form onSubmit={handleCommentSubmit} style={{ marginBottom: '2rem' }}>
              <div style={{ position: 'relative' }}>
                <textarea
                  className="input-field"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment…"
                  rows="3"
                  style={{ paddingRight: '3.5rem' }}
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || isCommentLoading}
                  aria-label="Send comment"
                  style={{
                    position: 'absolute',
                    bottom: '0.75rem',
                    right: '0.75rem',
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.4rem',
                    cursor: 'pointer',
                  }}
                >
                  {isCommentLoading ? (
                    <Loader2 size={16} style={{ animation: 'loading 2s linear infinite' }} />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
            </form>

            <div style={{ display: 'grid', gap: '1.25rem' }}>
              {issueComments.map((c) => (
                <div
                  key={c.id}
                  style={{ borderBottom: '1px solid var(--border-main)', paddingBottom: '1.25rem' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>User #{c.userId}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>{c.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default IssueDetailPanel;
