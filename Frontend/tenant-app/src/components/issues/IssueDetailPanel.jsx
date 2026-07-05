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
import IssueActivityTimeline from './IssueActivityTimeline';
import { useFocusTrap, useEscapeKey, useConfirmDialog } from '@trackify/shared';
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
  Activity,
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

const PANEL_TABS = [
  { id: 'DETAILS', label: 'Details', icon: FileText },
  { id: 'ACTIVITY', label: 'Activity', icon: Activity },
  { id: 'COMMENTS', label: 'Comments', icon: MessageSquare },
];

const IssueDetailPanel = () => {
  const { selectedIssue } = useSelector((s) => s.issues);
  if (!selectedIssue) return null;
  return <IssueDetailPanelContent key={selectedIssue.id} issue={selectedIssue} />;
};

const IssueDetailPanelContent = ({ issue: selectedIssue }) => {
  const dispatch = useDispatch();
  const panelRef = useRef(null);
  const { confirm, dialog } = useConfirmDialog();
  const { comments, activity, isCommentLoading, isActivityLoading, isAttachmentLoading } =
    useSelector((s) => s.issues);

  const [activeTab, setActiveTab] = useState('DETAILS');
  const [commentText, setCommentText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: selectedIssue.title || '',
    description: selectedIssue.description || '',
    status: selectedIssue.status || 'TODO',
    priority: selectedIssue.priority || 'MEDIUM',
    sprintId: selectedIssue.sprintId || '',
  });

  useEffect(() => {
    dispatch(fetchIssueComments(selectedIssue.id));
    dispatch(fetchIssueActivity(selectedIssue.id));
  }, [selectedIssue.id, dispatch]);

  const handleClose = useCallback(() => dispatch(clearSelectedIssue()), [dispatch]);

  useFocusTrap(panelRef, true);
  useEscapeKey(true, handleClose);

  const issueComments = comments[selectedIssue.id] || [];
  const issueActivity = activity[selectedIssue.id] || [];
  const issueKey =
    selectedIssue.issueKey || `${selectedIssue.projectHeaderName}-${selectedIssue.id}`;

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    dispatch(addComment({ issueId: selectedIssue.id, content: commentText }))
      .unwrap()
      .then(() => dispatch(fetchIssueActivity(selectedIssue.id)))
      .catch(() => {});
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
    )
      .unwrap()
      .then(() => dispatch(fetchIssueActivity(selectedIssue.id)))
      .catch(() => {});
    setIsEditing(false);
  };

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete issue?',
      message: `Permanently delete "${selectedIssue.title}"? This cannot be undone.`,
      confirmLabel: 'Delete issue',
      variant: 'danger',
    });
    if (confirmed) {
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
      {dialog}
      <div
        className="modal-overlay"
        style={{ zIndex: 90 }}
        onClick={handleClose}
        role="presentation"
      />

      <aside
        ref={panelRef}
        className="issue-detail-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="issue-detail-title"
      >
        <div className="issue-detail-panel__sticky">
          <div className="issue-detail-panel__header">
            <span className="issue-detail-panel__key">{issueKey}</span>
            <div className="issue-detail-panel__actions">
              {!isEditing ? (
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 size={14} /> Edit
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                    onClick={handleEditSave}
                  >
                    <Check size={14} /> Save
                  </button>
                  <button
                    type="button"
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

          <div className="issue-detail-panel__title-wrap">
            {isEditing ? (
              <input
                className="input issue-detail-panel__title-input"
                name="title"
                value={editData.title}
                onChange={handleEditChange}
                aria-label="Issue title"
              />
            ) : (
              <h2 id="issue-detail-title" className="issue-detail-panel__title">
                {selectedIssue.title}
              </h2>
            )}
          </div>

          <div className="tabs issue-detail-panel__tabs" role="tablist" aria-label="Issue sections">
            {PANEL_TABS.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={`tab ${activeTab === tab.id ? 'tab--active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <TabIcon size={16} aria-hidden />
                  {tab.label}
                  {tab.id === 'COMMENTS' && issueComments.length > 0 && (
                    <span className="issue-detail-panel__tab-count">{issueComments.length}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="issue-detail-panel__body">
          {activeTab === 'DETAILS' && (
            <div role="tabpanel" aria-label="Issue details">
              <div className="issue-detail-panel__meta">
                <div>
                  <label className="form-label">Status</label>
                  {isEditing ? (
                    <select
                      name="status"
                      value={editData.status}
                      onChange={handleEditChange}
                      className="input"
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
                      className="input"
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

              <div className="issue-detail-panel__section">
                <h4 className="issue-detail-panel__section-title">
                  <FileText size={16} aria-hidden /> Description
                </h4>
                {isEditing ? (
                  <textarea
                    name="description"
                    value={editData.description}
                    onChange={handleEditChange}
                    className="input textarea-input"
                    rows="6"
                  />
                ) : (
                  <p className="issue-detail-panel__description">
                    {selectedIssue.description || (
                      <em className="issue-detail-panel__empty">No description provided.</em>
                    )}
                  </p>
                )}
              </div>

              <div className="issue-detail-panel__section">
                <h4 className="issue-detail-panel__section-title">
                  <Paperclip size={16} aria-hidden /> Attachments (
                  {selectedIssue.attachments?.length || 0})
                </h4>

                <div className="issue-detail-panel__upload">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="issue-detail-panel__upload-input"
                    aria-label="Upload attachment"
                  />
                  <div className="btn btn-secondary issue-detail-panel__upload-btn">
                    {isAttachmentLoading ? (
                      <Loader2 size={16} className="btn-spinner" />
                    ) : (
                      <Plus size={16} />
                    )}{' '}
                    Upload File
                  </div>
                </div>

                <div className="issue-detail-panel__attachments">
                  {selectedIssue.attachments?.map((a) => (
                    <div key={a.id} className="card issue-detail-panel__attachment">
                      <div className="issue-detail-panel__attachment-main">
                        {a.contentType?.startsWith('image/') ? (
                          <ImageIcon size={18} aria-hidden />
                        ) : (
                          <FileText size={18} aria-hidden />
                        )}
                        <div>
                          <div className="issue-detail-panel__attachment-name">{a.fileName}</div>
                          <div className="issue-detail-panel__attachment-size">
                            {formatBytes(a.fileSize)}
                          </div>
                        </div>
                      </div>
                      <div className="issue-detail-panel__attachment-actions">
                        <button
                          type="button"
                          className="theme-toggle"
                          style={{ width: '28px', height: '28px' }}
                          onClick={() =>
                            window.open(
                              `${API_BASE_URL}/issues/attachments/${a.id}/download`,
                              '_blank'
                            )
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
            </div>
          )}

          {activeTab === 'ACTIVITY' && (
            <div role="tabpanel" aria-label="Issue activity">
              <IssueActivityTimeline events={issueActivity} isLoading={isActivityLoading} />
            </div>
          )}

          {activeTab === 'COMMENTS' && (
            <div role="tabpanel" aria-label="Issue comments">
              <form onSubmit={handleCommentSubmit} className="issue-detail-panel__comment-form">
                <div className="issue-detail-panel__comment-input-wrap">
                  <textarea
                    className="input textarea-input"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment…"
                    rows="3"
                    aria-label="Comment text"
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim() || isCommentLoading}
                    aria-label="Send comment"
                    className="issue-detail-panel__comment-send"
                  >
                    {isCommentLoading ? (
                      <Loader2 size={16} className="btn-spinner" />
                    ) : (
                      <Send size={16} />
                    )}
                  </button>
                </div>
              </form>

              <div className="issue-detail-panel__comments">
                {issueComments.length === 0 ? (
                  <p className="issue-detail-panel__empty">
                    No comments yet. Start the conversation.
                  </p>
                ) : (
                  issueComments.map((c) => (
                    <div key={c.id} className="issue-detail-panel__comment">
                      <div className="issue-detail-panel__comment-header">
                        <span className="issue-detail-panel__comment-author">User #{c.userId}</span>
                        <span className="issue-detail-panel__comment-date">
                          {new Date(c.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="issue-detail-panel__comment-body">{c.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default IssueDetailPanel;
