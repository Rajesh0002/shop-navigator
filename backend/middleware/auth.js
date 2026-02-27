const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'shop_nav_secret_key_2026_xK9mP2qL';
const db = require('../database');

// Admin/Worker JWT authentication
function adminAuth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.id;
        req.userRole = decoded.role || 'admin';
        // For backwards compatibility, set adminId for admins
        if (req.userRole === 'admin') {
            req.adminId = decoded.id;
        }
        req.adminEmail = decoded.email;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

// Resolve worker context: for workers, lookup admin_id and shop_id from DB
async function resolveWorkerContext(req, res, next) {
    if (req.userRole === 'worker') {
        try {
            const [rows] = await db.query('SELECT admin_id, shop_id FROM workers WHERE id = ?', [req.userId]);
            if (rows.length === 0) return res.status(401).json({ error: 'Worker not found' });
            req.adminId = rows[0].admin_id;
            req.workerShopId = rows[0].shop_id;
        } catch (err) {
            return res.status(500).json({ error: 'Failed to resolve worker context' });
        }
    }
    next();
}

// Admin-only middleware: returns 403 if worker
function adminOnly(req, res, next) {
    if (req.userRole === 'worker') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
}

// Worker shop guard: ensures workers can only access their assigned shop
// Use after resolveWorkerContext. Checks req.params[paramName] against workerShopId.
function workerShopGuard(paramName = 'shopId') {
    return (req, res, next) => {
        if (req.userRole === 'worker' && req.workerShopId && String(req.params[paramName]) !== String(req.workerShopId)) {
            return res.status(403).json({ error: 'Access denied to this shop' });
        }
        next();
    };
}

// API Key authentication (for external software integration)
async function apiKeyAuth(req, res, next) {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;
    if (!apiKey) return res.status(401).json({ error: 'API key required' });

    try {
        const [rows] = await db.query('SELECT id, admin_id FROM shops WHERE api_key = ?', [apiKey]);
        if (rows.length === 0) return res.status(401).json({ error: 'Invalid API key' });
        req.shopId = rows[0].id;
        req.adminId = rows[0].admin_id;
        next();
    } catch (err) {
        return res.status(500).json({ error: 'Auth failed' });
    }
}

module.exports = { adminAuth, resolveWorkerContext, adminOnly, workerShopGuard, apiKeyAuth, JWT_SECRET };
