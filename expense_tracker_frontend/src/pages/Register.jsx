import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, TrendingUp, ChartPie, ShieldCheck, Mail, Lock, User, AlertCircle, UserPlus } from 'lucide-react';
import api from '../api/api';
import './Register.css';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await api.post('/api/auth/register', { name, email, password });
            login(res.data);
            navigate('/dashboard');
        } catch (err) {
            const msg = err.response?.data?.error
                || err.response?.data?.email
                || err.response?.data?.password
                || err.response?.data?.name
                || 'Registration failed. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-panel">
                <div className="auth-panel-content">
                    <div className="auth-brand">
                        <span className="brand-tile brand-tile-lg">
                            <Wallet size={26} />
                        </span>
                        <span className="auth-brand-name">ExpenseTracker</span>
                    </div>
                    <h2 className="auth-panel-title">Start your journey to smarter spending.</h2>
                    <p className="auth-panel-text">
                        Create a free account and get instant clarity on where
                        your money goes — no credit card required.
                    </p>
                    <ul className="auth-features">
                        <li>
                            <span className="auth-feature-icon"><TrendingUp size={17} /></span>
                            Real-time dashboard with insights
                        </li>
                        <li>
                            <span className="auth-feature-icon"><ChartPie size={17} /></span>
                            Charts by category, month and day
                        </li>
                        <li>
                            <span className="auth-feature-icon"><ShieldCheck size={17} /></span>
                            Secure sign-in, including Google
                        </li>
                    </ul>
                </div>
                <div className="auth-panel-decor" aria-hidden="true">
                    <span className="decor-circle decor-circle-1" />
                    <span className="decor-circle decor-circle-2" />
                    <span className="decor-circle decor-circle-3" />
                </div>
            </div>

            <div className="auth-form-side">
                <div className="auth-card">
                    <div className="auth-card-mobile-brand">
                        <span className="brand-tile">
                            <Wallet size={20} />
                        </span>
                        <span className="brand-text">ExpenseTracker</span>
                    </div>

                    <h1 className="auth-title">Create your account</h1>
                    <p className="auth-subtitle">Start tracking your expenses today</p>

                    {error && (
                        <div className="alert alert-error auth-alert" role="alert">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <div className="input-with-icon">
                                <User size={17} className="input-icon" />
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    required
                                    autoComplete="name"
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <div className="input-with-icon">
                                <Mail size={17} className="input-icon" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="input-with-icon">
                                <Lock size={17} className="input-icon" />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Min 6 characters"
                                    required
                                    minLength={6}
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                            <UserPlus size={17} />
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <p className="auth-footer">
                        Already have an account? <Link to="/login">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;
