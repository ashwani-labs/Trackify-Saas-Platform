import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers, updateUserStatus } from '../features/users/userSlice';
import Pagination from '../components/common/Pagination';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  ShieldCheck,
  Mail,
  Search,
  RefreshCw,
  UserPlus,
  X,
  User,
  Lock,
  Globe,
  Copy,
  Loader2,
} from 'lucide-react';
import { registerUser } from '../features/auth/authSlice';
import toast from 'react-hot-toast';

const STATUS_VARIANTS = {
  ACTIVE: 'success',
  PENDING: 'warning',
  INACTIVE: 'danger',
};

const TeamPage = () => {
  const dispatch = useDispatch();
  const { tenantId, tenantDomain } = useSelector((s) => s.auth);
  const { allUsers, allUsersPage, allUsersTotalPages, allUsersTotalElements, isLoading, error } =
    useSelector((s) => s.users);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [isAdding, setIsAdding] = useState(false);

  const tenantUrl = `http://${tenantDomain}.trackify.com:5174`;

  useEffect(() => {
    if (tenantId) dispatch(fetchAllUsers({ tenantId, page: 0, size: 10 }));
  }, [dispatch, tenantId]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const result = await dispatch(registerUser({ ...formData, tenantId, status: 'ACTIVE' }));
      if (registerUser.fulfilled.match(result)) {
        toast.success(`Invitation sent to ${formData.email}`);
        setIsModalOpen(false);
        setFormData({ fullName: '', email: '', password: '' });
        dispatch(fetchAllUsers({ tenantId, page: 0, size: 10 }));
      } else {
        toast.error(result.payload || 'Failed to add member');
      }
    } finally {
      setIsAdding(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const handleStatusChange = (userId, status) => {
    const label = status === 'ACTIVE' ? 'activate' : 'deactivate';
    if (window.confirm(`Are you sure you want to ${label} this user?`)) {
      dispatch(updateUserStatus({ tenantId, userId, status })).then(() => {
        dispatch(fetchAllUsers({ tenantId, page: allUsersPage, size: 10 }));
      });
    }
  };

  const filtered = search
    ? allUsers.filter(
        (u) =>
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          u.fullName?.toLowerCase().includes(search.toLowerCase())
      )
    : allUsers;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <nav style={{ marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        Administration / <span style={{ color: 'var(--text-main)' }}>Team</span>
      </nav>

      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.25rem' }}>
            Users and Permissions
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Manage who has access to this workspace and their respective roles.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="theme-toggle"
            onClick={() => dispatch(fetchAllUsers({ tenantId, page: allUsersPage, size: 10 }))}
            disabled={isLoading}
            style={{ width: '32px', height: '32px' }}
          >
            {isLoading ? (
              <Loader2 size={16} style={{ animation: 'loading 2s linear infinite' }} />
            ) : (
              <RefreshCw size={16} />
            )}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
            style={{ height: '32px' }}
          >
            <UserPlus size={16} /> Add Member
          </button>
        </div>
      </header>

      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          backgroundColor: '#EBECF0',
          border: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Globe style={{ color: 'var(--primary)' }} size={20} />
          <div style={{ fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>
              Self-registration Link:
            </span>
            <code style={{ marginLeft: '0.75rem', color: 'var(--primary)', fontWeight: '700' }}>
              {tenantUrl}/register
            </code>
          </div>
        </div>
        <button
          className="btn btn-secondary"
          style={{
            padding: '0.3rem 0.75rem',
            fontSize: '0.75rem',
            height: '24px',
            backgroundColor: 'white',
          }}
          onClick={() => copyToClipboard(`${tenantUrl}/register`, 'Link')}
        >
          <Copy size={12} /> Copy
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-main)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2
            style={{
              fontSize: '0.875rem',
              fontWeight: '700',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
            }}
          >
            Members ({allUsersTotalElements ?? 0})
          </h2>
          <div style={{ position: 'relative', width: '240px' }}>
            <Search
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
              size={14}
            />
            <input
              className="input-field"
              style={{ paddingLeft: '2.25rem', height: '32px', fontSize: '0.8rem' }}
              placeholder="Filter members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: '1rem',
              margin: '1rem',
              backgroundColor: '#FFEBE6',
              color: '#BF2600',
              borderRadius: '3px',
              fontSize: '0.8rem',
            }}
          >
            {error}
          </div>
        )}

        <div className="table-wrapper" style={{ border: 'none', marginTop: 0, borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: '35%' }}>Member</th>
                <th style={{ width: '15%' }}>Role</th>
                <th style={{ width: '15%' }}>Status</th>
                <th style={{ width: '20%' }}>Joined</th>
                <th style={{ width: '15%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && allUsers.length === 0 ? (
                [...Array(5)].map((_, i) => (
                  <tr key={`skel-${i}`}>
                    <td colSpan={5}>
                      <div className="skeleton" style={{ height: '40px', width: '100%' }} />
                    </td>
                  </tr>
                ))
              ) : (
                <>
                  {filtered.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: '#F4F5F7',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              color: '#42526E',
                            }}
                          >
                            {(u.fullName || u.email).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>
                              {u.fullName || '—'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: '#DEEBFF',
                            color: '#0052CC',
                            fontSize: '0.65rem',
                          }}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge badge-${STATUS_VARIANTS[u.status] || 'primary'}`}
                          style={{ fontSize: '0.65rem' }}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          {u.status !== 'ACTIVE' && u.role !== 'ADMIN' && (
                            <button
                              className="btn btn-secondary"
                              onClick={() => handleStatusChange(u.id, 'ACTIVE')}
                              style={{ height: '24px', fontSize: '0.7rem', padding: '0 0.5rem' }}
                            >
                              Activate
                            </button>
                          )}
                          {u.status === 'ACTIVE' && u.role !== 'ADMIN' && (
                            <button
                              className="btn btn-secondary"
                              onClick={() => handleStatusChange(u.id, 'INACTIVE')}
                              style={{
                                height: '24px',
                                fontSize: '0.7rem',
                                padding: '0 0.5rem',
                                color: 'var(--danger)',
                              }}
                            >
                              Deactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && !isLoading && (
                    <tr>
                      <td
                        colSpan={5}
                        style={{
                          textAlign: 'center',
                          padding: '4rem',
                          color: 'var(--text-muted)',
                          fontSize: '0.875rem',
                        }}
                      >
                        No team members found.
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        {allUsersTotalPages > 1 && (
          <div style={{ padding: '1rem', borderTop: '1px solid var(--border-main)' }}>
            <Pagination
              currentPage={allUsersPage}
              totalPages={allUsersTotalPages}
              onPageChange={(page) => dispatch(fetchAllUsers({ tenantId, page, size: 10 }))}
            />
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1rem', fontWeight: '600' }}>Add Team Member</h2>
              <button className="theme-toggle" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddMember}>
              <div className="modal-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.7rem', fontWeight: '700' }}>
                      FULL NAME
                    </label>
                    <input
                      className="input-field"
                      required
                      placeholder="e.g. John Doe"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      style={{ height: '36px', fontSize: '0.875rem' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.7rem', fontWeight: '700' }}>
                      EMAIL ADDRESS
                    </label>
                    <input
                      className="input-field"
                      type="email"
                      required
                      placeholder="john@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{ height: '36px', fontSize: '0.875rem' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.7rem', fontWeight: '700' }}>
                      PASSWORD
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        className="input-field"
                        type="text"
                        required
                        placeholder="Min 6 characters"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        style={{ height: '36px', fontSize: '0.875rem' }}
                      />
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            password: Math.random().toString(36).slice(-8),
                          })
                        }
                        style={{ height: '36px', padding: '0 0.75rem', fontSize: '0.7rem' }}
                      >
                        Auto
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ height: '32px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="btn btn-primary"
                  style={{ height: '32px', minWidth: '120px' }}
                >
                  {isAdding ? (
                    <Loader2 size={16} style={{ animation: 'loading 2s linear infinite' }} />
                  ) : (
                    'Add Member'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPage;
