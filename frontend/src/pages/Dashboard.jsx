import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiChevronRight, FiLogOut, FiShoppingCart, FiShoppingBag, FiPackage, FiTag } from 'react-icons/fi';
import API from '../utils/api';

const TYPE_COLORS = {
    supermarket: '#1a73e8',
    textile: '#9c27b0',
    electronics: '#00bcd4',
    pharmacy: '#4caf50',
    general: '#ff9800',
    other: '#607d8b'
};

export default function Dashboard() {
    const [shops, setShops] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', type: 'supermarket', address: '' });
    const [logo, setLogo] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const admin = JSON.parse(localStorage.getItem('sn_admin') || '{}');
    const role = localStorage.getItem('sn_role') || 'admin';
    const isWorker = role === 'worker';

    useEffect(() => { loadShops(); }, []);

    const loadShops = async () => {
        try {
            const { data } = await API.get('/shops');
            setShops(data);
        } catch (err) {
            toast.error('Failed to load shops');
        }
    };

    const handleCreateShop = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const fd = new FormData();
            fd.append('name', form.name);
            fd.append('type', form.type);
            fd.append('address', form.address);
            if (logo) fd.append('logo', logo);

            await API.post('/shops', fd);
            toast.success('Shop created!');
            setShowModal(false);
            setForm({ name: '', type: 'supermarket', address: '' });
            setLogo(null);
            loadShops();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to create shop');
        }
        setLoading(false);
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete "${name}"? All data will be lost.`)) return;
        try {
            await API.delete(`/shops/${id}`);
            toast.success('Shop deleted');
            loadShops();
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    const logout = () => {
        localStorage.removeItem('sn_token');
        localStorage.removeItem('sn_admin');
        localStorage.removeItem('sn_role');
        navigate('/login');
    };

    const totalProducts = shops.reduce((s, sh) => s + (sh.product_count || 0), 0);
    const totalOffers = shops.reduce((s, sh) => s + (sh.offer_count || 0), 0);

    const getInitials = (name) => name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

    return (
        <div className="dashboard">
            <div className="dash-header">
                <div className="header-left">
                    <div className="header-logo"><FiShoppingCart /></div>
                    <div>
                        <h1>Shop Navigator</h1>
                        <div className="welcome-text">Welcome, {admin.name}{isWorker ? ' (Staff)' : ''}</div>
                    </div>
                </div>
                <button className="logout-btn" onClick={logout}><FiLogOut size={14} /> Logout</button>
            </div>

            <div className="dash-content">
                {/* Stats Row */}
                <div className="stats-row">
                    <div className="stat-card">
                        <div className="stat-value">{shops.length}</div>
                        <div className="stat-label"><FiShoppingBag size={12} style={{ marginRight: 4 }} />Shops</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{totalProducts}</div>
                        <div className="stat-label"><FiPackage size={12} style={{ marginRight: 4 }} />Products</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{totalOffers}</div>
                        <div className="stat-label"><FiTag size={12} style={{ marginRight: 4 }} />Offers</div>
                    </div>
                </div>

                <div className="section-title">
                    Your Shops <span className="count-badge">{shops.length}</span>
                </div>

                <div className="shop-grid">
                    {shops.map(shop => {
                        const color = TYPE_COLORS[shop.type] || TYPE_COLORS.general;
                        return (
                            <div className="shop-card" key={shop.id} onClick={() => navigate(`/shop-manage/${shop.id}`)}>
                                <div className="card-top">
                                    <div className="shop-avatar" style={{ background: color }}>
                                        {shop.logo ? (
                                            <img src={shop.logo} alt="" />
                                        ) : (
                                            getInitials(shop.name)
                                        )}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h3>{shop.name}</h3>
                                        <div className="shop-meta">
                                            <span className="shop-type-badge" style={{ background: color + '15', color }}>{shop.type}</span>
                                            <span style={{ marginLeft: 6 }}>{shop.address || 'No address'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="shop-stats">
                                    <div className="stat">
                                        <div className="stat-num">{shop.zone_count || 0}</div>
                                        <div className="stat-label">Zones</div>
                                    </div>
                                    <div className="stat">
                                        <div className="stat-num">{shop.product_count || 0}</div>
                                        <div className="stat-label">Products</div>
                                    </div>
                                    <div className="stat">
                                        <div className="stat-num">{shop.offer_count || 0}</div>
                                        <div className="stat-label">Offers</div>
                                    </div>
                                </div>
                                {!isWorker && (
                                    <div className="card-actions">
                                        <button className="btn-delete" onClick={(e) => { e.stopPropagation(); handleDelete(shop.id, shop.name); }} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <FiTrash2 size={12} /> Delete
                                        </button>
                                    </div>
                                )}
                                <div className="card-arrow"><FiChevronRight /></div>
                            </div>
                        );
                    })}
                    {!isWorker && (
                        <div className="shop-card add-shop-card" onClick={() => setShowModal(true)}>
                            <div className="plus"><FiPlus /></div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Add New Shop</div>
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2>Create New Shop</h2>
                        <form onSubmit={handleCreateShop}>
                            <div className="form-group">
                                <label>Shop Name *</label>
                                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="My Supermarket" required />
                            </div>
                            <div className="form-group">
                                <label>Shop Type</label>
                                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                                    <option value="supermarket">Supermarket</option>
                                    <option value="textile">Textile Shop</option>
                                    <option value="electronics">Electronics</option>
                                    <option value="pharmacy">Pharmacy</option>
                                    <option value="general">General Store</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="123 Main Street" />
                            </div>
                            <div className="form-group">
                                <label>Shop Logo</label>
                                <div className="photo-upload" onClick={() => document.getElementById('logoInput').click()}>
                                    {logo ? <img src={URL.createObjectURL(logo)} alt="logo" /> : <p>Click to upload logo</p>}
                                    <input id="logoInput" type="file" accept="image/*" onChange={e => setLogo(e.target.files[0])} />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-primary btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? <><span className="spinner" /> Creating...</> : 'Create Shop'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
