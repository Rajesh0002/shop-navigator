import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiMapPin, FiGrid, FiPackage, FiTag, FiCamera, FiKey, FiUsers, FiInfo, FiPhone, FiClock, FiMap } from 'react-icons/fi';
import API from '../utils/api';

const ADMIN_TABS = [
    { name: 'Zones', icon: <FiMapPin /> },
    { name: 'Categories', icon: <FiGrid /> },
    { name: 'Products', icon: <FiPackage /> },
    { name: 'Offers', icon: <FiTag /> },
    { name: 'Store Info', icon: <FiInfo /> },
    { name: 'QR Code', icon: <FiCamera /> },
    { name: 'API Integration', icon: <FiKey /> },
    { name: 'Staff', icon: <FiUsers /> },
];
const WORKER_TABS = [
    { name: 'Zones', icon: <FiMapPin /> },
    { name: 'Categories', icon: <FiGrid /> },
    { name: 'Products', icon: <FiPackage /> },
    { name: 'Offers', icon: <FiTag /> },
    { name: 'QR Code', icon: <FiCamera /> },
];

const EMOJI_LIST = [
    { group: 'Fruits & Vegs', icons: ['🍎','🍌','🍇','🍊','🍋','🍒','🍓','🫐','🥝','🍑','🍍','🥭','🍈','🥑','🥕','🥦','🌽','🍅','🫑','🥒','🧅','🧄','🥬','🥔','🍆'] },
    { group: 'Food & Drinks', icons: ['🍚','🍞','🥛','🧀','🥚','🍗','🍖','🥩','🐟','🍤','🧈','🫘','🥜','🌰','🍫','🍪','🍩','🍰','🧁','🍬','🍿','🥤','🧃','☕','🍵','🥫','🍜','🍝','🍔','🌮'] },
    { group: 'Household', icons: ['🧴','🧼','🧽','🧹','🪣','🧺','🪥','🧻','🪒','💊','🩹','🏥','🧪','🪴','🕯️','💡','🔋','🔌','🪑','🛋️','🛏️','🚿','🧲','🔧','🪛'] },
    { group: 'Clothing', icons: ['👕','👖','👗','👘','👔','🧥','🧤','🧣','🧦','👒','👠','👟','👞','👜','🎒','👝','👛','🕶️','💍','⌚','👑','🧢','👙','🩱','🩳'] },
    { group: 'Electronics', icons: ['📱','💻','🖥️','⌨️','🖨️','📷','🎥','📺','🎧','🔊','🎮','🕹️','📻','💾','🔦','⏰','📡','🖲️','💿','🎙️'] },
    { group: 'Store & Places', icons: ['🏪','🏬','🛒','🛍️','📦','🏷️','💰','💳','🧾','📋','📍','🗺️','🚪','🔑','🏠','⭐','❤️','✅','🔥','✨','🎁','🎉','🎈','📌','🏆'] },
    { group: 'Spices & More', icons: ['🌶️','🧂','🫚','🍯','🥡','🫒','🥥','🌿','🍃','☘️','🌾','🌻','🌸','💐','🪻','🍄'] },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const defaultHours = () => DAYS.reduce((acc, day) => {
    acc[day] = { open: '09:00', close: '21:00', closed: false };
    return acc;
}, {});

function EmojiPicker({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filtered = search
        ? EMOJI_LIST.map(g => ({ ...g, icons: g.icons.filter(() => g.group.toLowerCase().includes(search.toLowerCase())) })).filter(g => g.icons.length > 0)
        : EMOJI_LIST;

    return (
        <div style={{ position: 'relative' }}>
            <div
                onClick={() => setOpen(!open)}
                style={{
                    width: '100%', padding: '10px 12px', border: '2px solid #e5e7eb', borderRadius: 12,
                    fontSize: '1.2rem', cursor: 'pointer', background: '#f8f9fa', display: 'flex',
                    alignItems: 'center', justifyContent: 'space-between', minHeight: 44, boxSizing: 'border-box'
                }}
            >
                <span>{value || 'Pick icon'}</span>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{open ? '▲' : '▼'}</span>
            </div>
            {open && (
                <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000,
                    background: '#fff', border: '2px solid #e5e7eb', borderRadius: 12,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)', maxHeight: 280, overflowY: 'auto',
                    padding: 10, marginTop: 4
                }}>
                    <input
                        type="text" placeholder="Search group..." value={search}
                        onChange={e => setSearch(e.target.value)} autoFocus
                        style={{ width: '100%', padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: '0.8rem', marginBottom: 8, boxSizing: 'border-box' }}
                    />
                    {filtered.map(g => (
                        <div key={g.group}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9ca3af', margin: '6px 0 4px', textTransform: 'uppercase' }}>{g.group}</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                {g.icons.map(icon => (
                                    <span
                                        key={icon}
                                        onClick={() => { onChange(icon); setOpen(false); setSearch(''); }}
                                        style={{
                                            fontSize: '1.3rem', cursor: 'pointer', padding: '4px 6px', borderRadius: 8,
                                            background: value === icon ? '#e8f0fe' : 'transparent',
                                            border: value === icon ? '2px solid #1a73e8' : '2px solid transparent',
                                            transition: 'all 0.15s'
                                        }}
                                        onMouseEnter={e => e.target.style.background = '#f3f4f6'}
                                        onMouseLeave={e => e.target.style.background = value === icon ? '#e8f0fe' : 'transparent'}
                                    >{icon}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function ShopManager() {
    const { shopId } = useParams();
    const navigate = useNavigate();
    const role = localStorage.getItem('sn_role') || 'admin';
    const isWorker = role === 'worker';
    const TABS = isWorker ? WORKER_TABS : ADMIN_TABS;

    const [shop, setShop] = useState(null);
    const [activeTab, setActiveTab] = useState('Zones');
    const [zones, setZones] = useState([]);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [offers, setOffers] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [qrData, setQrData] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState({});
    const [photo, setPhoto] = useState(null);
    const [csvFile, setCsvFile] = useState(null);

    // Store Info state
    const [shopInfo, setShopInfo] = useState({
        phone: '',
        description: '',
        opening_hours: defaultHours(),
        google_maps_url: ''
    });
    const [savingInfo, setSavingInfo] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const [shopRes, zoneRes, catRes, prodRes, offerRes] = await Promise.all([
                API.get(`/shops/${shopId}`),
                API.get(`/zones/${shopId}`),
                API.get(`/categories/${shopId}`),
                API.get(`/products/${shopId}`),
                API.get(`/offers/${shopId}`)
            ]);
            setShop(shopRes.data);
            setZones(zoneRes.data);
            setCategories(catRes.data);
            setProducts(prodRes.data);
            setOffers(offerRes.data);

            // Parse store info
            const s = shopRes.data;
            let hours = defaultHours();
            try { if (s.opening_hours) hours = JSON.parse(s.opening_hours); } catch {}
            setShopInfo({
                phone: s.phone || '',
                description: s.description || '',
                opening_hours: hours,
                google_maps_url: s.google_maps_url || ''
            });
        } catch (err) {
            toast.error('Failed to load shop data');
        }
    }, [shopId]);

    useEffect(() => { loadData(); }, [loadData]);

    const loadWorkers = async () => {
        try {
            const { data } = await API.get(`/workers/${shopId}`);
            setWorkers(data);
        } catch (err) {
            toast.error('Failed to load workers');
        }
    };

    const loadQR = async () => {
        try {
            const { data } = await API.get(`/shops/${shopId}/qr`);
            setQrData(data);
        } catch (err) {
            toast.error('Failed to generate QR');
        }
    };

    useEffect(() => { if (activeTab === 'QR Code') loadQR(); }, [activeTab]);
    useEffect(() => { if (activeTab === 'Staff' && !isWorker) loadWorkers(); }, [activeTab]);

    const saveStoreInfo = async () => {
        setSavingInfo(true);
        try {
            await API.put(`/shops/${shopId}`, {
                name: shop.name,
                type: shop.type,
                address: shop.address,
                phone: shopInfo.phone,
                description: shopInfo.description,
                opening_hours: JSON.stringify(shopInfo.opening_hours),
                google_maps_url: shopInfo.google_maps_url
            });
            toast.success('Store info saved!');
        } catch (err) {
            toast.error('Failed to save store info');
        }
        setSavingInfo(false);
    };

    const updateHours = (day, field, value) => {
        setShopInfo(prev => ({
            ...prev,
            opening_hours: {
                ...prev.opening_hours,
                [day]: { ...prev.opening_hours[day], [field]: value }
            }
        }));
    };

    const openAdd = (type) => {
        setModalType(type);
        setEditItem(null);
        setPhoto(null);
        if (type === 'zone') setForm({ name: '', icon: '📍', color: '#2196f3', position_row: '', position_col: '', description: '' });
        else if (type === 'category') setForm({ name: '', icon: '📦', color: '#666666' });
        else if (type === 'product') setForm({ name: '', zone_id: '', category_id: '', icon: '📦', description: '', price: '' });
        else if (type === 'offer') setForm({ title: '', description: '', discount_percent: '', start_date: '', end_date: '' });
        else if (type === 'worker') setForm({ name: '', email: '', password: '', phone: '' });
        setShowModal(true);
    };

    const openEdit = (type, item) => {
        setModalType(type);
        setEditItem(item);
        setPhoto(null);
        setForm({ ...item });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (modalType === 'worker') {
                await API.post(`/workers/${shopId}`, form);
                toast.success('Worker created!');
                setShowModal(false);
                loadWorkers();
                return;
            }

            const fd = new FormData();
            Object.keys(form).forEach(k => {
                if (form[k] !== null && form[k] !== undefined && k !== 'id' && !k.includes('_name') && !k.includes('_icon') && !k.includes('_color') && k !== 'product_count')
                    fd.append(k, form[k]);
            });
            if (photo) fd.append('photo', photo);

            const routes = { zone: 'zones', category: 'categories', product: 'products', offer: 'offers' };
            const route = routes[modalType];

            if (editItem) {
                await API.put(`/${route}/update/${editItem.id}`, fd);
                toast.success(`${modalType} updated!`);
            } else {
                await API.post(`/${route}/${shopId}`, fd);
                toast.success(`${modalType} added!`);
            }
            setShowModal(false);
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Save failed');
        }
    };

    const handleDelete = async (type, id) => {
        if (!window.confirm(`Delete this ${type}?`)) return;
        try {
            const routes = { zone: 'zones', category: 'categories', product: 'products', offer: 'offers' };
            await API.delete(`/${routes[type]}/delete/${id}`);
            toast.success(`${type} deleted`);
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Delete failed');
        }
    };

    const handleDeleteWorker = async (id, name) => {
        if (!window.confirm(`Remove worker "${name}"? They will no longer be able to login.`)) return;
        try {
            await API.delete(`/workers/delete/${id}`);
            toast.success('Worker removed');
            loadWorkers();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to remove worker');
        }
    };

    const handleBulkImport = async () => {
        if (!csvFile) return toast.error('Select a CSV file');
        const fd = new FormData();
        fd.append('file', csvFile);
        try {
            const { data } = await API.post(`/products/${shopId}/bulk-import`, fd);
            toast.success(data.message);
            setCsvFile(null);
            loadData();
        } catch (err) {
            toast.error('Import failed');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied!');
    };

    if (!shop) return <div className="empty-state"><div className="empty-icon">&#9203;</div><p>Loading...</p></div>;

    return (
        <div className="manager">
            <div className="manager-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button className="back-btn" onClick={() => navigate('/dashboard')}>
                        <FiArrowLeft size={14} /> Back
                    </button>
                    <div>
                        <h2 style={{ fontSize: '1.1rem' }}>{shop.name}</h2>
                        <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{shop.type}{isWorker ? ' (Staff access)' : ''}</span>
                    </div>
                </div>
            </div>

            <div className="manager-tabs">
                {TABS.map(tab => (
                    <button key={tab.name} className={activeTab === tab.name ? 'active' : ''} onClick={() => setActiveTab(tab.name)}>
                        <span className="tab-icon">{tab.icon}</span>
                        {tab.name}
                    </button>
                ))}
            </div>

            <div className="tab-content">
                {/* ZONES TAB */}
                {activeTab === 'Zones' && (
                    <div>
                        <div className="section-header">
                            <h2>Zones / Aisles ({zones.length})</h2>
                            <button className="btn-add" onClick={() => openAdd('zone')}><FiMapPin size={14} /> Add Zone</button>
                        </div>
                        {zones.length === 0 && <div className="empty-state"><div className="empty-icon">&#128506;</div><p>No zones yet. Add your first zone!</p></div>}
                        {zones.map(z => (
                            <div className="item-card" key={z.id}>
                                {z.photo ? (
                                    <img src={`${z.photo}`} alt={z.name} />
                                ) : (
                                    <div className="item-icon" style={{ background: z.color + '20', color: z.color }}>{z.icon}</div>
                                )}
                                <div className="item-info">
                                    <div className="item-name">{z.name}</div>
                                    <div className="item-meta">{z.product_count || 0} products &bull; Row: {z.position_row || '-'} Col: {z.position_col || '-'}</div>
                                </div>
                                <div className="item-actions">
                                    <button className="btn-edit" onClick={() => openEdit('zone', z)}>Edit</button>
                                    {!isWorker && <button className="btn-delete" onClick={() => handleDelete('zone', z.id)}>Delete</button>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* CATEGORIES TAB */}
                {activeTab === 'Categories' && (
                    <div>
                        <div className="section-header">
                            <h2>Categories ({categories.length})</h2>
                            <button className="btn-add" onClick={() => openAdd('category')}><FiGrid size={14} /> Add Category</button>
                        </div>
                        {categories.length === 0 && <div className="empty-state"><div className="empty-icon">&#128193;</div><p>No categories yet.</p></div>}
                        {categories.map(c => (
                            <div className="item-card" key={c.id}>
                                <div className="item-icon" style={{ background: c.color + '20', color: c.color }}>{c.icon}</div>
                                <div className="item-info">
                                    <div className="item-name">{c.name}</div>
                                    <div className="item-meta">{c.product_count || 0} products</div>
                                </div>
                                <div className="item-actions">
                                    <button className="btn-edit" onClick={() => openEdit('category', c)}>Edit</button>
                                    {!isWorker && <button className="btn-delete" onClick={() => handleDelete('category', c.id)}>Delete</button>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* PRODUCTS TAB */}
                {activeTab === 'Products' && (
                    <div>
                        <div className="section-header">
                            <h2>Products ({products.length})</h2>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button className="btn-add" onClick={() => openAdd('product')}><FiPackage size={14} /> Add Product</button>
                            </div>
                        </div>
                        <div style={{ background: 'white', padding: 14, borderRadius: 12, marginBottom: 14, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 8 }}>Bulk Import (CSV)</div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <input type="file" accept=".csv" onChange={e => setCsvFile(e.target.files[0])} style={{ fontSize: '0.8rem' }} />
                                <button className="btn-add" onClick={handleBulkImport}>Import</button>
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 6 }}>CSV columns: name, zone_name, category_name, icon, description, price</div>
                        </div>
                        {products.length === 0 && <div className="empty-state"><div className="empty-icon">&#128230;</div><p>No products yet.</p></div>}
                        {products.map(p => (
                            <div className="item-card" key={p.id}>
                                {p.photo ? (
                                    <img src={`${p.photo}`} alt={p.name} />
                                ) : (
                                    <div className="item-icon" style={{ background: (p.zone_color || '#999') + '20' }}>{p.icon}</div>
                                )}
                                <div className="item-info">
                                    <div className="item-name">{p.name}</div>
                                    <div className="item-meta">
                                        {p.zone_name || 'No zone'} &bull; {p.category_name || 'No category'}
                                        {p.price ? ` • ₹${p.price}` : ''}
                                    </div>
                                </div>
                                <div className="item-actions">
                                    <button className="btn-edit" onClick={() => openEdit('product', p)}>Edit</button>
                                    {!isWorker && <button className="btn-delete" onClick={() => handleDelete('product', p.id)}>Delete</button>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* OFFERS TAB */}
                {activeTab === 'Offers' && (
                    <div>
                        <div className="section-header">
                            <h2>Offers & Deals ({offers.length})</h2>
                            <button className="btn-add" onClick={() => openAdd('offer')}><FiTag size={14} /> Add Offer</button>
                        </div>
                        {offers.length === 0 && <div className="empty-state"><div className="empty-icon">&#127873;</div><p>No offers yet. Add offers to show on customer page!</p></div>}
                        {offers.map(o => (
                            <div className="item-card" key={o.id}>
                                {o.photo ? (
                                    <img src={`${o.photo}`} alt={o.title} />
                                ) : (
                                    <div className="item-icon" style={{ background: '#fff3e020', color: '#ff9800' }}>&#127873;</div>
                                )}
                                <div className="item-info">
                                    <div className="item-name">{o.title}</div>
                                    <div className="item-meta">
                                        {o.discount_percent ? `${o.discount_percent}% OFF` : ''} &bull;
                                        {o.is_active ? ' Active' : ' Inactive'} &bull;
                                        {o.start_date || 'No start'} to {o.end_date || 'No end'}
                                    </div>
                                </div>
                                <div className="item-actions">
                                    <button className="btn-edit" onClick={() => openEdit('offer', o)}>Edit</button>
                                    {!isWorker && <button className="btn-delete" onClick={() => handleDelete('offer', o.id)}>Delete</button>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* STORE INFO TAB */}
                {activeTab === 'Store Info' && (
                    <div className="store-info-form">
                        <div className="info-section">
                            <div className="info-section-title"><FiPhone /> Contact & Details</div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input value={shopInfo.phone} onChange={e => setShopInfo({...shopInfo, phone: e.target.value})} placeholder="+91 9876543210" />
                            </div>
                            <div className="form-group">
                                <label>Store Description</label>
                                <textarea value={shopInfo.description} onChange={e => setShopInfo({...shopInfo, description: e.target.value})} placeholder="Brief description of your store..." rows={3} style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 12, fontSize: '0.9rem', fontFamily: 'inherit', background: '#f8f9fa', resize: 'vertical' }} />
                            </div>
                        </div>

                        <div className="info-section">
                            <div className="info-section-title"><FiMap /> Google Maps</div>
                            <div className="form-group">
                                <label>Google Maps URL</label>
                                <input value={shopInfo.google_maps_url} onChange={e => setShopInfo({...shopInfo, google_maps_url: e.target.value})} placeholder="https://maps.google.com/..." />
                            </div>
                        </div>

                        <div className="info-section">
                            <div className="info-section-title"><FiClock /> Opening Hours</div>
                            <div className="hours-grid">
                                {DAYS.map(day => (
                                    <div className="hours-row" key={day}>
                                        <div className="day-label">{day}</div>
                                        {shopInfo.opening_hours[day]?.closed ? (
                                            <span className="hours-closed-label">Closed</span>
                                        ) : (
                                            <>
                                                <input type="time" value={shopInfo.opening_hours[day]?.open || '09:00'} onChange={e => updateHours(day, 'open', e.target.value)} />
                                                <span className="hours-separator">to</span>
                                                <input type="time" value={shopInfo.opening_hours[day]?.close || '21:00'} onChange={e => updateHours(day, 'close', e.target.value)} />
                                            </>
                                        )}
                                        <label style={{ marginLeft: 'auto' }}>
                                            <input type="checkbox" checked={shopInfo.opening_hours[day]?.closed || false} onChange={e => updateHours(day, 'closed', e.target.checked)} />
                                            {' '}Closed
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button className="btn-primary" onClick={saveStoreInfo} disabled={savingInfo} style={{ marginTop: 8 }}>
                            {savingInfo ? <><span className="spinner" /> Saving...</> : 'Save Store Info'}
                        </button>
                    </div>
                )}

                {/* QR CODE TAB */}
                {activeTab === 'QR Code' && (
                    <div className="qr-container">
                        <h2><FiCamera style={{ verticalAlign: 'middle', marginRight: 8 }} />QR Code for Customers</h2>
                        <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '8px 0' }}>Print this and place at your shop entrance</p>
                        {qrData ? (
                            <>
                                <img src={qrData.qr} alt="QR Code" style={{ width: 250, height: 250 }} />
                                <div className="qr-url">{qrData.url}</div>
                                <div style={{ marginTop: 16, display: 'flex', gap: 10, justifyContent: 'center' }}>
                                    <button className="btn-add" onClick={() => copyToClipboard(qrData.url)}>Copy Link</button>
                                    <button className="btn-add" onClick={() => {
                                        const w = window.open('', '_blank');
                                        w.document.write(`<html><head><title>QR - ${shop.name}</title><style>body{text-align:center;padding:40px;font-family:Inter,Arial,sans-serif}</style></head><body><h1>${shop.name}</h1><p>Scan to navigate our store!</p><img src="${qrData.qr}" width="300"><p style="margin-top:20px"><b>Find any product instantly</b></p><p>No app needed</p></body></html>`);
                                        w.print();
                                    }}>Print QR</button>
                                </div>
                            </>
                        ) : <p>Loading QR code...</p>}
                    </div>
                )}

                {/* API INTEGRATION TAB (admin only) */}
                {activeTab === 'API Integration' && !isWorker && (
                    <div>
                        <div style={{ background: 'white', padding: 20, borderRadius: 16, marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6' }}>
                            <h3 style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}><FiKey /> API Key</h3>
                            <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: 10 }}>Use this key in your existing software to sync products and zones.</p>
                            <div className="api-key-box">{shop.api_key}</div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button className="copy-btn" onClick={() => copyToClipboard(shop.api_key)}>Copy Key</button>
                                <button className="copy-btn" style={{ background: '#fef2f2', color: '#ef4444' }} onClick={async () => {
                                    if (window.confirm('Regenerate API key? Old key will stop working.')) {
                                        const { data } = await API.post(`/shops/${shopId}/regenerate-key`);
                                        setShop({ ...shop, api_key: data.api_key });
                                        toast.success('New API key generated');
                                    }
                                }}>Regenerate</button>
                            </div>
                        </div>

                        <div style={{ background: 'white', padding: 20, borderRadius: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6' }}>
                            <h3 style={{ marginBottom: 12 }}>API Endpoints</h3>
                            <div style={{ fontSize: '0.8rem', lineHeight: 2.2, fontFamily: 'monospace' }}>
                                <div style={{ background: '#f8f9fa', padding: '8px 12px', borderRadius: 8, marginBottom: 8 }}>
                                    <b>Sync Products (POST)</b><br />
                                    <code>POST /api/integration/sync-products</code><br />
                                    Header: <code>x-api-key: YOUR_KEY</code><br />
                                    Body: <code>{`{"products": [{"name":"Rice","zone_name":"Grains","price":120}]}`}</code>
                                </div>
                                <div style={{ background: '#f8f9fa', padding: '8px 12px', borderRadius: 8, marginBottom: 8 }}>
                                    <b>Sync Zones (POST)</b><br />
                                    <code>POST /api/integration/sync-zones</code><br />
                                    Body: <code>{`{"zones": [{"name":"Aisle 1","icon":"🏪","color":"#4caf50"}]}`}</code>
                                </div>
                                <div style={{ background: '#f8f9fa', padding: '8px 12px', borderRadius: 8, marginBottom: 8 }}>
                                    <b>Get Products (GET)</b><br />
                                    <code>GET /api/integration/products?api_key=YOUR_KEY</code>
                                </div>
                                <div style={{ background: '#f8f9fa', padding: '8px 12px', borderRadius: 8 }}>
                                    <b>Get Zones (GET)</b><br />
                                    <code>GET /api/integration/zones?api_key=YOUR_KEY</code>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STAFF TAB (admin only) */}
                {activeTab === 'Staff' && !isWorker && (
                    <div>
                        <div className="section-header">
                            <h2>Staff / Workers ({workers.length})</h2>
                            <button className="btn-add" onClick={() => openAdd('worker')}><FiUsers size={14} /> Add Worker</button>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: 14 }}>
                            Workers can add and edit products, zones, categories, and offers. They cannot delete items or access API settings.
                        </p>
                        {workers.length === 0 && <div className="empty-state"><div className="empty-icon">&#128100;</div><p>No workers yet. Add staff members to help manage your shop!</p></div>}
                        {workers.map(w => (
                            <div className="item-card" key={w.id}>
                                <div className="item-icon" style={{ background: '#e8f0fe', color: '#1a73e8', fontSize: '1.2rem' }}>&#128100;</div>
                                <div className="item-info">
                                    <div className="item-name">{w.name}</div>
                                    <div className="item-meta">{w.email}{w.phone ? ` • ${w.phone}` : ''}</div>
                                </div>
                                <div className="item-actions">
                                    <button className="btn-delete" onClick={() => handleDeleteWorker(w.id, w.name)}>Remove</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ADD/EDIT MODAL */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2>{editItem ? 'Edit' : 'Add'} {modalType}</h2>
                        <form onSubmit={handleSave}>
                            {/* Zone Form */}
                            {modalType === 'zone' && <>
                                <div className="form-group">
                                    <label>Zone Name *</label>
                                    <input value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g., Fresh Produce" required />
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Icon</label>
                                        <EmojiPicker value={form.icon || ''} onChange={icon => setForm({...form, icon})} />
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Color</label>
                                        <input type="color" value={form.color || '#2196f3'} onChange={e => setForm({...form, color: e.target.value})} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Grid Row (e.g., 2/3)</label>
                                        <input value={form.position_row || ''} onChange={e => setForm({...form, position_row: e.target.value})} placeholder="2/3" />
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Grid Col (e.g., 1/2)</label>
                                        <input value={form.position_col || ''} onChange={e => setForm({...form, position_col: e.target.value})} placeholder="1/2" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} placeholder="Optional description" rows={2} style={{ width: '100%', padding: 10, border: '2px solid #e5e7eb', borderRadius: 12, fontSize: '0.9rem', fontFamily: 'inherit', background: '#f8f9fa' }} />
                                </div>
                                <div className="form-group">
                                    <label>Zone Photo</label>
                                    <div className="photo-upload" onClick={() => document.getElementById('photoInput').click()}>
                                        {photo ? <img src={URL.createObjectURL(photo)} alt="preview" /> :
                                         form.photo ? <img src={`${form.photo}`} alt="current" /> :
                                         <p>Click to upload zone photo</p>}
                                        <input id="photoInput" type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])} />
                                    </div>
                                </div>
                            </>}

                            {/* Category Form */}
                            {modalType === 'category' && <>
                                <div className="form-group">
                                    <label>Category Name *</label>
                                    <input value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g., Fruits & Vegetables" required />
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Icon</label>
                                        <EmojiPicker value={form.icon || ''} onChange={icon => setForm({...form, icon})} />
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Color</label>
                                        <input type="color" value={form.color || '#666666'} onChange={e => setForm({...form, color: e.target.value})} />
                                    </div>
                                </div>
                            </>}

                            {/* Product Form */}
                            {modalType === 'product' && <>
                                <div className="form-group">
                                    <label>Product Name *</label>
                                    <input value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g., Basmati Rice" required />
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Zone</label>
                                        <select value={form.zone_id || ''} onChange={e => setForm({...form, zone_id: e.target.value})}>
                                            <option value="">Select Zone</option>
                                            {zones.map(z => <option key={z.id} value={z.id}>{z.icon} {z.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Category</label>
                                        <select value={form.category_id || ''} onChange={e => setForm({...form, category_id: e.target.value})}>
                                            <option value="">Select Category</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Icon</label>
                                        <EmojiPicker value={form.icon || ''} onChange={icon => setForm({...form, icon})} />
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Price</label>
                                        <input type="number" value={form.price || ''} onChange={e => setForm({...form, price: e.target.value})} placeholder="₹0" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <input value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} placeholder="Optional" />
                                </div>
                                <div className="form-group">
                                    <label>Product Photo</label>
                                    <div className="photo-upload" onClick={() => document.getElementById('photoInput').click()}>
                                        {photo ? <img src={URL.createObjectURL(photo)} alt="preview" /> :
                                         form.photo ? <img src={`${form.photo}`} alt="current" /> :
                                         <p>Click to upload product photo</p>}
                                        <input id="photoInput" type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])} />
                                    </div>
                                </div>
                            </>}

                            {/* Offer Form */}
                            {modalType === 'offer' && <>
                                <div className="form-group">
                                    <label>Offer Title *</label>
                                    <input value={form.title || ''} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g., 50% OFF on all Snacks!" required />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <input value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} placeholder="Limited time offer" />
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Discount %</label>
                                        <input type="number" value={form.discount_percent || ''} onChange={e => setForm({...form, discount_percent: e.target.value})} placeholder="50" />
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Active</label>
                                        <select value={form.is_active !== undefined ? form.is_active : 1} onChange={e => setForm({...form, is_active: e.target.value})}>
                                            <option value={1}>Active</option>
                                            <option value={0}>Inactive</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Start Date</label>
                                        <input type="date" value={form.start_date || ''} onChange={e => setForm({...form, start_date: e.target.value})} />
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>End Date</label>
                                        <input type="date" value={form.end_date || ''} onChange={e => setForm({...form, end_date: e.target.value})} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Offer Banner Image</label>
                                    <div className="photo-upload" onClick={() => document.getElementById('photoInput').click()}>
                                        {photo ? <img src={URL.createObjectURL(photo)} alt="preview" /> :
                                         form.photo ? <img src={`${form.photo}`} alt="current" /> :
                                         <p>Click to upload offer banner</p>}
                                        <input id="photoInput" type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])} />
                                    </div>
                                </div>
                            </>}

                            {/* Worker Form */}
                            {modalType === 'worker' && <>
                                <div className="form-group">
                                    <label>Name *</label>
                                    <input value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} placeholder="Worker name" required />
                                </div>
                                <div className="form-group">
                                    <label>Email *</label>
                                    <input type="email" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} placeholder="worker@shop.com" required />
                                </div>
                                <div className="form-group">
                                    <label>Password *</label>
                                    <input type="password" value={form.password || ''} onChange={e => setForm({...form, password: e.target.value})} placeholder="Set a password" required />
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Optional" />
                                </div>
                            </>}

                            <div className="modal-actions">
                                <button type="button" className="btn-primary btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">{editItem ? 'Update' : modalType === 'worker' ? 'Create Worker' : 'Add'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
