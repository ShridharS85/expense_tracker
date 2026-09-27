import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    ReceiptText,
    Wallet,
    ChartPie,
    UserCircle,
    Settings,
    Users,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import './Navbar.css';

function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLinkClick = () => setMenuOpen(false);

    const handleLogout = () => {
        setMenuOpen(false);
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={19} /> },
        { path: '/expenses', label: 'Expenses', icon: <ReceiptText size={19} /> },
        { path: '/income', label: 'Income', icon: <Wallet size={19} /> },
        { path: '/reports', label: 'Reports', icon: <ChartPie size={19} /> },
        { path: '/profile', label: 'Profile', icon: <UserCircle size={19} /> },
        { path: '/settings', label: 'Settings', icon: <Settings size={19} /> },
    ];

    if (user && user.role === 'ADMIN') {
        navItems.push({ path: '/admin/users', label: 'Users', icon: <Users size={19} /> });
    }

    /* Lock body scroll + close on Escape while the mobile drawer is open */
    useEffect(() => {
        if (!menuOpen) return;
        const onKey = (e) => {
            if (e.key === 'Escape') setMenuOpen(false);
        };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [menuOpen]);

    /* Close the drawer when navigating on mobile */
    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    const initials = user?.name
        ? user.name
            .split(' ')
            .map((part) => part.charAt(0))
            .slice(0, 2)
            .join('')
            .toUpperCase()
        : 'U';

    return (
        <>
            {/* Mobile top bar */}
            <header className="topbar">
                <div className="topbar-left">
                    <button
                        className="topbar-menu-btn"
                        onClick={() => setMenuOpen(true)}
                        aria-label="Open navigation menu"
                    >
                        <Menu size={22} />
                    </button>
                    <Link to="/dashboard" className="topbar-brand">
                        <span className="brand-tile brand-tile-sm">
                            <Wallet size={18} />
                        </span>
                        <span className="brand-text">ExpenseTracker</span>
                    </Link>
                </div>
                <Link to="/profile" className="topbar-avatar" aria-label="Go to profile">
                    {initials}
                </Link>
            </header>

            {/* Sidebar (desktop) / drawer (mobile) */}
            <aside className={`navbar ${menuOpen ? 'navbar-open' : ''}`} aria-label="Primary navigation">
                <div className="navbar-inner">
                    <div className="navbar-brand">
                        <Link to="/dashboard">
                            <span className="brand-tile">
                                <Wallet size={20} />
                            </span>
                            <span className="brand-text">ExpenseTracker</span>
                        </Link>
                        <button
                            className="drawer-close"
                            onClick={() => setMenuOpen(false)}
                            aria-label="Close navigation menu"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <nav className="navbar-links">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-link ${isActive(item.path) ? 'nav-link-active' : ''}`}
                                onClick={handleLinkClick}
                            >
                                <span className="nav-link-icon">{item.icon}</span>
                                <span className="nav-link-text">{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    <div className="navbar-footer">
                        <Link to="/profile" className="nav-user-section" onClick={handleLinkClick}>
                            <span className="nav-user-badge">{initials}</span>
                            <span className="nav-user-meta">
                                <span className="nav-user-name">{user?.name}</span>
                                <span className="nav-user-email">{user?.email}</span>
                            </span>
                        </Link>
                        <button className="nav-logout" onClick={handleLogout}>
                            <LogOut size={18} className="nav-logout-icon" />
                            <span className="nav-logout-text">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {menuOpen && (
                <div
                    className="navbar-overlay"
                    onClick={() => setMenuOpen(false)}
                    aria-hidden="true"
                />
            )}
        </>
    );
}

export default Navbar;
