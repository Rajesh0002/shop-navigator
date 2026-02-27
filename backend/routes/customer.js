const express = require('express');
const router = express.Router();
const db = require('../database');

// PUBLIC routes - no auth needed (customer scans QR and sees this)

// GET /api/customer/shop/:id - Get full shop data for customer view
router.get('/shop/:id', async (req, res) => {
    try {
        const shopId = req.params.id;

        const [shops] = await db.query('SELECT id, name, type, address, logo FROM shops WHERE id = ?', [shopId]);
        if (shops.length === 0) return res.status(404).json({ error: 'Shop not found' });

        const [zones] = await db.query(
            `SELECT z.*, (SELECT COUNT(*) FROM products WHERE zone_id = z.id) as product_count
             FROM zones z WHERE z.shop_id = ? ORDER BY z.sort_order, z.id`,
            [shopId]
        );

        const [categories] = await db.query(
            'SELECT * FROM categories WHERE shop_id = ? ORDER BY sort_order, id',
            [shopId]
        );

        const [products] = await db.query(
            `SELECT p.*, z.name as zone_name, z.icon as zone_icon, z.color as zone_color,
             c.name as category_name, c.icon as category_icon, c.color as category_color
             FROM products p
             LEFT JOIN zones z ON p.zone_id = z.id
             LEFT JOIN categories c ON p.category_id = c.id
             WHERE p.shop_id = ? AND p.in_stock = 1
             ORDER BY p.name`,
            [shopId]
        );

        const [offers] = await db.query(
            `SELECT * FROM offers WHERE shop_id = ? AND is_active = 1
             AND (start_date IS NULL OR start_date <= CURDATE())
             AND (end_date IS NULL OR end_date >= CURDATE())
             ORDER BY created_at DESC`,
            [shopId]
        );

        res.json({
            shop: shops[0],
            zones,
            categories,
            products,
            offers
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/customer/shop/:id/search?q=keyword - Search products
router.get('/shop/:id/search', async (req, res) => {
    try {
        const q = req.query.q;
        if (!q) return res.status(400).json({ error: 'Search query required' });

        const [products] = await db.query(
            `SELECT p.*, z.name as zone_name, z.icon as zone_icon, z.color as zone_color,
             c.name as category_name
             FROM products p
             LEFT JOIN zones z ON p.zone_id = z.id
             LEFT JOIN categories c ON p.category_id = c.id
             WHERE p.shop_id = ? AND p.in_stock = 1 AND (p.name LIKE ? OR p.description LIKE ?)
             ORDER BY p.name`,
            [req.params.id, `%${q}%`, `%${q}%`]
        );

        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
