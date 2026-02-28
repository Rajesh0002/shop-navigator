import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiPhone, FiLock, FiShoppingCart } from 'react-icons/fi';
import API from '../utils/api';

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await API.post('/auth/register', form);
            localStorage.setItem('sn_token', data.token);
            localStorage.setItem('sn_admin', JSON.stringify(data.admin));
            localStorage.setItem('sn_role', data.role || 'admin');
            toast.success('Registration successful!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Registration failed');
        }
        setLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-brand">
                    <div className="brand-icon"><FiShoppingCart /></div>
                    <h1>Shop Navigator</h1>
                    <p>Create your admin account</p>
                </div>
                <form onSubmit={handleRegister}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <div className="input-with-icon">
                            <span className="input-icon"><FiUser /></span>
                            <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <div className="input-with-icon">
                            <span className="input-icon"><FiMail /></span>
                            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="admin@shop.com" required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Phone</label>
                        <div className="input-with-icon">
                            <span className="input-icon"><FiPhone /></span>
                            <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 9876543210" />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-with-icon">
                            <span className="input-icon"><FiLock /></span>
                            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" required minLength={6} />
                        </div>
                    </div>
                    <button className="btn-primary" disabled={loading}>
                        {loading ? <><span className="spinner" /> Creating account...</> : 'Register'}
                    </button>
                </form>
                <div className="auth-link">
                    Already have an account? <Link to="/login">Login here</Link>
                </div>
            </div>
        </div>
    );
}
