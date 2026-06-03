import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchAllUsers, updateUserStatus } from '../features/users/userSlice';
import Pagination from '../components/common/Pagination';
import { Globe, Copy, Search, RefreshCw, UserPlus } from 'lucide-react';
import { registerUser } from '../features/auth/authSlice';
import toast from 'react-hot-toast';
import { PageHeader, Button, Input, Modal, Badge, Alert, EmptyState } from '@trackify/shared';

const STATUS_VARIANTS = {
  ACTIVE: 'success',
  PENDING: 'warning',
  INACTIVE: 'danger',
};

const TeamPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { tenantId, tenantDomain } = useSelector((s) => s.auth);
  const { allUsers, allUsersPage, allUsersTotalPages, allUsersTotalElements, isLoading, error } =
    useSelector((s) => s.users);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(() => Boolean(location.state?.openAdd));
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [isAdding, setIsAdding] = useState(false);

  const tenantUrl = `http://${tenantDomain}.trackify.com:5174`;

  useEffect(() => {
    if (tenantId) dispatch(fetchAllUsers({ tenantId, page: 0, size: 10 }));
  }, [dispatch, tenantId]);

  useEffect(() => {
    if (location.state?.openAdd) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.openAdd, navigate, location.pathname]);

  const isSoloWorkspace =
    !isLoading && !search && (allUsersTotalElements ?? 0) <= 1 && allUsers.length <= 1;

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

  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="page">
      <PageHeader
        breadcrumb={
          <>
            Administration / <strong>Team</strong>
          </>
        }
        title="Users and Permissions"
        subtitle="Manage who has access to this workspace and their respective roles."
        actions={
          <>
            <Button
              variant="ghost"
              className="icon-btn"
              aria-label="Refresh team list"
              isLoading={isLoading}
              onClick={() => dispatch(fetchAllUsers({ tenantId, page: allUsersPage, size: 10 }))}
              leftIcon={!isLoading ? <RefreshCw size={16} /> : null}
            />
            <Button leftIcon={<UserPlus size={16} />} onClick={() => setIsModalOpen(true)}>
              Add Member
            </Button>
          </>
        }
      />

      {isSoloWorkspace && (
        <EmptyState
          icon={<UserPlus size={40} />}
          title="You're the only member so far"
          description="Invite teammates to collaborate on projects, or share your self-registration link below so others can join your workspace."
          action={
            <Button leftIcon={<UserPlus size={16} />} onClick={() => setIsModalOpen(true)}>
              Invite Your First Teammate
            </Button>
          }
          className="card--spaced"
        />
      )}

      <div className="card team-banner">
        <div className="team-banner__content">
          <Globe className="team-banner__icon" size={20} aria-hidden />
          <div>
            <span className="team-banner__label">Self-registration Link:</span>
            <code className="team-banner__link">{tenantUrl}/register</code>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="team-banner__copy"
          leftIcon={<Copy size={12} />}
          onClick={() => copyToClipboard(`${tenantUrl}/register`, 'Link')}
        >
          Copy
        </Button>
      </div>

      <div className="card card--flush">
        <div className="card-section-header">
          <h2 className="card-section-title">Members ({allUsersTotalElements ?? 0})</h2>
          <div className="search-field">
            <div className="input-wrap">
              <Search className="input-wrap__icon" size={14} aria-hidden />
              <input
                className="input input--with-icon input--sm"
                placeholder="Filter members..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Filter team members"
              />
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="danger" className="alert--inset">
            {error}
          </Alert>
        )}

        <div className="table-wrapper table-wrapper--embedded">
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
                        <div className="member-cell">
                          <div className="avatar-md" aria-hidden>
                            {(u.fullName || u.email).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="member-name">{u.fullName || '—'}</div>
                            <div className="member-email">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge variant="primary">{u.role}</Badge>
                      </td>
                      <td>
                        <Badge variant={STATUS_VARIANTS[u.status] || 'primary'}>{u.status}</Badge>
                      </td>
                      <td className="member-email">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="table-actions">
                          {u.status !== 'ACTIVE' && u.role !== 'ADMIN' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleStatusChange(u.id, 'ACTIVE')}
                            >
                              Activate
                            </Button>
                          )}
                          {u.status === 'ACTIVE' && u.role !== 'ADMIN' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              className="btn--danger-text"
                              onClick={() => handleStatusChange(u.id, 'INACTIVE')}
                            >
                              Deactivate
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan={5} className="table-empty">
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
          <div className="card-footer">
            <Pagination
              currentPage={allUsersPage}
              totalPages={allUsersTotalPages}
              onPageChange={(page) => dispatch(fetchAllUsers({ tenantId, page, size: 10 }))}
            />
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Add Team Member"
        className="modal--narrow"
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" form="add-member-form" isLoading={isAdding}>
              Add Member
            </Button>
          </>
        }
      >
        <form id="add-member-form" className="form-stack" onSubmit={handleAddMember}>
          <Input
            id="member-full-name"
            label="Full name"
            required
            placeholder="e.g. John Doe"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          />
          <Input
            id="member-email"
            label="Email address"
            type="email"
            required
            placeholder="john@company.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <div className="form-group">
            <label className="form-label" htmlFor="member-password">
              Password
            </label>
            <div className="input-row">
              <input
                id="member-password"
                className="input"
                type="text"
                required
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  setFormData({
                    ...formData,
                    password: Math.random().toString(36).slice(-8),
                  })
                }
              >
                Auto
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TeamPage;
