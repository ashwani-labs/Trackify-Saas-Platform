import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PageHeader, Button } from '@trackify/shared';
import {
  NOTIFICATION_TYPES,
  loadNotificationPreferences,
  saveNotificationPreferences,
} from '../utils/notificationPreferences';

const NotificationPreferencesPage = () => {
  const [prefs, setPrefs] = useState(() => loadNotificationPreferences());
  const [saving, setSaving] = useState(false);

  const handleToggle = (typeId) => {
    setPrefs((prev) => ({ ...prev, [typeId]: !prev[typeId] }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    saveNotificationPreferences(prefs);
    toast.success('Notification preferences saved');
    setSaving(false);
  };

  return (
    <div className="page">
      <PageHeader
        breadcrumb={
          <>
            Account / <strong>Notification preferences</strong>
          </>
        }
        title="Notification preferences"
        subtitle="Choose which in-app notification types you want to see."
        actions={
          <Link to="/profile" className="btn btn-secondary">
            Back to profile
          </Link>
        }
      />

      <form
        className="card workspace-settings-form"
        style={{ padding: '1.5rem' }}
        onSubmit={handleSave}
      >
        <fieldset className="notification-prefs">
          <legend className="sr-only">Notification types</legend>
          {NOTIFICATION_TYPES.map((type) => (
            <label key={type.id} className="notification-prefs__row">
              <input
                type="checkbox"
                checked={prefs[type.id] !== false}
                onChange={() => handleToggle(type.id)}
              />
              <span>{type.label}</span>
            </label>
          ))}
        </fieldset>
        <p className="form-hint">
          Preferences apply to the notification panel. Email delivery is not configured yet.
        </p>
        <div className="workspace-settings-form__actions">
          <Button type="submit" isLoading={saving}>
            Save preferences
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NotificationPreferencesPage;
