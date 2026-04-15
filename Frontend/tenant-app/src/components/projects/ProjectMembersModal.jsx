import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, UserPlus, UserMinus } from 'lucide-react';
import { fetchProjectMembers, addProjectMember, removeProjectMember } from '../../features/projects/projectSlice';
import { fetchAllUsers } from '../../features/users/userSlice';
import styles from './ProjectMembersModal.module.css';

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

  if (!isOpen) return null;

  // Filter out users who are already members
  const availableUsers = allUsers.filter(
    (u) => !members.some((m) => m.userId === u.id)
  );

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
    setSelectedUserId(''); // reset
  };

  const handleRemoveMember = async (userId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      await dispatch(removeProjectMember({ projectId, userId }));
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Manage Project Members</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.addSection}>
            <select
              className={styles.select}
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
            <button
              className={styles.addBtn}
              onClick={handleAddMember}
              disabled={!selectedUserId || memberLoading}
            >
              <UserPlus size={18} />
              Add
            </button>
          </div>

          <div className={styles.memberList}>
            {memberLoading ? (
              <div className={styles.loading}>Loading members...</div>
            ) : members.length === 0 ? (
              <div className={styles.empty}>No members in this project yet.</div>
            ) : (
              members.map((member) => (
                <div key={member.id} className={styles.memberItem}>
                  <div className={styles.memberInfo}>
                    <div className={styles.avatar}>
                      {(member.userName || member.userEmail || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.details}>
                      <span className={styles.name}>{member.userName || 'Unknown'}</span>
                      <span className={styles.email}>{member.userEmail}</span>
                      <span className={styles.roleBadge}>{member.userRole || 'USER'}</span>
                    </div>
                  </div>
                  <button
                    className={styles.removeBtn}
                    onClick={() => handleRemoveMember(member.userId)}
                    title="Remove Member"
                  >
                    <UserMinus size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectMembersModal;
