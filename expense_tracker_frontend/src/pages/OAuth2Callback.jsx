import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import './OAuth2Callback.css';

function OAuth2Callback() {
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                    atob(base64)
                        .split('')
                        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                        .join('')
                );
                const decoded = JSON.parse(jsonPayload);

                login({
                    token: token,
                    email: decoded.sub,
                    name: decoded.name,
                    role: decoded.role,
                    userId: decoded.userId
                });

                navigate('/dashboard');
            } catch {
                navigate('/login');
            }
        } else {
            navigate('/login');
        }
    }, [login, navigate]);

    return (
        <div className="oauth-callback">
            <div className="oauth-card">
                <Spinner label="Completing sign in..." />
            </div>
        </div>
    );
}

export default OAuth2Callback;
