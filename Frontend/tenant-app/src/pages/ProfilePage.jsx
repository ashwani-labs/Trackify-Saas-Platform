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
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <nav style={{ marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        User Profile / <span style={{ color: 'var(--text-main)' }}>Settings</span>
      </nav>

      <header style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.25rem' }}>Personal Settings</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Manage your account details, profile picture, and security.
          </p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '2rem',
        }}
      >
        {/* Profile Details */}
        <section className="card" style={{ height: 'fit-content', padding: '2rem' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}
          >
            <div style={{ position: 'relative' }}>
              <div
                className="avatar-circle"
                style={{
                  width: '80px',
                  height: '80px',
                  fontSize: '2rem',
                  background: 'var(--primary)',
                  color: 'white',
                  overflow: 'hidden',
                  position: 'relative',
                  borderRadius: '50%'
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
                      size={20}
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
                  background: 'white',
                  color: 'var(--text-main)',
                  padding: '5px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--border-main)'
                }}
              >
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
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>{user?.email?.split('@')[0]}</h2>
              <span className="badge" style={{ marginTop: '0.5rem', background: '#F4F5F7', color: '#42526E', fontSize: '0.7rem' }}>
                {user?.role}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.7rem', fontWeight: '700' }}>EMAIL ADDRESS</label>
              <input className="input-field" value={user?.email} disabled style={{ height: '36px', fontSize: '0.875rem' }} />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Your identity is managed by your organization.
              </p>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.7rem', fontWeight: '700' }}>WORKSPACE DOMAIN</label>
              <div
                style={{
                  padding: '0.5rem 0.75rem',
                  background: '#F4F5F7',
                  borderRadius: '3px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--primary)'
                }}
              >
                {tenantDomain}.trackify.com
              </div>
            </div>
          </div>
        </section>

        {/* Security Settings */}
        <section className="card" style={{ padding: '2rem' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}
          >
            <Lock size={18} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: '1rem', fontWeight: '600' }}>Security</h2>
          </div>

          <form
            onSubmit={handlePasswordChange}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.7rem', fontWeight: '700' }}>CURRENT PASSWORD</label>
              <input
                type="password"
                className="input-field"
                required
                placeholder="Verify current password"
                value={passData.currentPassword}
                onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                style={{ height: '36px', fontSize: '0.875rem' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.7rem', fontWeight: '700' }}>NEW PASSWORD</label>
              <input
                type="password"
                className="input-field"
                required
                placeholder="Min 6 characters"
                value={passData.newPassword}
                onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                style={{ height: '36px', fontSize: '0.875rem' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.7rem', fontWeight: '700' }}>CONFIRM PASSWORD</label>
              <input
                type="password"
                className="input-field"
                required
                placeholder="Repeat new password"
                value={passData.confirmPassword}
                onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                style={{ height: '36px', fontSize: '0.875rem' }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', height: '36px' }}
              disabled={isChangingPass}
            >
              {isChangingPass ? (
                <Loader2 size={16} style={{ animation: 'loading 2s linear infinite' }} />
              ) : (
                'Change Password'
              )}
            </button>
          </form>

          <div
            style={{
              marginTop: '2rem',
              padding: '1rem',
              background: '#EAE6FF',
              borderRadius: '3px',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start',
            }}
          >
            <AlertCircle
              size={16}
              style={{ color: '#6554C0', flexShrink: 0, marginTop: '2px' }}
            />
            <p style={{ fontSize: '0.75rem', color: '#42526E', lineHeight: '1.6' }}>
              Ensure your password is at least 6 characters long and contains a mix of letters and numbers.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
