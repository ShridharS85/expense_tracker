import { createContext, useContext, useState, useEffect } from 'react';
import Spinner from '../components/Spinner';
import './AuthContext.css';

const AuthContext = createContext(null);

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = parseJwt(token);
            if (decoded) {
                setUser({
                    email: decoded.sub,
                    name: decoded.name,
                    role: decoded.role,
                    userId: decoded.userId
                });
            } else {
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = (data) => {
        localStorage.setItem('token', data.token);
        setUser({
            email: data.email,
            name: data.name,
            role: data.role,
            userId: data.userId
        });
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    if (loading) {
        return (
            <div className="auth-loading">
                <Spinner label="Loading..." />
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
