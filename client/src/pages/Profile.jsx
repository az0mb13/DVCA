import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [message, setMessage] = useState('');
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });

  useEffect(() => {
    if (user) {
      fetch('/api/users/profile', { credentials: 'include' })
        .then(r => r.json())
        .then(data => { setProfile(data); setForm(data); });
    }
  }, [user]);

  const updateProfile = async (e) => {
    e.preventDefault();
    const res = await fetch(`/api/users/${profile.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form)
    });
    if (res.ok) setMessage('Profile updated successfully.');
  };

  const changePassword = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/users/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(passwordForm)
    });
    const data = await res.json();
    setMessage(data.message || data.error);
  };

  const setup2FA = async () => {
    const res = await fetch('/auth/2fa/setup', { method: 'POST', credentials: 'include' });
    const data = await res.json();
    setMessage(`Two-factor authentication enabled. Secret: ${data.secret}`);
  };

  if (!profile) return <div className="empty-state"><p>Loading profile... Please sign in first.</p></div>;

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div>
      {message && <div className="alert alert-success">{message}</div>}

      <div className="profile-header">
        <div className="profile-avatar">{(profile.username || 'U')[0].toUpperCase()}</div>
        <div className="profile-name">
          <h2>{profile.firstName || profile.username} {profile.lastName || ''}</h2>
          <p>{profile.email} &middot; <span className={`badge badge-${profile.role}`}>{profile.role}</span></p>
        </div>
      </div>

      <div className="profile-grid">
        <div>
          <div className="card">
            <h2>Personal Information</h2>
            <form onSubmit={updateProfile}>
              <div className="form-group">
                <label>Username</label>
                <input type="text" value={profile.username} disabled />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={form.email || ''} onChange={update('email')} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" value={form.firstName || ''} onChange={update('firstName')} />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" value={form.lastName || ''} onChange={update('lastName')} />
                </div>
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea value={form.bio || ''} onChange={update('bio')} rows={3} placeholder="Tell us about yourself..." />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="text" value={form.phone || ''} onChange={update('phone')} placeholder="+1 (555) 000-0000" />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input type="text" value={form.address || ''} onChange={update('address')} placeholder="Enter your address" />
              </div>
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </form>
          </div>
        </div>

        <div>
          <div className="card">
            <h2>Account Details</h2>
            <div className="info-row">
              <span className="info-label">Account ID</span>
              <span className="info-value">{profile.id}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Role</span>
              <span className="info-value"><span className={`badge badge-${profile.role}`}>{profile.role}</span></span>
            </div>
            <div className="info-row">
              <span className="info-label">SSN</span>
              <span className="info-value" style={{ fontFamily: 'monospace' }}>{profile.ssn}</span>
            </div>
            <div className="info-row">
              <span className="info-label">API Token</span>
              <span className="info-value" style={{ fontFamily: 'monospace', fontSize: 11 }}>{profile.apiToken}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Security Question</span>
              <span className="info-value">{profile.securityQuestion}</span>
            </div>
            {/* VULN: V5.3 - Bio rendered as HTML in multiple contexts */}
            {profile.bio && (
              <div style={{ marginTop: 12, padding: '12px 0', borderTop: '1px solid #f5f5f5' }}>
                <span className="info-label" style={{ display: 'block', marginBottom: 8 }}>Bio Preview</span>
                <div dangerouslySetInnerHTML={{ __html: profile.bio }} style={{ fontSize: 13, color: '#444' }} />
              </div>
            )}
          </div>

          <div className="card">
            <h2>Change Password</h2>
            <form onSubmit={changePassword}>
              <div className="form-group">
                <label>Current Password</label>
                <input type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} />
              </div>
              <button type="submit" className="btn btn-primary">Update Password</button>
            </form>
          </div>

          <div className="card">
            <h2>Security</h2>
            <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
              Add an extra layer of security to your account with two-factor authentication.
            </p>
            <button onClick={setup2FA} className="btn btn-outline">Enable 2FA</button>
          </div>
        </div>
      </div>
    </div>
  );
}
