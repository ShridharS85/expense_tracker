import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, TrendingUp, ChartPie, ShieldCheck, Mail, Lock, AlertCircle, LogIn } from 'lucide-react';
import api from '../api/api';
import './Login.css';

function Login() {
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
            const res = await api.post('/api/auth/login', { email, password });
            login(res.data);
            navigate('/dashboard');
        } catch (err) {
            const msg = err.response?.data?.error
                || err.response?.data?.email
                || err.response?.data?.password
                || 'Login failed. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const googleLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_URL}/oauth2/authorization/google`;
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
                    <h2 className="auth-panel-title">Take control of your money.</h2>
                    <p className="auth-panel-text">
                        Track income and expenses, visualize your spending habits,
                        and export beautiful reports — all in one place.
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

                    <h1 className="auth-title">Welcome back</h1>
                    <p className="auth-subtitle">Sign in to your account to continue</p>

                    {error && (
                        <div className="alert alert-error auth-alert" role="alert">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
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
                                    placeholder="••••••••"
                                    required
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                            <LogIn size={17} />
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="auth-divider">
                        <span>or</span>
                    </div>

                    <button className="btn-google" onClick={googleLogin}>
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Sign in with Google
                    </button>

                    <p className="auth-footer">
                        Don&apos;t have an account? <Link to="/register">Create one</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
