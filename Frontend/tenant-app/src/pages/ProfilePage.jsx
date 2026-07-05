import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Lock, AlertCircle, Camera, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../utils/axios';
import { PageHeader, Button, Input, Badge, PasswordStrength } from '@trackify/shared';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, tenantDomain } = useSelector((s) => s.auth);

  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passData.newPassword !== passData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setIsChangingPass(true);
    try {
      const result = await dispatch(
        changePassword({
          email: user.email,
          currentPassword: passData.currentPassword,
          newPassword: passData.newPassword,
        })
      );

      if (changePassword.fulfilled.match(result)) {
        toast.success('Password updated successfully');
        setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(result.payload || 'Failed to update password');
      }
    } finally {
      setIsChangingPass(false);
    }
  };

  const [isUploading, setIsUploading] = useState(false);
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      const response = await axios.post('/auth/profile/photo', formData);

      if (response.data.status === 'success') {
        const photoUrl = response.data.data.url;
        toast.success('Profile photo updated');
        dispatch(updateProfilePhoto(photoUrl));
      }
    } catch {
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="page">
      <PageHeader
        breadcrumb={
          <>
            User Profile / <strong>Settings</strong>
          </>
        }
        title="Personal Settings"
        subtitle="Manage your account details, profile picture, and security."
      />

      <div className="profile-grid">
        <section className="card profile-card">
          <div className="profile-header">
            <div className="avatar-lg">
              {user?.profilePhotoUrl ? (
                <img src={user.profilePhotoUrl} alt="Profile" className="avatar-lg__img" />
              ) : (
                user?.email?.charAt(0).toUpperCase()
              )}

              {isUploading && (
                <div className="avatar-lg__overlay">
                  <Loader2 size={20} className="btn-spinner" aria-hidden />
                </div>
              )}

              <label className="avatar-upload-btn">
                <Camera size={12} />
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
            <div>
              <h2 className="profile-name">{user?.email?.split('@')[0]}</h2>
              <Badge variant="primary">{user?.role}</Badge>
            </div>
          </div>

          <div className="profile-fields">
            <div className="form-group">
              <label className="form-label" htmlFor="profile-email">
                Email address
              </label>
              <input id="profile-email" className="input" value={user?.email || ''} disabled />
              <p className="field-hint">Your identity is managed by your organization.</p>
            </div>

            <div className="form-group">
              <label className="form-label">Workspace domain</label>
              <div className="domain-display">{tenantDomain}.trackify.com</div>
            </div>
          </div>
        </section>

        <section className="card profile-card">
          <div className="section-heading">
            <Lock size={18} className="section-heading__icon" aria-hidden />
            <h2 className="section-heading__title">Security</h2>
          </div>

          <form className="form-stack" onSubmit={handlePasswordChange}>
            <Input
              id="current-password"
              label="Current password"
              type="password"
              required
              placeholder="Verify current password"
              value={passData.currentPassword}
              onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
            />
            <Input
              id="new-password"
              label="New password"
              type="password"
              required
              placeholder="Min 6 characters"
              value={passData.newPassword}
              onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
            />
            <PasswordStrength password={passData.newPassword} />
            <Input
              id="confirm-password"
              label="Confirm password"
              type="password"
              required
              placeholder="Repeat new password"
              value={passData.confirmPassword}
              onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
            />

            <Button type="submit" fullWidth isLoading={isChangingPass}>
              Change Password
            </Button>
          </form>

          <div className="info-callout">
            <AlertCircle size={16} className="info-callout__icon" aria-hidden />
            <p className="info-callout__text">
              Ensure your password is at least 6 characters long and contains a mix of letters and
              numbers.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
