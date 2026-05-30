import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPendingUsers, updateUserStatus } from '../features/users/userSlice';
import Pagination from '../components/common/Pagination';
import { Clock, Mail, RefreshCw, ShieldCheck } from 'lucide-react';
import { PageHeader, Button, Badge, Alert, EmptyState } from '@trackify/shared';

const UserApprovalPage = () => {
  const dispatch = useDispatch();
  const { tenantId } = useSelector((state) => state.auth);
  const { pendingUsers, currentPage, totalPages, isLoading, error } = useSelector(
    (state) => state.users
  );

  useEffect(() => {
    if (tenantId) {
      dispatch(fetchPendingUsers({ tenantId, page: 0, size: 10 }));
    }
  }, [dispatch, tenantId]);

  const handleAction = (userId, status) => {
    const actionText = status === 'ACTIVE' ? 'approve' : 'reject';
    if (window.confirm(`Are you sure you want to ${actionText} this user?`)) {
      dispatch(updateUserStatus({ tenantId, userId, status }));
    }
  };

  return (
    <div className="page">
      <PageHeader
        breadcrumb={
          <>
            Administration / <strong>User Approvals</strong>
          </>
        }
        title="Access Requests"
        subtitle="Review and manage requests from users trying to join your workspace."
        actions={
          <Button
            variant="ghost"
            className="icon-btn"
            aria-label="Refresh pending requests"
            isLoading={isLoading}
            onClick={() => dispatch(fetchPendingUsers({ tenantId, page: currentPage, size: 10 }))}
            leftIcon={!isLoading ? <RefreshCw size={16} /> : null}
          />
        }
      />

      {error && (
        <Alert variant="danger" className="page-alert">
          {error}
        </Alert>
      )}

      <div className="approval-list">
        {isLoading && pendingUsers.length === 0 ? (
          [...Array(3)].map((_, i) => (
            <div key={`skel-${i}`} className="card skeleton skeleton-card" />
          ))
        ) : (
          pendingUsers.map((user) => (
            <div key={user.id} className="card approval-card">
              <div className="approval-card__user">
                <div className="avatar-lg avatar-lg--muted" aria-hidden>
                  {user.fullName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="approval-card__name">{user.fullName}</h3>
                  <div className="approval-card__meta">
                    <span className="meta-inline">
                      <Mail size={12} aria-hidden /> {user.email}
                    </span>
                    <span className="meta-inline">
                      <Clock size={12} aria-hidden /> Requested{' '}
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                    <Badge variant="warning">PENDING</Badge>
                  </div>
                </div>
              </div>

              <div className="approval-card__actions">
                <Button
                  variant="secondary"
                  className="btn--danger-text"
                  onClick={() => handleAction(user.id, 'INACTIVE')}
                >
                  Reject
                </Button>
                <Button onClick={() => handleAction(user.id, 'ACTIVE')}>Approve Access</Button>
              </div>
            </div>
          ))
        )}

        {pendingUsers.length === 0 && !isLoading && (
          <EmptyState
            icon={
              <div className="empty-state__icon empty-state__icon--success">
                <ShieldCheck size={48} />
              </div>
            }
            title="All requests handled"
            description="There are no pending user requests at the moment. You'll see new sign-ups here for approval."
          />
        )}

        {pendingUsers.length > 0 && totalPages > 1 && (
          <div className="page-pagination">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => dispatch(fetchPendingUsers({ tenantId, page, size: 10 }))}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserApprovalPage;
