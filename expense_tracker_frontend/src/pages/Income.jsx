import { useState, useEffect, useMemo } from 'react';
import { Plus, X, Pencil, Trash2, Wallet, SearchX } from 'lucide-react';
import { formatCurrency, formatDate, formatMonth, getUniqueMonths } from '../utils/formatDate';
import api from '../api/api';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import './Income.css';

const SORT_OPTIONS = [
    { value: 'date_desc', label: 'Date (Newest)' },
    { value: 'date_asc', label: 'Date (Oldest)' },
    { value: 'amount_desc', label: 'Amount (High → Low)' },
    { value: 'amount_asc', label: 'Amount (Low → High)' }
];

const emptyForm = {
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
};

function Income() {
    const [incomes, setIncomes] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    const [filterMonth, setFilterMonth] = useState('ALL');
    const [sortBy, setSortBy] = useState('date_desc');

    useEffect(() => {
        fetchIncome();
    }, []);

    const fetchIncome = async () => {
        try {
            const res = await api.get('/api/income');
            setIncomes(res.data);
        } catch (err) {
            setError('Failed to load income');
        } finally {
            setLoading(false);
        }
    };

    const availableMonths = useMemo(() => getUniqueMonths(incomes), [incomes]);

    const filteredIncome = useMemo(() => {
        let result = [...incomes];

        if (filterMonth !== 'ALL') {
            result = result.filter(i => i.date.startsWith(filterMonth));
        }

        switch (sortBy) {
            case 'date_desc':
                result.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'date_asc':
                result.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'amount_desc':
                result.sort((a, b) => b.amount - a.amount);
                break;
            case 'amount_asc':
                result.sort((a, b) => a.amount - b.amount);
                break;
            default:
                break;
        }

        return result;
    }, [incomes, filterMonth, sortBy]);

    const totalFiltered = useMemo(() => {
        return filteredIncome.reduce((sum, i) => sum + i.amount, 0);
    }, [filteredIncome]);

    const hasActiveFilters = filterMonth !== 'ALL' || sortBy !== 'date_desc';

    const clearFilters = () => {
        setFilterMonth('ALL');
        setSortBy('date_desc');
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;
        setError('');
        setSubmitting(true);

        const payload = {
            ...form,
            amount: parseFloat(form.amount)
        };

        try {
            if (editingId) {
                await api.put(`/api/income/${editingId}`, payload);
            } else {
                await api.post('/api/income', payload);
            }
            setForm(emptyForm);
            setEditingId(null);
            setShowForm(false);
            fetchIncome();
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (income) => {
        setForm({
            description: income.description,
            amount: income.amount.toString(),
            date: income.date
        });
        setEditingId(income.id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const requestDelete = (id) => {
        if (deletingId) return;
        setConfirmDeleteId(id);
    };

    const confirmDelete = async () => {
        const id = confirmDeleteId;
        if (!id || deletingId) return;
        setDeletingId(id);
        setConfirmDeleteId(null);
        try {
            await api.delete(`/api/income/${id}`);
            fetchIncome();
        } catch (err) {
            setError('Failed to delete income');
        } finally {
            setDeletingId(null);
        }
    };

    const handleCancel = () => {
        setForm(emptyForm);
        setEditingId(null);
        setShowForm(false);
        setError('');
    };

    if (loading) {
        return (
            <div className="income-page">
                <div className="page-header">
                    <div>
                        <h1 className="page-heading">Income</h1>
                        <p className="page-subheading">Track and manage your earnings</p>
                    </div>
                </div>
                <div className="skeleton skeleton-table" />
            </div>
        );
    }

    const noResults = filteredIncome.length === 0;

    return (
        <div className="income-page">
            <div className="page-header">
                <div>
                    <h1 className="page-heading">Income</h1>
                    <p className="page-subheading">Track and manage your earnings</p>
                </div>
                {!showForm && (
                    <button className="btn-add" onClick={() => setShowForm(true)}>
                        <span className="btn-add-icon"><Plus size={14} /></span>
                        <span className="btn-add-text">Add Income</span>
                    </button>
                )}
            </div>

            {error && <div className="alert alert-error" role="alert">{error}</div>}

            {showForm && (
                <div className="form-card">
                    <div className="form-card-header">
                        <h2 className="form-card-title">
                            {editingId ? 'Edit Income' : 'New Income'}
                        </h2>
                        <button className="form-card-close" onClick={handleCancel} aria-label="Close form">
                            <X size={18} />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="entry-form">
                        <div className="form-grid form-grid-income">
                            <div className="form-group">
                                <label htmlFor="inc-desc">Description</label>
                                <input
                                    id="inc-desc"
                                    type="text"
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="e.g. Monthly salary"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="inc-amount">Amount ($)</label>
                                <input
                                    id="inc-amount"
                                    type="number"
                                    name="amount"
                                    value={form.amount}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    min="0.01"
                                    step="0.01"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="inc-date">Date</label>
                                <input
                                    id="inc-date"
                                    type="date"
                                    name="date"
                                    value={form.date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                {submitting ? 'Saving...' : `${editingId ? 'Update' : 'Add'} Income`}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={handleCancel} disabled={submitting}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {incomes.length > 0 && (
                <div className="filter-bar">
                    <div className="filter-controls">
                        <div className="filter-select-group">
                            <label htmlFor="inc-filter-month">Month</label>
                            <select
                                id="inc-filter-month"
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(e.target.value)}
                            >
                                <option value="ALL">All Months</option>
                                {availableMonths.map(m => (
                                    <option key={m} value={m}>{formatMonth(m)}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-select-group">
                            <label htmlFor="inc-filter-sort">Sort By</label>
                            <select
                                id="inc-filter-sort"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                {SORT_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {hasActiveFilters && (
                            <button className="btn-clear-filters" onClick={clearFilters}>
                                <X size={14} /> Clear
                            </button>
                        )}
                    </div>
                </div>
            )}

            {noResults ? (
                <EmptyState
                    icon={incomes.length === 0 ? <Wallet size={28} /> : <SearchX size={28} />}
                    title={incomes.length === 0 ? 'No income records yet' : 'No matching records'}
                    description={
                        incomes.length === 0
                            ? 'Add your first income entry to start tracking your earnings.'
                            : 'Try adjusting your filters to find what you are looking for.'
                    }
                    action={
                        incomes.length === 0 ? (
                            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                                <Plus size={16} /> Add Income
                            </button>
                        ) : (
                            <button className="btn-link" onClick={clearFilters}>
                                Clear filters
                            </button>
                        )
                    }
                />
            ) : (
                <>
                    <div className="results-bar">
                        <span className="results-count">
                            Showing {filteredIncome.length} of {incomes.length} records
                        </span>
                        <span className="results-total results-total-income">
                            Filtered total: {formatCurrency(totalFiltered)}
                        </span>
                    </div>

                    <div className="table-card">
                        <div className="table-responsive">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Description</th>
                                        <th className="text-right">Amount</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredIncome.map((inc) => (
                                        <tr key={inc.id}>
                                            <td className="td-date">{formatDate(inc.date)}</td>
                                            <td className="td-desc">{inc.description}</td>
                                            <td className="text-right amount-income">
                                                +{formatCurrency(inc.amount)}
                                            </td>
                                            <td className="td-actions text-center">
                                                <button
                                                    className="btn-icon-action btn-edit-icon"
                                                    onClick={() => handleEdit(inc)}
                                                    aria-label={`Edit ${inc.description}`}
                                                    title="Edit"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    className="btn-icon-action btn-delete-icon"
                                                    onClick={() => requestDelete(inc.id)}
                                                    disabled={deletingId === inc.id}
                                                    aria-label={`Delete ${inc.description}`}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            <ConfirmDialog
                open={confirmDeleteId !== null}
                title="Delete income?"
                message="This income record will be permanently removed. This action cannot be undone."
                confirmLabel="Delete"
                busy={deletingId !== null}
                onConfirm={confirmDelete}
                onCancel={() => setConfirmDeleteId(null)}
            />
        </div>
    );
}

export default Income;
