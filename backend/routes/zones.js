const express = require('express');
const router = express.Router();
const db = require('../database');
const { adminAuth, resolveWorkerContext, adminOnly, workerShopGuard } = require('../middleware/auth');
const { createUploader } = require('../middleware/upload');

const zoneUpload = createUploader('zones');

// GET /api/zones/:shopId - Get all zones for a shop
router.get('/:shopId', adminAuth, resolveWorkerContext, workerShopGuard(), async (req, res) => {
    try {
        const [zones] = await db.query(
            `SELECT z.*, (SELECT COUNT(*) FROM products WHERE zone_id = z.id) as product_count
             FROM zones z WHERE z.shop_id = ? ORDER BY z.sort_order, z.id`,
            [req.params.shopId]
        );
        res.json(zones);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/zones/:shopId - Add zone
router.post('/:shopId', adminAuth, resolveWorkerContext, workerShopGuard(), zoneUpload.single('photo'), async (req, res) => {
    try {
        const { name, icon, color, position_row, position_col, description, sort_order } = req.body;
        if (!name) return res.status(400).json({ error: 'Zone name required' });

        const photo = req.file ? '/uploads/zones/' + req.file.filename : null;

        const [result] = await db.query(
            `INSERT INTO zones (shop_id, name, icon, color, position_row, position_col, photo, description, sort_order)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.params.shopId, name, icon || '📍', color || '#2196f3',
             position_row || null, position_col || null, photo, description || null, sort_order || 0]
        );

        res.status(201).json({ message: 'Zone added', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/zones/update/:id - Update zone
router.put('/update/:id', adminAuth, resolveWorkerContext, zoneUpload.single('photo'), async (req, res) => {
    try {
        const { name, icon, color, position_row, position_col, description, sort_order } = req.body;
        const [existing] = await db.query('SELECT * FROM zones WHERE id = ?', [req.params.id]);
        if (existing.length === 0) return res.status(404).json({ error: 'Zone not found' });

        const photo = req.file ? '/uploads/zones/' + req.file.filename : existing[0].photo;

        await db.query(
            `UPDATE zones SET name=?, icon=?, color=?, position_row=?, position_col=?, photo=?, description=?, sort_order=? WHERE id=?`,
            [name || existing[0].name, icon || existing[0].icon, color || existing[0].color,
             position_row || existing[0].position_row, position_col || existing[0].position_col,
             photo, description || existing[0].description, sort_order || existing[0].sort_order, req.params.id]
        );

        res.json({ message: 'Zone updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/zones/delete/:id (admin only)
router.delete('/delete/:id', adminAuth, resolveWorkerContext, adminOnly, async (req, res) => {
    try {
        await db.query('DELETE FROM zones WHERE id = ?', [req.params.id]);
        res.json({ message: 'Zone deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
