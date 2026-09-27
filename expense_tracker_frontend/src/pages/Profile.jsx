import { useState, useEffect } from 'react';
import { User, Mail, Calendar, Lock, Shield, Check, X, Pencil, KeyRound } from 'lucide-react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../api/api';
import Spinner from '../components/Spinner';
import './Profile.css';

function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const [editingName, setEditingName] = useState(false);
    const [name, setName] = useState('');

    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/api/user/profile');
            setProfile(res.data);
            setName(res.data.name);
        } catch (err) {
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateName = async () => {
        if (!name.trim()) return;
        setError('');
        setSuccess('');
        try {
            await api.put('/api/user/profile', { name });
            setSuccess('Name updated successfully');
            setEditingName(false);
            fetchProfile();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update name');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await api.put('/api/user/password', {
                currentPassword,
                newPassword
            });
            setSuccess('Password changed successfully');
            setCurrentPassword('');
            setNewPassword('');
            setShowPasswordForm(false);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to change password');
        }
    };

    if (loading) {
        return (
            <div className="profile-page">
                <h1 className="page-heading">Profile</h1>
                <div className="page-loading">
                    <Spinner label="Loading profile..." />
                </div>
            </div>
        );
    }

    const initials = profile?.name
        ? profile.name
            .split(' ')
            .map((part) => part.charAt(0))
            .slice(0, 2)
            .join('')
            .toUpperCase()
        : '?';

    return (
        <div className="profile-page">
            <h1 className="page-heading">Profile</h1>

            <div className="profile-grid">
                <div className="profile-card">
                    <div className="profile-banner" aria-hidden="true" />
                    <div className="profile-card-body">
                        <div className="profile-header">
                            <div className="profile-avatar">{initials}</div>
                            <div className="profile-info">
                                <h2 className="profile-name">{profile?.name}</h2>
                                <span className={`role-badge role-${profile?.role?.toLowerCase()}`}>
                                    {profile?.role}
                                </span>
                            </div>
                        </div>

                        <div className="profile-details">
                            <div className="detail-item">
                                <span className="detail-icon"><Mail size={18} /></span>
                                <div className="detail-text">
                                    <div className="detail-label">Email</div>
                                    <div className="detail-value">{profile?.email}</div>
                                </div>
                            </div>
                            <div className="detail-item">
                                <span className="detail-icon"><Shield size={18} /></span>
                                <div className="detail-text">
                                    <div className="detail-label">Provider</div>
                                    <div className="detail-value detail-value-caps">{profile?.provider}</div>
                                </div>
                            </div>
                            <div className="detail-item">
                                <span className="detail-icon"><Calendar size={18} /></span>
                                <div className="detail-text">
                                    <div className="detail-label">Joined</div>
                                    <div className="detail-value">
                                        {new Date(profile?.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="profile-actions-card">
                    <div className="section-title">
                        <span className="section-title-icon"><User size={18} /></span>
                        Update Profile
                    </div>

                    {error && (
                        <div className="alert alert-error" role="alert">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="alert alert-success" role="status">
                            <CheckCircle2 size={18} />
                            <span>{success}</span>
                        </div>
                    )}

                    <div className="action-section">
                        <h3 className="action-section-title">Display name</h3>
                        {editingName ? (
                            <div className="edit-form-inline">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="edit-input"
                                    placeholder="Your name"
                                    autoFocus
                                />
                                <button
                                    onClick={handleUpdateName}
                                    className="btn-icon btn-save"
                                    aria-label="Save name"
                                    title="Save"
                                >
                                    <Check size={18} />
                                </button>
                                <button
                                    onClick={() => {
                                        setEditingName(false);
                                        setName(profile?.name);
                                    }}
                                    className="btn-icon btn-cancel"
                                    aria-label="Cancel editing"
                                    title="Cancel"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="display-with-edit">
                                <span className="display-name">{profile?.name}</span>
                                <button onClick={() => setEditingName(true)} className="btn-edit-inline">
                                    <Pencil size={14} /> Edit
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="action-section">
                        <div className="action-header">
                            <h3 className="action-section-title">
                                <Lock size={16} />
                                Password
                            </h3>
                            {profile?.canChangePassword && (
                                <button
                                    className="btn-toggle"
                                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                                >
                                    {showPasswordForm ? 'Cancel' : 'Change Password'}
                                </button>
                            )}
                        </div>

                        {profile?.canChangePassword ? (
                            showPasswordForm && (
                                <form onSubmit={handleChangePassword} className="password-form">
                                    <div className="form-group">
                                        <label htmlFor="current-password">Current Password</label>
                                        <input
                                            id="current-password"
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            autoComplete="current-password"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="new-password">New Password</label>
                                        <input
                                            id="new-password"
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            minLength={6}
                                            autoComplete="new-password"
                                            placeholder="Min 6 characters"
                                            required
                                        />
                                    </div>
                                    <div className="form-actions">
                                        <button type="submit" className="btn btn-primary">
                                            <KeyRound size={16} /> Update Password
                                        </button>
                                    </div>
                                </form>
                            )
                        ) : (
                            <p className="password-note">
                                Google users cannot change their password here. Manage it through your Google account instead.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
