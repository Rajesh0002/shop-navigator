const express = require('express');
const router = express.Router();
const db = require('../database');
const { apiKeyAuth } = require('../middleware/auth');

// All routes here use API Key authentication (for external software)

// POST /api/integration/sync-products - Bulk sync products from external software
router.post('/sync-products', apiKeyAuth, async (req, res) => {
    try {
        const { products } = req.body;
        if (!Array.isArray(products)) return res.status(400).json({ error: 'products array required' });

        let synced = 0;
        let errors = 0;

        for (const p of products) {
            try {
                let zoneId = null;
                if (p.zone_name) {
                    const [zones] = await db.query(
                        'SELECT id FROM zones WHERE shop_id = ? AND name LIKE ?',
                        [req.shopId, `%${p.zone_name}%`]
                    );
                    if (zones.length > 0) zoneId = zones[0].id;
                }

                let catId = null;
                if (p.category_name) {
                    const [cats] = await db.query(
                        'SELECT id FROM categories WHERE shop_id = ? AND name LIKE ?',
                        [req.shopId, `%${p.category_name}%`]
                    );
                    if (cats.length > 0) catId = cats[0].id;
                }

                // Upsert: update if exists, insert if new
                const [existing] = await db.query(
                    'SELECT id FROM products WHERE shop_id = ? AND name = ?',
                    [req.shopId, p.name]
                );

                if (existing.length > 0) {
                    await db.query(
                        `UPDATE products SET zone_id=COALESCE(?,zone_id), category_id=COALESCE(?,category_id),
                         icon=COALESCE(?,icon), description=COALESCE(?,description),
                         price=COALESCE(?,price), in_stock=COALESCE(?,in_stock) WHERE id=?`,
                        [zoneId, catId, p.icon, p.description, p.price, p.in_stock, existing[0].id]
                    );
                } else {
                    await db.query(
                        `INSERT INTO products (shop_id, zone_id, category_id, name, icon, description, price, in_stock)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [req.shopId, zoneId, catId, p.name, p.icon || '📦', p.description || null, p.price || null, p.in_stock !== undefined ? p.in_stock : 1]
                    );
                }
                synced++;
            } catch (e) {
                errors++;
            }
        }

        // Log API call
        await db.query(
            'INSERT INTO api_logs (shop_id, endpoint, method, status_code, request_body) VALUES (?, ?, ?, ?, ?)',
            [req.shopId, '/sync-products', 'POST', 200, JSON.stringify({ total: products.length, synced, errors })]
        );

        res.json({ message: `Synced ${synced} products`, errors, total: products.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/integration/sync-zones - Sync zones from external software
router.post('/sync-zones', apiKeyAuth, async (req, res) => {
    try {
        const { zones } = req.body;
        if (!Array.isArray(zones)) return res.status(400).json({ error: 'zones array required' });

        let synced = 0;
        for (const z of zones) {
            const [existing] = await db.query(
                'SELECT id FROM zones WHERE shop_id = ? AND name = ?',
                [req.shopId, z.name]
            );

            if (existing.length > 0) {
                await db.query(
                    'UPDATE zones SET icon=COALESCE(?,icon), color=COALESCE(?,color), description=COALESCE(?,description) WHERE id=?',
                    [z.icon, z.color, z.description, existing[0].id]
                );
            } else {
                await db.query(
                    'INSERT INTO zones (shop_id, name, icon, color, description) VALUES (?, ?, ?, ?, ?)',
                    [req.shopId, z.name, z.icon || '📍', z.color || '#2196f3', z.description || null]
                );
            }
            synced++;
        }

        res.json({ message: `Synced ${synced} zones` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/integration/products - Get all products (for external software to read)
router.get('/products', apiKeyAuth, async (req, res) => {
    try {
        const [products] = await db.query(
            `SELECT p.*, z.name as zone_name, c.name as category_name
             FROM products p
             LEFT JOIN zones z ON p.zone_id = z.id
             LEFT JOIN categories c ON p.category_id = c.id
             WHERE p.shop_id = ?`,
            [req.shopId]
        );
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/integration/zones - Get all zones
router.get('/zones', apiKeyAuth, async (req, res) => {
    try {
        const [zones] = await db.query('SELECT * FROM zones WHERE shop_id = ?', [req.shopId]);
        res.json(zones);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
