const express = require('express');
const router = express.Router();
const db = require('../database');
const { adminAuth, resolveWorkerContext, adminOnly, workerShopGuard } = require('../middleware/auth');
const multer = require('multer');
const parseForm = multer().none();

// GET /api/categories/:shopId
router.get('/:shopId', adminAuth, resolveWorkerContext, workerShopGuard(), async (req, res) => {
    try {
        const [cats] = await db.query(
            `SELECT c.*, (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count
             FROM categories c WHERE c.shop_id = ? ORDER BY c.sort_order, c.id`,
            [req.params.shopId]
        );
        res.json(cats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/categories/:shopId
router.post('/:shopId', adminAuth, resolveWorkerContext, workerShopGuard(), parseForm, async (req, res) => {
    try {
        const { name, icon, color, sort_order } = req.body;
        if (!name) return res.status(400).json({ error: 'Category name required' });

        const [result] = await db.query(
            'INSERT INTO categories (shop_id, name, icon, color, sort_order) VALUES (?, ?, ?, ?, ?)',
            [req.params.shopId, name, icon || '📦', color || '#666666', sort_order || 0]
        );

        res.status(201).json({ message: 'Category added', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/categories/update/:id
router.put('/update/:id', adminAuth, resolveWorkerContext, parseForm, async (req, res) => {
    try {
        const { name, icon, color, sort_order } = req.body;
        await db.query(
            'UPDATE categories SET name=COALESCE(?,name), icon=COALESCE(?,icon), color=COALESCE(?,color), sort_order=COALESCE(?,sort_order) WHERE id=?',
            [name, icon, color, sort_order, req.params.id]
        );
        res.json({ message: 'Category updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/categories/delete/:id (admin only)
router.delete('/delete/:id', adminAuth, resolveWorkerContext, adminOnly, async (req, res) => {
    try {
        await db.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
        res.json({ message: 'Category deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
