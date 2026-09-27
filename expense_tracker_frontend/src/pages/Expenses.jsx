import { useState, useEffect, useMemo } from 'react';
import { Plus, X, Pencil, Trash2, ReceiptText, SearchX } from 'lucide-react';
import { formatCurrency, formatDate, formatMonth, getUniqueMonths } from '../utils/formatDate';
import api from '../api/api';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import './Expenses.css';

const CATEGORIES = ['ALL', 'FOOD', 'TRAVEL', 'SHOPPING', 'BILLS', 'OTHER'];

const SORT_OPTIONS = [
    { value: 'date_desc', label: 'Date (Newest)' },
    { value: 'date_asc', label: 'Date (Oldest)' },
    { value: 'amount_desc', label: 'Amount (High → Low)' },
    { value: 'amount_asc', label: 'Amount (Low → High)' }
];

const emptyForm = {
    description: '',
    amount: '',
    category: 'FOOD',
    date: new Date().toISOString().split('T')[0]
};

function Expenses() {
    const [expenses, setExpenses] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    const [filterCategory, setFilterCategory] = useState('ALL');
    const [filterMonth, setFilterMonth] = useState('ALL');
    const [sortBy, setSortBy] = useState('date_desc');

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const res = await api.get('/api/expenses');
            setExpenses(res.data);
        } catch (err) {
            setError('Failed to load expenses');
        } finally {
            setLoading(false);
        }
    };

    const availableMonths = useMemo(() => getUniqueMonths(expenses), [expenses]);

    const filteredExpenses = useMemo(() => {
        let result = [...expenses];

        if (filterCategory !== 'ALL') {
            result = result.filter(e => e.category === filterCategory);
        }

        if (filterMonth !== 'ALL') {
            result = result.filter(e => e.date.startsWith(filterMonth));
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
    }, [expenses, filterCategory, filterMonth, sortBy]);

    const totalFiltered = useMemo(() => {
        return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    }, [filteredExpenses]);

    const hasActiveFilters = filterCategory !== 'ALL' || filterMonth !== 'ALL' || sortBy !== 'date_desc';

    const clearFilters = () => {
        setFilterCategory('ALL');
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
                await api.put(`/api/expenses/${editingId}`, payload);
            } else {
                await api.post('/api/expenses', payload);
            }
            setForm(emptyForm);
            setEditingId(null);
            setShowForm(false);
            fetchExpenses();
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (expense) => {
        setForm({
            description: expense.description,
            amount: expense.amount.toString(),
            category: expense.category,
            date: expense.date
        });
        setEditingId(expense.id);
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
            await api.delete(`/api/expenses/${id}`);
            fetchExpenses();
        } catch (err) {
            setError('Failed to delete expense');
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
            <div className="expenses">
                <div className="page-header">
                    <div>
                        <h1 className="page-heading">Expenses</h1>
                        <p className="page-subheading">Track and manage your spending</p>
                    </div>
                </div>
                <div className="skeleton skeleton-table" />
            </div>
        );
    }

    const noResults = filteredExpenses.length === 0;

    return (
        <div className="expenses">
            <div className="page-header">
                <div>
                    <h1 className="page-heading">Expenses</h1>
                    <p className="page-subheading">Track and manage your spending</p>
                </div>
                {!showForm && (
                    <button className="btn-add" onClick={() => setShowForm(true)}>
                        <span className="btn-add-icon"><Plus size={14} /></span>
                        <span className="btn-add-text">Add Expense</span>
                    </button>
                )}
            </div>

            {error && <div className="alert alert-error" role="alert">{error}</div>}

            {showForm && (
                <div className="form-card">
                    <div className="form-card-header">
                        <h2 className="form-card-title">
                            {editingId ? 'Edit Expense' : 'New Expense'}
                        </h2>
                        <button className="form-card-close" onClick={handleCancel} aria-label="Close form">
                            <X size={18} />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="entry-form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="exp-desc">Description</label>
                                <input
                                    id="exp-desc"
                                    type="text"
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="e.g. Lunch at restaurant"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="exp-amount">Amount ($)</label>
                                <input
                                    id="exp-amount"
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
                                <label htmlFor="exp-cat">Category</label>
                                <select
                                    id="exp-cat"
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                >
                                    <option value="FOOD">Food</option>
                                    <option value="TRAVEL">Travel</option>
                                    <option value="SHOPPING">Shopping</option>
                                    <option value="BILLS">Bills</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="exp-date">Date</label>
                                <input
                                    id="exp-date"
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
                                {submitting ? 'Saving...' : `${editingId ? 'Update' : 'Add'} Expense`}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={handleCancel} disabled={submitting}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {expenses.length > 0 && (
                <div className="filter-bar">
                    <div className="filter-categories" role="group" aria-label="Filter by category">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                className={`filter-pill ${filterCategory === cat ? 'filter-pill-active' : ''}`}
                                onClick={() => setFilterCategory(cat)}
                            >
                                {cat === 'ALL' ? 'All' : cat.charAt(0) + cat.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>

                    <div className="filter-controls">
                        <div className="filter-select-group">
                            <label htmlFor="filter-month">Month</label>
                            <select
                                id="filter-month"
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
                            <label htmlFor="filter-sort">Sort By</label>
                            <select
                                id="filter-sort"
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
                    icon={expenses.length === 0 ? <ReceiptText size={28} /> : <SearchX size={28} />}
                    title={expenses.length === 0 ? 'No expenses yet' : 'No matching expenses'}
                    description={
                        expenses.length === 0
                            ? 'Start tracking by adding your first expense.'
                            : 'Try adjusting your filters to find what you are looking for.'
                    }
                    action={
                        expenses.length === 0 ? (
                            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                                <Plus size={16} /> Add Expense
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
                            Showing {filteredExpenses.length} of {expenses.length} expenses
                        </span>
                        <span className="results-total">
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
                                        <th>Category</th>
                                        <th className="text-right">Amount</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredExpenses.map((exp) => (
                                        <tr key={exp.id}>
                                            <td className="td-date">{formatDate(exp.date)}</td>
                                            <td className="td-desc">{exp.description}</td>
                                            <td>
                                                <span className={`category-badge cat-${exp.category.toLowerCase()}`}>
                                                    {exp.category}
                                                </span>
                                            </td>
                                            <td className="text-right amount-expense">
                                                {formatCurrency(exp.amount)}
                                            </td>
                                            <td className="td-actions text-center">
                                                <button
                                                    className="btn-icon-action btn-edit-icon"
                                                    onClick={() => handleEdit(exp)}
                                                    aria-label={`Edit ${exp.description}`}
                                                    title="Edit"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    className="btn-icon-action btn-delete-icon"
                                                    onClick={() => requestDelete(exp.id)}
                                                    disabled={deletingId === exp.id}
                                                    aria-label={`Delete ${exp.description}`}
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
                title="Delete expense?"
                message="This expense will be permanently removed. This action cannot be undone."
                confirmLabel="Delete"
                busy={deletingId !== null}
                onConfirm={confirmDelete}
                onCancel={() => setConfirmDeleteId(null)}
            />
        </div>
    );
}

export default Expenses;
