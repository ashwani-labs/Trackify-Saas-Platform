import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers, updateUserStatus } from '../features/users/userSlice';
import Pagination from '../components/common/Pagination';
import styles from './TeamPage.module.css';
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
  ExternalLink,
} from 'lucide-react';
import { registerUser } from '../features/auth/authSlice';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  ACTIVE: { label: 'Active', cls: 'active' },
  PENDING: { label: 'Pending', cls: 'pending' },
  INACTIVE: { label: 'Inactive', cls: 'inactive' },
};

const ROLE_COLORS = {
  ADMIN: { label: 'Admin', cls: 'roleAdmin' },
  USER: { label: 'User', cls: 'roleUser' },
};

const TeamPage = () => {
  const dispatch = useDispatch();
  const { tenantId } = useSelector((s) => s.auth);
  const { allUsers, allUsersPage, allUsersTotalPages, allUsersTotalElements, isLoading, error } =
    useSelector((s) => s.users);
  const { tenantDomain } = useSelector((s) => s.auth);
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
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Team Members</h1>
          <p className={styles.subtitle}>
            {allUsersTotalElements ?? 0} member{allUsersTotalElements !== 1 ? 's' : ''} in your workspace
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.addBtn}
            onClick={() => setIsModalOpen(true)}
          >
            <UserPlus size={18} /> Add Member
          </button>
          <button
            className={styles.refreshBtn}
            onClick={() => dispatch(fetchAllUsers({ tenantId, page: allUsersPage, size: 10 }))}
            disabled={isLoading}
          >
            <RefreshCw size={18} className={isLoading ? styles.spinning : ''} />
          </button>
        </div>
      </header>

      {/* Workspace Link Banner */}
      <div className={styles.workspaceBanner}>
        <div className={styles.bannerInfo}>
          <Globe size={16} />
          <span>Employees can also register themselves at: <code>{tenantUrl}/register</code></span>
          <span className={styles.bannerId}>Workspace ID: <strong>{tenantId}</strong></span>
        </div>
        <button className={styles.copyBtn} onClick={() => copyToClipboard(`${tenantUrl}/register`, 'Link')}>
          <Copy size={14} /> Copy Link
        </button>
      </div>

      {/* Search bar */}
      <div className={styles.searchBar}>
        <Search size={18} className={styles.searchIcon} />
        <input
          className={styles.searchInput}
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Member</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => {
              const statusMeta = STATUS_COLORS[user.status] || STATUS_COLORS.INACTIVE;
              const roleMeta = ROLE_COLORS[user.role] || ROLE_COLORS.USER;
              return (
                <tr key={user.id} className={styles.row}>
                  <td>
                    <div className={styles.memberCell}>
                      <div className={styles.avatar}>
                        {(user.fullName || user.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className={styles.memberName}>{user.fullName || '—'}</div>
                        <div className={styles.memberEmail}>
                          <Mail size={12} /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${styles[roleMeta.cls]}`}>
                      <ShieldCheck size={12} /> {roleMeta.label}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${styles[statusMeta.cls]}`}>
                      {statusMeta.label}
                    </span>
                  </td>
                  <td className={styles.joinedCell}>
                    <Clock size={13} />
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      {user.status !== 'ACTIVE' && user.role !== 'ADMIN' && (
                        <button
                          className={styles.approveBtn}
                          onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                          title="Activate"
                        >
                          <UserCheck size={15} /> Activate
                        </button>
                      )}
                      {user.status === 'ACTIVE' && user.role !== 'ADMIN' && (
                        <button
                          className={styles.revokeBtn}
                          onClick={() => handleStatusChange(user.id, 'INACTIVE')}
                          title="Deactivate"
                        >
                          <UserX size={15} /> Revoke
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && !isLoading && (
              <tr>
                <td colSpan={5} className={styles.emptyRow}>
                  <Users size={32} />
                  <p>No team members found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {allUsersTotalPages > 1 && (
        <Pagination
          currentPage={allUsersPage}
          totalPages={allUsersTotalPages}
          onPageChange={(page) => dispatch(fetchAllUsers({ tenantId, page, size: 10 }))}
        />
      )}

      {/* Add Member Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Add New Member</h3>
              <button onClick={() => setIsModalOpen(false)} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>
            <p className={styles.modalSub}>
              An invitation email with these credentials will be sent automatically.
            </p>
            
            <form onSubmit={handleAddMember} className={styles.form}>
              <div className={styles.inputGroup}>
                <label>Full Name</label>
                <div className={styles.inputWrapper}>
                  <User size={16} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
              </div>
              
              <div className={styles.inputGroup}>
                <label>Email Address</label>
                <div className={styles.inputWrapper}>
                  <Mail size={16} />
                  <input
                    type="email"
                    required
                    placeholder="john@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              
              <div className={styles.inputGroup}>
                <label>Temporary Password</label>
                <div className={styles.inputWrapper}>
                  <Lock size={16} />
                  <input
                    type="text"
                    required
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button 
                    type="button" 
                    className={styles.genBtn}
                    onClick={() => setFormData({ ...formData, password: Math.random().toString(36).slice(-8) })}
                  >
                    Auto
                  </button>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" onClick={() => setIsModalOpen(false)} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={isAdding} className={styles.submitBtn}>
                  {isAdding ? 'Adding...' : 'Send Invitation'}
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
