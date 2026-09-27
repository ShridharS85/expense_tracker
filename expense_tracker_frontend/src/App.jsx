import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Income from './pages/Income';
import AdminUsers from './pages/AdminUsers';
import Profile from './pages/Profile';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import OAuth2Callback from './pages/OAuth2Callback';
import './App.css';

function App() {
    const { user } = useAuth();

    return (
        <div className="app">
            {user ? (
                <div className="app-shell">
                    <Navbar />
                    <main className="app-content">
                        <div className="app-content-inner">
                        <Routes>
                            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                            <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
                            <Route path="/income" element={<ProtectedRoute><Income /></ProtectedRoute>} />
                            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                            <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
                            <Route path="*" element={<Navigate to="/dashboard" />} />
                        </Routes>
                        </div>
                    </main>
                </div>
            ) : (
                <div className="auth-shell">
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/oauth2/callback" element={<OAuth2Callback />} />
                        <Route path="*" element={<Navigate to="/login" />} />
                    </Routes>
                </div>
            )}
        </div>
    );
}

export default App;
