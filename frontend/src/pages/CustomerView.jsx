import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FiSearch, FiShoppingCart, FiInfo, FiX, FiCheck, FiMapPin, FiPhone, FiClock, FiNavigation, FiPlus, FiTrash2, FiChevronRight, FiPackage } from 'react-icons/fi';

const API_BASE = '';
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getStorageKey(shopId) {
    return `sn_cart_${shopId}`;
}

function loadCart(shopId) {
    try {
        const raw = localStorage.getItem(getStorageKey(shopId));
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

function saveCart(shopId, items) {
    localStorage.setItem(getStorageKey(shopId), JSON.stringify(items));
}

function formatTime12(t) {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hr = parseInt(h);
    const ampm = hr >= 12 ? 'PM' : 'AM';
    const hr12 = hr % 12 || 12;
    return `${hr12}:${m} ${ampm}`;
}

function getTodayHours(hours) {
    if (!hours) return null;
    const today = DAYS[new Date().getDay()];
    const todayH = hours[today];
    if (!todayH) return null;
    if (todayH.closed) return { day: today, status: 'Closed', text: 'Closed today' };
    return { day: today, status: 'Open', text: `${formatTime12(todayH.open)} - ${formatTime12(todayH.close)}` };
}

export default function CustomerView() {
    const { shopId } = useParams();
    const [data, setData] = useState(null);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [highlightZones, setHighlightZones] = useState([]);
    const [selectedZone, setSelectedZone] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [error, setError] = useState(null);

    // Shopping list
    const [cart, setCart] = useState([]);
    const [cartOpen, setCartOpen] = useState(false);

    // Product detail
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Store info modal
    const [showStoreInfo, setShowStoreInfo] = useState(false);

    // Touch support for offers
    const [touchStart, setTouchStart] = useState(null);

    const loadShop = useCallback(async () => {
        try {
            const { data: res } = await axios.get(`${API_BASE}/api/customer/shop/${shopId}`);
            setData(res);
        } catch (err) {
            setError('Shop not found or unavailable');
        }
    }, [shopId]);

    useEffect(() => { loadShop(); }, [loadShop]);
    useEffect(() => { setCart(loadCart(shopId)); }, [shopId]);

    // Auto-slide offers
    useEffect(() => {
        if (!data || data.offers.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % data.offers.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [data]);

    // Cart helpers
    const addToCart = (product) => {
        const exists = cart.find(c => c.id === product.id);
        if (exists) return;
        const newCart = [...cart, {
            id: product.id,
            name: product.name,
            icon: product.icon,
            zone_name: product.zone_name,
            zone_id: product.zone_id,
            zone_color: product.zone_color,
            found: false
        }];
        setCart(newCart);
        saveCart(shopId, newCart);
    };

    const removeFromCart = (productId) => {
        const newCart = cart.filter(c => c.id !== productId);
        setCart(newCart);
        saveCart(shopId, newCart);
    };

    const toggleFound = (productId) => {
        const newCart = cart.map(c => c.id === productId ? { ...c, found: !c.found } : c);
        setCart(newCart);
        saveCart(shopId, newCart);
    };

    const clearFound = () => {
        const newCart = cart.filter(c => !c.found);
        setCart(newCart);
        saveCart(shopId, newCart);
    };

    const foundCount = cart.filter(c => c.found).length;
    const progressPct = cart.length > 0 ? Math.round((foundCount / cart.length) * 100) : 0;

    // Group cart by zone
    const cartByZone = cart.reduce((acc, item) => {
        const zone = item.zone_name || 'Other';
        if (!acc[zone]) acc[zone] = [];
        acc[zone].push(item);
        return acc;
    }, {});

    // Touch handlers for offer swipe
    const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX);
    const handleTouchEnd = (e) => {
        if (touchStart === null || !data) return;
        const diff = touchStart - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) setCurrentSlide(prev => (prev + 1) % data.offers.length);
            else setCurrentSlide(prev => (prev - 1 + data.offers.length) % data.offers.length);
        }
        setTouchStart(null);
    };

    if (error) return (
        <div className="customer-page">
            <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>
                <div style={{ fontSize: '3rem', opacity: 0.5 }}>&#128533;</div>
                <h2 style={{ marginTop: 12, color: '#6b7280' }}>{error}</h2>
            </div>
        </div>
    );

    if (!data) return (
        <div className="customer-page">
            <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>
                <div className="spinner spinner-dark" style={{ width: 32, height: 32, borderWidth: 3 }} />
                <p style={{ marginTop: 12 }}>Loading store...</p>
            </div>
        </div>
    );

    const { shop, zones, categories, products, offers } = data;

    let parsedHours = null;
    try { if (shop.opening_hours) parsedHours = JSON.parse(shop.opening_hours); } catch {}
    const todayInfo = getTodayHours(parsedHours);

    const filteredProducts = products.filter(p => {
        const matchCat = activeCategory === 'all' || p.category_id === parseInt(activeCategory);
        const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    const handleSearch = (q) => {
        setSearch(q);
        if (q) {
            const matched = products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
            setHighlightZones([...new Set(matched.map(p => p.zone_id))]);
        } else {
            setHighlightZones([]);
        }
    };

    const handleCategoryFilter = (catId) => {
        setActiveCategory(catId);
        if (catId !== 'all') {
            const matched = products.filter(p => p.category_id === parseInt(catId));
            setHighlightZones([...new Set(matched.map(p => p.zone_id))]);
        } else {
            setHighlightZones([]);
        }
    };

    const locateProduct = (zoneId) => {
        setHighlightZones([zoneId]);
        document.querySelector('.store-map-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    const maxRow = zones.length > 0
        ? Math.max(...zones.filter(z => z.position_row).map(z => parseInt(z.position_row.split('/')[1]) || 4), 4)
        : 4;

    // Similar products for detail modal
    const getSimilarProducts = (product) => {
        return products
            .filter(p => p.id !== product.id && (p.category_id === product.category_id || p.zone_id === product.zone_id))
            .slice(0, 6);
    };

    const isInCart = (productId) => cart.some(c => c.id === productId);

    return (
        <div className="customer-page">
            {/* Header */}
            <div className="customer-header">
                <div className="header-content">
                    <div className="header-left">
                        {shop.logo ? (
                            <img src={`${API_BASE}${shop.logo}`} alt="" className="shop-logo" />
                        ) : (
                            <div className="shop-logo-fallback"><FiShoppingCart /></div>
                        )}
                        <div style={{ minWidth: 0 }}>
                            <h1>{shop.name}</h1>
                            <div className="shop-subtitle">{shop.address || shop.type}</div>
                        </div>
                    </div>
                    <div className="header-right">
                        {(shop.phone || parsedHours) && (
                            <button className="header-btn" onClick={() => setShowStoreInfo(true)} title="Store Info">
                                <FiInfo />
                            </button>
                        )}
                        <button className="header-btn" onClick={() => setCartOpen(true)} title="Shopping List">
                            <FiShoppingCart />
                            {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Offers Slider */}
            {offers.length > 0 && (
                <div style={{ padding: '12px 20px 0' }}>
                    <div className="offer-slider" style={{ position: 'relative', height: 180 }}
                        onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                        {offers.map((offer, i) => (
                            <div key={offer.id} className={`offer-slide ${i === currentSlide ? 'active' : ''}`} style={{ position: i === currentSlide ? 'relative' : 'absolute' }}>
                                {offer.photo ? (
                                    <img src={`${API_BASE}${offer.photo}`} alt={offer.title} />
                                ) : (
                                    <div style={{ width: '100%', height: 180, background: 'linear-gradient(135deg, #f59e0b, #ef4444)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <div style={{ textAlign: 'center', color: 'white' }}>
                                            <div style={{ fontSize: '2rem' }}>&#127873;</div>
                                            {offer.discount_percent && <div style={{ fontSize: '2rem', fontWeight: 800 }}>{offer.discount_percent}% OFF</div>}
                                        </div>
                                    </div>
                                )}
                                <div className="offer-overlay">
                                    <div style={{ fontWeight: 700 }}>{offer.title}</div>
                                    {offer.description && <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>{offer.description}</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                    {offers.length > 1 && (
                        <div className="offer-dots">
                            {offers.map((_, i) => <span key={i} className={`dot ${i === currentSlide ? 'active' : ''}`} onClick={() => setCurrentSlide(i)} />)}
                        </div>
                    )}
                </div>
            )}

            {/* Store Info Quick Card */}
            {(shop.phone || todayInfo) && (
                <div className="store-info-section">
                    <div className="store-info-card" onClick={() => setShowStoreInfo(true)}>
                        <div className="info-icon" style={todayInfo?.status === 'Closed' ? { background: '#fef2f2', color: '#ef4444' } : {}}>
                            <FiClock />
                        </div>
                        <div className="info-details">
                            {todayInfo && (
                                <>
                                    <div className="info-status" style={todayInfo.status === 'Closed' ? { color: '#ef4444' } : {}}>
                                        {todayInfo.status === 'Open' ? 'Open Now' : 'Closed'}
                                    </div>
                                    <div className="info-hours">{todayInfo.text}</div>
                                </>
                            )}
                            {!todayInfo && shop.phone && (
                                <div className="info-status">{shop.phone}</div>
                            )}
                        </div>
                        <div className="info-actions">
                            {shop.phone && (
                                <a href={`tel:${shop.phone}`} className="info-action-btn" onClick={e => e.stopPropagation()} title="Call">
                                    <FiPhone />
                                </a>
                            )}
                            {shop.google_maps_url && (
                                <a href={shop.google_maps_url} target="_blank" rel="noopener noreferrer" className="info-action-btn" onClick={e => e.stopPropagation()} title="Directions">
                                    <FiNavigation />
                                </a>
                            )}
                            <button className="info-action-btn"><FiChevronRight /></button>
                        </div>
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="customer-search">
                <div className="search-wrapper">
                    <span className="s-icon"><FiSearch /></span>
                    <input
                        type="text" value={search}
                        onChange={e => handleSearch(e.target.value)}
                        placeholder="Search products..."
                    />
                </div>
                {search && <div className="search-results-count"><FiSearch size={12} /> Found {filteredProducts.length} products</div>}
            </div>

            {/* Categories as Grid */}
            {categories.length > 0 && (
                <div className="categories-section">
                    <h3>Categories</h3>
                    <div className="category-grid">
                        <div className={`cat-card ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => handleCategoryFilter('all')}>
                            <span className="cat-icon">&#128722;</span>
                            <div className="cat-name">All</div>
                        </div>
                        {categories.map(c => (
                            <div key={c.id}
                                className={`cat-card ${activeCategory === String(c.id) ? 'active' : ''}`}
                                onClick={() => handleCategoryFilter(String(c.id))}>
                                <span className="cat-icon">{c.icon}</span>
                                <div className="cat-name">{c.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Store Map */}
            {zones.length > 0 && (
                <div className="store-map-section">
                    <h2><FiMapPin size={16} /> Store Map</h2>
                    <div className="map-container">
                        <div className="map-grid" style={{
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gridTemplateRows: `repeat(${maxRow - 1}, 75px)`,
                            minWidth: 340
                        }}>
                            {zones.map(zone => {
                                const isHighlight = highlightZones.includes(zone.id);
                                return (
                                    <div key={zone.id} className={`map-zone ${isHighlight ? 'highlight' : ''}`}
                                        style={{
                                            gridRow: zone.position_row || 'auto',
                                            gridColumn: zone.position_col || 'auto',
                                            background: isHighlight ? zone.color + '30' : zone.color + '15',
                                            color: zone.color,
                                            borderColor: isHighlight ? '#f59e0b' : 'transparent'
                                        }}
                                        onClick={() => setSelectedZone(zone)}>
                                        {zone.photo ? (
                                            <img src={`${API_BASE}${zone.photo}`} alt={zone.name} className="zone-photo" />
                                        ) : (
                                            <div className="zone-icon">{zone.icon}</div>
                                        )}
                                        <div className="zone-name">{zone.name}</div>
                                        <div className="zone-label">{zone.product_count} items</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Products */}
            <div className="product-section">
                <div className="section-label">
                    <FiPackage size={16} /> Products
                    <span className="product-count">{filteredProducts.length}</span>
                </div>
                {filteredProducts.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">&#128269;</div>
                        <p>No products found</p>
                    </div>
                )}
                {filteredProducts.map(p => (
                    <div key={p.id} className={`product-card ${highlightZones.includes(p.zone_id) ? 'highlight' : ''}`}
                        onClick={() => setSelectedProduct(p)}>
                        {p.photo ? (
                            <img src={`${API_BASE}${p.photo}`} alt={p.name} />
                        ) : (
                            <div className="p-icon" style={{ background: (p.zone_color || '#9ca3af') + '15' }}>{p.icon}</div>
                        )}
                        <div className="p-info">
                            <div className="p-name">{p.name}</div>
                            <div className="p-location">
                                <FiMapPin size={11} /> {p.zone_name || 'Unknown zone'}
                            </div>
                            {p.price && <div className="p-price">&#8377;{p.price}</div>}
                        </div>
                        <div className="p-actions">
                            <button className="p-action-btn locate-btn" onClick={(e) => { e.stopPropagation(); locateProduct(p.zone_id); }} title="Locate">
                                <FiMapPin size={12} />
                            </button>
                            <button className="p-action-btn" onClick={(e) => { e.stopPropagation(); addToCart(p); }} title="Add to list"
                                style={isInCart(p.id) ? { background: '#ecfdf5', color: '#10b981', borderColor: '#10b981' } : {}}>
                                {isInCart(p.id) ? <FiCheck size={12} /> : <FiPlus size={12} />}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="customer-footer">
                Powered by <a href="/">Shop Navigator</a>
            </div>

            {/* Product Detail Modal */}
            {selectedProduct && (
                <div className="product-detail-overlay" onClick={() => setSelectedProduct(null)}>
                    <div className="product-detail-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-handle" />
                        {selectedProduct.photo ? (
                            <img src={`${API_BASE}${selectedProduct.photo}`} alt={selectedProduct.name} className="pd-image" />
                        ) : (
                            <div className="pd-icon-placeholder">{selectedProduct.icon}</div>
                        )}
                        <div className="pd-content">
                            <div className="pd-name">{selectedProduct.name}</div>
                            <div className="pd-category">
                                {selectedProduct.category_icon} {selectedProduct.category_name || 'Uncategorized'}
                            </div>
                            {selectedProduct.price && (
                                <div className="pd-price">&#8377;{selectedProduct.price}</div>
                            )}
                            {selectedProduct.description && (
                                <div className="pd-description">{selectedProduct.description}</div>
                            )}

                            {/* Location Link */}
                            {selectedProduct.zone_name && (
                                <div className="pd-location" onClick={() => { setSelectedProduct(null); locateProduct(selectedProduct.zone_id); }}>
                                    <div className="loc-icon"><FiMapPin /></div>
                                    <div>
                                        <div className="loc-text">{selectedProduct.zone_icon} {selectedProduct.zone_name}</div>
                                        <div className="loc-hint">Tap to locate on store map</div>
                                    </div>
                                    <FiChevronRight style={{ color: '#9ca3af' }} />
                                </div>
                            )}

                            {/* Actions */}
                            <div className="pd-actions">
                                <button className="btn-locate" onClick={() => { setSelectedProduct(null); locateProduct(selectedProduct.zone_id); }}>
                                    <FiMapPin /> Locate
                                </button>
                                <button className="btn-add-list" onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                                    style={isInCart(selectedProduct.id) ? { background: '#10b981' } : {}}>
                                    {isInCart(selectedProduct.id) ? <><FiCheck /> In List</> : <><FiPlus /> Add to List</>}
                                </button>
                            </div>

                            {/* Similar Items */}
                            {getSimilarProducts(selectedProduct).length > 0 && (
                                <div className="pd-similar">
                                    <h4>Similar Items</h4>
                                    <div className="pd-similar-items">
                                        {getSimilarProducts(selectedProduct).map(sp => (
                                            <div key={sp.id} className="pd-similar-item" onClick={() => setSelectedProduct(sp)}>
                                                <div className="sim-icon">{sp.icon}</div>
                                                <div className="sim-name">{sp.name}</div>
                                                {sp.price && <div className="sim-price">&#8377;{sp.price}</div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Cart Drawer */}
            {cartOpen && (
                <>
                    <div className="cart-overlay" onClick={() => setCartOpen(false)} />
                    <div className="cart-drawer">
                        <div className="cart-header">
                            <h3><FiShoppingCart /> Shopping List ({cart.length})</h3>
                            <button className="cart-close" onClick={() => setCartOpen(false)}><FiX /></button>
                        </div>

                        {cart.length > 0 && (
                            <div className="cart-progress">
                                <div className="progress-label">
                                    <span>Progress</span>
                                    <span>{foundCount} of {cart.length} found ({progressPct}%)</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${progressPct}%` }} />
                                </div>
                            </div>
                        )}

                        <div className="cart-items">
                            {cart.length === 0 && (
                                <div className="empty-state" style={{ padding: '40px 20px' }}>
                                    <div className="empty-icon">&#128722;</div>
                                    <p>Your shopping list is empty</p>
                                    <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: 4 }}>Tap + on products to add them</p>
                                </div>
                            )}

                            {Object.entries(cartByZone).map(([zone, items]) => (
                                <div className="cart-zone-group" key={zone}>
                                    <div className="cart-zone-label">
                                        <FiMapPin size={12} /> {zone}
                                    </div>
                                    {items.map(item => (
                                        <div className="cart-item" key={item.id}>
                                            <div className={`cart-checkbox ${item.found ? 'checked' : ''}`} onClick={() => toggleFound(item.id)}>
                                                {item.found && <FiCheck size={14} />}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div className={`cart-item-name ${item.found ? 'found' : ''}`}>
                                                    {item.icon} {item.name}
                                                </div>
                                            </div>
                                            <button className="cart-remove" onClick={() => removeFromCart(item.id)}>
                                                <FiTrash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        {cart.length > 0 && (
                            <div className="cart-footer">
                                {foundCount > 0 && (
                                    <button className="btn-clear-found" onClick={clearFound}>
                                        <FiCheck size={14} /> Clear Found ({foundCount})
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Store Info Modal */}
            {showStoreInfo && (
                <div className="store-info-modal" onClick={() => setShowStoreInfo(false)}>
                    <div className="store-info-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-handle" />
                        <h3>{shop.name}</h3>

                        {shop.description && (
                            <p style={{ fontSize: '0.88rem', color: '#6b7280', marginBottom: 16, lineHeight: 1.6 }}>
                                {shop.description}
                            </p>
                        )}

                        {shop.address && (
                            <div className="info-row">
                                <div className="info-row-icon" style={{ background: '#e8f0fe', color: '#1a73e8' }}><FiMapPin /></div>
                                <div className="info-row-text">
                                    <div className="info-row-label">Address</div>
                                    <div className="info-row-value">{shop.address}</div>
                                </div>
                            </div>
                        )}

                        {shop.phone && (
                            <div className="info-row">
                                <div className="info-row-icon" style={{ background: '#ecfdf5', color: '#10b981' }}><FiPhone /></div>
                                <div className="info-row-text">
                                    <div className="info-row-label">Phone</div>
                                    <div className="info-row-value">{shop.phone}</div>
                                </div>
                            </div>
                        )}

                        {/* Weekly Hours */}
                        {parsedHours && (
                            <>
                                <div className="info-row" style={{ borderBottom: 'none', paddingBottom: 4 }}>
                                    <div className="info-row-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}><FiClock /></div>
                                    <div className="info-row-text">
                                        <div className="info-row-label">Opening Hours</div>
                                    </div>
                                </div>
                                <div className="hours-list">
                                    {DAYS.map(day => {
                                        const h = parsedHours[day];
                                        const isToday = day === DAYS[new Date().getDay()];
                                        return (
                                            <div key={day} className={`hours-item ${isToday ? 'today' : ''}`}>
                                                <span className="day">{day}{isToday ? ' (Today)' : ''}</span>
                                                <span className="time">
                                                    {h?.closed ? 'Closed' : `${formatTime12(h?.open)} - ${formatTime12(h?.close)}`}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {/* Action Buttons */}
                        <div className="action-buttons">
                            {shop.phone && (
                                <a href={`tel:${shop.phone}`} style={{ flex: 1, textDecoration: 'none' }}>
                                    <button style={{ width: '100%', padding: 12, background: '#10b981', color: 'white', border: 'none', borderRadius: 12, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                        <FiPhone /> Call
                                    </button>
                                </a>
                            )}
                            {shop.google_maps_url && (
                                <a href={shop.google_maps_url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textDecoration: 'none' }}>
                                    <button style={{ width: '100%', padding: 12, background: '#1a73e8', color: 'white', border: 'none', borderRadius: 12, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                        <FiNavigation /> Directions
                                    </button>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Zone Detail Modal */}
            {selectedZone && (
                <div className="zone-modal-overlay" onClick={() => setSelectedZone(null)}>
                    <div className="zone-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-handle" />
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem' }}>{selectedZone.icon}</div>
                            <h3 style={{ color: selectedZone.color }}>{selectedZone.name}</h3>
                            {selectedZone.description && <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>{selectedZone.description}</p>}
                        </div>
                        {selectedZone.photo && (
                            <img src={`${API_BASE}${selectedZone.photo}`} alt={selectedZone.name} className="zone-detail-photo" />
                        )}
                        <div style={{ marginTop: 12 }}>
                            <h4 style={{ fontSize: '0.9rem', marginBottom: 8 }}>Products in this zone:</h4>
                            {products.filter(p => p.zone_id === selectedZone.id).map(p => (
                                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                                    {p.photo ? (
                                        <img src={`${API_BASE}${p.photo}`} alt={p.name} style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />
                                    ) : (
                                        <span style={{ fontSize: '1.2rem' }}>{p.icon}</span>
                                    )}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</div>
                                        {p.price && <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>&#8377;{p.price}</div>}
                                    </div>
                                    <button className="p-action-btn" onClick={() => addToCart(p)}
                                        style={isInCart(p.id) ? { background: '#ecfdf5', color: '#10b981', borderColor: '#10b981' } : {}}>
                                        {isInCart(p.id) ? <FiCheck size={12} /> : <FiPlus size={12} />}
                                    </button>
                                </div>
                            ))}
                            {products.filter(p => p.zone_id === selectedZone.id).length === 0 && (
                                <p style={{ color: '#9ca3af', textAlign: 'center', padding: 16 }}>No products in this zone</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
