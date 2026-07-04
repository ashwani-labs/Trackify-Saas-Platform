import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UserPlus, UserMinus, User, Mail, Shield, Loader2 } from 'lucide-react';
import {
  fetchProjectMembers,
  addProjectMember,
  removeProjectMember,
} from '../../features/projects/projectSlice';
import { fetchAllUsers } from '../../features/users/userSlice';
import { Modal, Button, EmptyState } from '@trackify/shared';

const ProjectMembersModal = ({ isOpen, onClose, projectId }) => {
  const dispatch = useDispatch();
  const { tenantId } = useSelector((s) => s.auth);
  const { members, memberLoading } = useSelector((s) => s.projects);
  const { allUsers, isLoading: usersLoading } = useSelector((s) => s.users);

  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchProjectMembers(projectId));
      if (tenantId) {
        dispatch(fetchAllUsers({ tenantId, page: 0, size: 100 }));
      }
    }
  }, [isOpen, projectId, tenantId, dispatch]);

  const availableUsers = allUsers.filter((u) => !members.some((m) => m.userId === u.id));

  const handleAddMember = async () => {
    if (!selectedUserId) return;

    const user = allUsers.find((u) => u.id === Number(selectedUserId));
    if (!user) return;

    const requestData = {
      userId: user.id,
      userEmail: user.email,
      userName: user.fullName || user.email,
      userRole: user.role || 'USER',
    };

    await dispatch(addProjectMember({ projectId, memberData: requestData }));
    setSelectedUserId('');
  };

  const handleRemoveMember = async (userId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      await dispatch(removeProjectMember({ projectId, userId }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Project Access" className="modal--wide">
      <div style={{ marginBottom: '2rem' }}>
        <label className="form-label" htmlFor="member-select">
          Add Member
        </label>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <User
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
              size={16}
              aria-hidden
            />
            <select
              id="member-select"
              className="input-field"
              style={{ paddingLeft: '2.5rem', appearance: 'none' }}
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              disabled={usersLoading}
            >
              <option value="">Select a user...</option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName || user.email} ({user.email})
                </option>
              ))}
            </select>
          </div>
          <Button
            onClick={handleAddMember}
            disabled={!selectedUserId || memberLoading}
            leftIcon={
              memberLoading ? (
                <Loader2 size={18} className="btn-spinner" />
              ) : (
                <UserPlus size={18} />
              )
            }
          >
            Add
          </Button>
        </div>
      </div>

      <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'grid', gap: '0.75rem' }}>
        <h4 className="form-label">Current Members</h4>

        {memberLoading && members.length === 0 ? (
          <div className="skeleton" style={{ height: '60px', width: '100%' }} />
        ) : members.length === 0 ? (
          <EmptyState
            title="No members yet"
            description="Add team members to collaborate on this project."
          />
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              className="card"
              style={{
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="avatar-circle" style={{ width: '40px', height: '40px' }}>
                  {(member.userName || member.userEmail || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                    {member.userName || 'Unknown'}
                  </div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <Mail size={12} aria-hidden /> {member.userEmail}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span
                  className="badge"
                  style={{ backgroundColor: 'var(--bg-input)', fontSize: '0.7rem' }}
                >
                  <Shield size={10} style={{ marginRight: '0.25rem' }} aria-hidden />
                  {member.userRole || 'USER'}
                </span>
                <button
                  type="button"
                  className="theme-toggle"
                  style={{ color: 'var(--danger)', width: '32px', height: '32px' }}
                  onClick={() => handleRemoveMember(member.userId)}
                  aria-label={`Remove ${member.userName || member.userEmail}`}
                >
                  <UserMinus size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};

export default ProjectMembersModal;
