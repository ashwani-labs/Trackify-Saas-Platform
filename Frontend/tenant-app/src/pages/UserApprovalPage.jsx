import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPendingUsers, updateUserStatus } from '../features/users/userSlice';
import Pagination from '../components/common/Pagination';
import { UserCheck, UserX, Clock, User, Mail, RefreshCw, ShieldAlert } from 'lucide-react';

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
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <header className="hero-section">
        <div>
          <h1 className="hero-title">User Approvals</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage pending access requests for your workspace.</p>
        </div>
        <button
          className="theme-toggle"
          onClick={() => dispatch(fetchPendingUsers({ tenantId, page: currentPage, size: 10 }))}
          disabled={isLoading}
        >
          <RefreshCw size={20} style={{ animation: isLoading ? 'loading 2s linear infinite' : 'none' }} />
        </button>
      </header>

      {error && <div className="badge badge-danger" style={{ width: '100%', padding: '1rem', marginBottom: '2rem' }}>{error}</div>}

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {pendingUsers.map((user) => (
          <div key={user.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: '50%', 
                background: 'var(--bg-input)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'var(--primary)'
              }}>
                <User size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{user.fullName}</h3>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Mail size={14} /> {user.email}
                  </span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={14} /> Requested {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-secondary" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleAction(user.id, 'INACTIVE')}>
                <UserX size={18} /> Reject
              </button>
              <button className="btn btn-primary" onClick={() => handleAction(user.id, 'ACTIVE')}>
                <UserCheck size={18} /> Approve
              </button>
            </div>
          </div>
        ))}

        {pendingUsers.length === 0 && !isLoading && (
          <div className="card" style={{ textAlign: 'center', padding: '5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ background: 'var(--bg-input)', padding: '2rem', borderRadius: '50%', color: 'var(--success)' }}>
              <ShieldCheck size={48} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>All caught up!</h2>
              <p style={{ color: 'var(--text-muted)' }}>There are no pending user requests at the moment.</p>
            </div>
          </div>
        )}

        {pendingUsers.length > 0 && totalPages > 1 && (
          <div style={{ marginTop: '2rem' }}>
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
