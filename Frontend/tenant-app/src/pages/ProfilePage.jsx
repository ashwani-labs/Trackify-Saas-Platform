import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  User,
  Mail,
  Shield,
  Calendar,
  Lock,
  Key,
  Save,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { changePassword, updateProfilePhoto } from '../features/auth/authSlice';
import toast from 'react-hot-toast';
import axios from '../utils/axios';
import { Camera } from 'lucide-react';

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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate size (max 2MB)
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
    <div style={{ animation: 'fadeIn 0.5s ease-out', maxWidth: '1000px', margin: '0 auto' }}>
      <header className="hero-section" style={{ marginBottom: '3rem' }}>
        <div>
          <h1 className="hero-title">My Profile</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Manage your personal details and account security.
          </p>
        </div>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '2rem',
        }}
      >
        {/* Profile Details */}
        <section className="card" style={{ height: 'fit-content' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}
          >
            <div style={{ position: 'relative' }}>
              <div
                className="avatar-circle"
                style={{
                  width: '100px',
                  height: '100px',
                  fontSize: '2.5rem',
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                  color: 'white',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {user?.profilePhotoUrl ? (
                  <img
                    src={user.profilePhotoUrl}
                    alt="Profile"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  user?.email?.charAt(0).toUpperCase()
                )}

                {isUploading && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Loader2
                      size={24}
                      style={{ animation: 'loading 2s linear infinite', color: 'white' }}
                    />
                  </div>
                )}
              </div>

              <label
                style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  background: 'var(--primary)',
                  color: 'white',
                  padding: '6px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Camera size={14} />
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
              <h2 style={{ fontSize: '1.5rem' }}>{user?.email?.split('@')[0]}</h2>
              <span className="badge badge-primary" style={{ marginTop: '0.5rem' }}>
                <Shield size={12} style={{ marginRight: '0.4rem' }} /> {user?.role}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="form-group">
              <label
                className="form-label"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Mail size={16} /> Email Address
              </label>
              <input className="input-field" value={user?.email} disabled />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                Your email address is managed by your organization.
              </p>
            </div>

            <div className="form-group">
              <label
                className="form-label"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Calendar size={16} /> Workspace Domain
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--primary)',
                  fontWeight: '600',
                }}
              >
                <code>{tenantDomain}.trackify.com</code>
              </div>
            </div>
          </div>
        </section>

        {/* Security Settings */}
        <section className="card">
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}
          >
            <Lock size={20} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: '1.25rem' }}>Account Security</h2>
          </div>

          <form
            onSubmit={handlePasswordChange}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <div style={{ position: 'relative' }}>
                <Key
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                  size={16}
                />
                <input
                  type="password"
                  className="input-field"
                  style={{ paddingLeft: '2.5rem' }}
                  required
                  placeholder="Verify your identity"
                  value={passData.currentPassword}
                  onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                  size={16}
                />
                <input
                  type="password"
                  className="input-field"
                  style={{ paddingLeft: '2.5rem' }}
                  required
                  placeholder="Min 6 characters"
                  value={passData.newPassword}
                  onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                  size={16}
                />
                <input
                  type="password"
                  className="input-field"
                  style={{ paddingLeft: '2.5rem' }}
                  required
                  placeholder="Repeat new password"
                  value={passData.confirmPassword}
                  onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={isChangingPass}
            >
              {isChangingPass ? (
                <>
                  <Loader2 size={18} style={{ animation: 'loading 2s linear infinite' }} />
                  Updating...
                </>
              ) : (
                <>
                  <Save size={18} /> Update Password
                </>
              )}
            </button>
          </form>

          <div
            style={{
              marginTop: '2rem',
              padding: '1rem',
              background: 'rgba(99, 102, 241, 0.05)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start',
            }}
          >
            <AlertCircle
              size={18}
              style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }}
            />
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Using a unique, strong password helps keep your workspace secure.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
