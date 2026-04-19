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
  Loader2
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
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <header className="hero-section">
        <div>
          <h1 className="hero-title">Team Members</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {allUsersTotalElements ?? 0} members active in this workspace
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => dispatch(fetchAllUsers({ tenantId, page: allUsersPage, size: 10 }))} disabled={isLoading}>
            {isLoading ? <Loader2 size={18} style={{ animation: 'loading 2s linear infinite' }} /> : <RefreshCw size={18} />}
          </button>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <UserPlus size={18} /> Add Member
          </button>
        </div>
      </header>

      <div className="card" style={{ padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', borderStyle: 'dashed' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="avatar-circle" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
            <Globe size={18} />
          </div>
          <div style={{ fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Employee Join Link:</span>
            <code style={{ marginLeft: '0.5rem', color: 'var(--primary)', fontWeight: '600' }}>{tenantUrl}/register</code>
          </div>
        </div>
        <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => copyToClipboard(`${tenantUrl}/register`, 'Link')}>
          <Copy size={14} /> Copy
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
        <input
          className="input-field"
          style={{ paddingLeft: '3rem' }}
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <div className="badge badge-danger" style={{ width: '100%', padding: '1rem', marginBottom: '1rem' }}>{error}</div>}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Member</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="avatar-circle">
                      {(u.fullName || u.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600' }}>{u.fullName || '—'}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Mail size={12} /> {u.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="badge badge-primary">
                    <ShieldCheck size={12} style={{ marginRight: '0.4rem' }} /> {u.role}
                  </span>
                </td>
                <td>
                  <span className={`badge badge-${STATUS_VARIANTS[u.status] || 'primary'}`}>
                    {u.status}
                  </span>
                </td>
                <td style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={14} />
                    {new Date(u.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    {u.status !== 'ACTIVE' && u.role !== 'ADMIN' && (
                      <button className="theme-toggle" onClick={() => handleStatusChange(u.id, 'ACTIVE')} title="Activate">
                        <UserCheck size={18} />
                      </button>
                    )}
                    {u.status === 'ACTIVE' && u.role !== 'ADMIN' && (
                      <button className="theme-toggle" onClick={() => handleStatusChange(u.id, 'INACTIVE')} title="Deactivate" style={{ color: 'var(--danger)' }}>
                        <UserX size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && !isLoading && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                  <Users size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                  <p>No team members found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {allUsersTotalPages > 1 && (
        <div style={{ marginTop: '2rem' }}>
          <Pagination
            currentPage={allUsersPage}
            totalPages={allUsersTotalPages}
            onPageChange={(page) => dispatch(fetchAllUsers({ tenantId, page, size: 10 }))}
          />
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem' }}>Add Team Member</h2>
              <button className="theme-toggle" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddMember}>
              <div className="modal-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <div style={{ position: 'relative' }}>
                      <User style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
                      <input
                        className="input-field"
                        style={{ paddingLeft: '2.5rem' }}
                        required
                        placeholder="e.g. John Doe"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
                      <input
                        className="input-field"
                        style={{ paddingLeft: '2.5rem' }}
                        type="email"
                        required
                        placeholder="john@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Temporary Password</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
                        <input
                          className="input-field"
                          style={{ paddingLeft: '2.5rem' }}
                          type="text"
                          required
                          placeholder="Min 6 characters"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                      </div>
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => setFormData({ ...formData, password: Math.random().toString(36).slice(-8) })}
                      >
                        Auto
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isAdding} className="btn btn-primary" style={{ minWidth: '150px' }}>
                  {isAdding ? <Loader2 size={18} style={{ animation: 'loading 2s linear infinite' }} /> : 'Send Invitation'}
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
