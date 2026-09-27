import { useState, useEffect } from 'react';
import { Search, Shield, ShieldOff, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../api/api';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import Spinner from '../components/Spinner';
import './AdminUsers.css';

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [search, setSearch] = useState('');
    const [actioningId, setActioningId] = useState(null);
    const [pendingAction, setPendingAction] = useState(null); // { type: 'promote'|'demote', user }

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/api/admin/users');
            setUsers(res.data);
        } catch (err) {
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    const requestPromote = (user) => {
        if (actioningId) return;
        setPendingAction({ type: 'promote', user });
    };

    const requestDemote = (user) => {
        if (actioningId) return;
        setPendingAction({ type: 'demote', user });
    };

    const confirmAction = async () => {
        if (!pendingAction || actioningId) return;
        const { type, user } = pendingAction;
        setError('');
        setSuccess('');
        setActioningId(user.id);
        setPendingAction(null);

        try {
            await api.put(`/api/admin/users/${user.id}/${type}`);
            setSuccess(type === 'promote'
                ? `${user.name} has been promoted to ADMIN`
                : `${user.name} has been demoted to USER`);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.error || `Failed to ${type} user`);
        } finally {
            setActioningId(null);
        }
    };

    if (loading) {
        return (
            <div className="admin-page">
                <h1 className="page-heading">All Users</h1>
                <div className="page-loading">
                    <Spinner label="Loading users..." />
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="page-header">
                <div>
                    <h1 className="page-heading">All Users</h1>
                    <p className="page-subheading">Manage user roles and access</p>
                </div>
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

            <div className="admin-toolbar">
                <div className="admin-search-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        className="admin-search"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Search users"
                    />
                    {search && (
                        <button
                            className="search-clear"
                            onClick={() => setSearch('')}
                            aria-label="Clear search"
                        >
                            ×
                        </button>
                    )}
                </div>
                <span className="admin-user-count">
                    <Users size={15} />
                    {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
                </span>
            </div>

            {filteredUsers.length === 0 ? (
                <EmptyState
                    icon={<Users size={28} />}
                    title={users.length === 0 ? 'No users yet' : 'No matching users'}
                    description={
                        users.length === 0
                            ? 'No users have registered yet.'
                            : 'Try a different search term.'
                    }
                />
            ) : (
                <div className="table-card">
                    <div className="table-responsive">
                        <table className="data-table admin-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Provider</th>
                                    <th className="hide-mobile">Joined</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((u) => (
                                    <tr key={u.id}>
                                        <td>
                                            <div className="user-cell">
                                                <div className="user-avatar">
                                                    {u.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="user-info">
                                                    <div className="user-name">{u.name}</div>
                                                    <div className="user-email">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`role-badge role-${u.role.toLowerCase()}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="provider-badge">{u.provider}</span>
                                        </td>
                                        <td className="hide-mobile td-date">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="td-actions text-center">
                                            {u.role === 'USER' ? (
                                                <button
                                                    className="btn-role btn-promote"
                                                    onClick={() => requestPromote(u)}
                                                    disabled={actioningId === u.id}
                                                >
                                                    <Shield size={15} />
                                                    <span className="btn-action-text">
                                                        {actioningId === u.id ? 'Working...' : 'Promote'}
                                                    </span>
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn-role btn-demote"
                                                    onClick={() => requestDemote(u)}
                                                    disabled={actioningId === u.id}
                                                >
                                                    <ShieldOff size={15} />
                                                    <span className="btn-action-text">
                                                        {actioningId === u.id ? 'Working...' : 'Demote'}
                                                    </span>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={pendingAction !== null}
                title={pendingAction?.type === 'promote' ? 'Promote to admin?' : 'Demote to user?'}
                message={
                    pendingAction?.type === 'promote'
                        ? `"${pendingAction?.user?.name}" will gain full admin access.`
                        : `"${pendingAction?.user?.name}" will lose admin access.`
                }
                confirmLabel={pendingAction?.type === 'promote' ? 'Promote' : 'Demote'}
                danger={pendingAction?.type === 'demote'}
                busy={actioningId !== null}
                onConfirm={confirmAction}
                onCancel={() => setPendingAction(null)}
            />
        </div>
    );
}

export default AdminUsers;
