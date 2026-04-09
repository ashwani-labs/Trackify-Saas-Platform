import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPendingUsers, updateUserStatus } from '../features/users/userSlice';
import DashboardLayout from '../layouts/DashboardLayout';
import styles from './UserApprovalPage.module.css';
import Pagination from '../components/common/Pagination';
import { UserCheck, UserX, Clock, User, Mail, RefreshCw } from 'lucide-react';

const UserApprovalPage = () => {
  const dispatch = useDispatch();
  const { tenantId } = useSelector((state) => state.auth);
  const { pendingUsers, currentPage, totalPages, isLoading, error } = useSelector((state) => state.users);

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
    <DashboardLayout>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>User Approvals</h1>
            <p className={styles.subtitle}>Manage pending access requests for your workspace.</p>
          </div>
          <button 
            className={styles.refreshBtn} 
            onClick={() => dispatch(fetchPendingUsers({ tenantId, page: currentPage, size: 10 }))}
            disabled={isLoading}
          >
            <RefreshCw size={18} className={isLoading ? styles.spinning : ''} />
          </button>
        </header>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.list}>
          {pendingUsers.map((user) => (
            <div key={user.id} className={styles.userCard}>
              <div className={styles.userMain}>
                <div className={styles.avatar}>
                  <User size={24} />
                </div>
                <div className={styles.info}>
                  <h3 className={styles.userName}>{user.fullName}</h3>
                  <div className={styles.userMeta}>
                    <span className={styles.metaItem}>
                      <Mail size={14} />
                      {user.email}
                    </span>
                    <span className={styles.metaItem}>
                      <Clock size={14} />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.actions}>
                <button 
                  className={styles.rejectBtn}
                  onClick={() => handleAction(user.id, 'INACTIVE')}
                  title="Reject"
                >
                  <UserX size={18} />
                  Reject
                </button>
                <button 
                  className={styles.approveBtn}
                  onClick={() => handleAction(user.id, 'ACTIVE')}
                  title="Approve"
                >
                  <UserCheck size={18} />
                  Approve
                </button>
              </div>
            </div>
          ))}

          {pendingUsers.length === 0 && !isLoading && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <UserCheck size={48} />
              </div>
              <h3 className={styles.emptyTitle}>All caught up!</h3>
              <p className={styles.emptySubtitle}>There are no pending user requests at the moment.</p>
            </div>
          )}

          {pendingUsers.length > 0 && totalPages > 1 && (
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => dispatch(fetchPendingUsers({ tenantId, page, size: 10 }))}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserApprovalPage;
