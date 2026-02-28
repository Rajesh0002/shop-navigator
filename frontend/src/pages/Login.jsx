import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiShoppingCart } from 'react-icons/fi';
import API from '../utils/api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await API.post('/auth/login', { email, password });
            localStorage.setItem('sn_token', data.token);
            localStorage.setItem('sn_admin', JSON.stringify(data.admin));
            localStorage.setItem('sn_role', data.role || 'admin');
            toast.success('Login successful!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Login failed');
        }
        setLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-brand">
                    <div className="brand-icon"><FiShoppingCart /></div>
                    <h1>Shop Navigator</h1>
                    <p>Login to manage your shops</p>
                </div>
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Email</label>
                        <div className="input-with-icon">
                            <span className="input-icon"><FiMail /></span>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@shop.com" required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-with-icon">
                            <span className="input-icon"><FiLock /></span>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" required />
                        </div>
                    </div>
                    <button className="btn-primary" disabled={loading}>
                        {loading ? <><span className="spinner" /> Logging in...</> : 'Login'}
                    </button>
                </form>
                <div className="auth-link">
                    Don't have an account? <Link to="/register">Register here</Link>
                </div>
            </div>
        </div>
    );
}
