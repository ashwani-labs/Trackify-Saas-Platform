import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPendingUsers, updateUserStatus } from '../features/users/userSlice';
import Pagination from '../components/common/Pagination';
import { UserCheck, UserX, Clock, User, Mail, RefreshCw, ShieldCheck } from 'lucide-react';

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
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <nav style={{ marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        Administration / <span style={{ color: 'var(--text-main)' }}>User Approvals</span>
      </nav>

      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.25rem' }}>Access Requests</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Review and manage requests from users trying to join your workspace.
          </p>
        </div>
        <button
          className="theme-toggle"
          onClick={() => dispatch(fetchPendingUsers({ tenantId, page: currentPage, size: 10 }))}
          disabled={isLoading}
          style={{ width: '32px', height: '32px' }}
        >
          <RefreshCw
            size={16}
            style={{ animation: isLoading ? 'loading 2s linear infinite' : 'none' }}
          />
        </button>
      </header>

      {error && (
        <div
          style={{ padding: '1rem', marginBottom: '2rem', backgroundColor: '#FFEBE6', color: '#BF2600', borderRadius: '3px', fontSize: '0.875rem', border: '1px solid #FFBDAD' }}
        >
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gap: '1rem' }}>
        {isLoading && pendingUsers.length === 0 ? (
          [...Array(3)].map((_, i) => (
            <div key={`skel-${i}`} className="card skeleton" style={{ height: '100px' }} />
          ))
        ) : (
          <>
            {pendingUsers.map((user) => (
              <div
                key={user.id}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.25rem 1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#F4F5F7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#42526E',
                      fontSize: '1rem',
                      fontWeight: '700'
                    }}
                  >
                    {user.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.25rem' }}>{user.fullName}</h3>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                        }}
                      >
                        <Mail size={12} /> {user.email}
                      </span>
                      <span
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                        }}
                      >
                        <Clock size={12} /> Requested {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    className="btn btn-secondary"
                    style={{ height: '32px', fontSize: '0.875rem', color: '#BF2600' }}
                    onClick={() => handleAction(user.id, 'INACTIVE')}
                  >
                    Reject
                  </button>
                  <button
                    className="btn btn-primary"
                    style={{ height: '32px', fontSize: '0.875rem' }}
                    onClick={() => handleAction(user.id, 'ACTIVE')}
                  >
                    Approve Access
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {pendingUsers.length === 0 && !isLoading && (
          <div
            className="card"
            style={{
              textAlign: 'center',
              padding: '6rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
              borderStyle: 'dashed'
            }}
          >
            <div
              style={{
                background: '#E3FCEF',
                padding: '1.5rem',
                borderRadius: '50%',
                color: '#36B37E',
              }}
            >
              <ShieldCheck size={48} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>All requests handled</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '400px', margin: '0 auto' }}>
                There are no pending user requests at the moment. You'll see new sign-ups here for approval.
              </p>
            </div>
          </div>
        )}

        {pendingUsers.length > 0 && totalPages > 1 && (
          <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-main)', paddingTop: '1rem' }}>
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
