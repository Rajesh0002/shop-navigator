const express = require('express');
const router = express.Router();
const db = require('../database');
const { adminAuth, resolveWorkerContext, adminOnly, workerShopGuard } = require('../middleware/auth');
const { createUploader } = require('../middleware/upload');

const offerUpload = createUploader('offers');

// GET /api/offers/:shopId
router.get('/:shopId', adminAuth, resolveWorkerContext, workerShopGuard(), async (req, res) => {
    try {
        const [offers] = await db.query(
            'SELECT * FROM offers WHERE shop_id = ? ORDER BY created_at DESC',
            [req.params.shopId]
        );
        res.json(offers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/offers/:shopId
router.post('/:shopId', adminAuth, resolveWorkerContext, workerShopGuard(), offerUpload.single('photo'), async (req, res) => {
    try {
        const { title, description, discount_percent, start_date, end_date, is_active } = req.body;
        if (!title) return res.status(400).json({ error: 'Offer title required' });

        const photo = req.file ? '/uploads/offers/' + req.file.filename : null;

        const [result] = await db.query(
            `INSERT INTO offers (shop_id, title, description, photo, discount_percent, start_date, end_date, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.params.shopId, title, description || null, photo,
             discount_percent || null, start_date || null, end_date || null, is_active !== undefined ? is_active : 1]
        );

        res.status(201).json({ message: 'Offer added', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/offers/update/:id
router.put('/update/:id', adminAuth, resolveWorkerContext, offerUpload.single('photo'), async (req, res) => {
    try {
        const { title, description, discount_percent, start_date, end_date, is_active } = req.body;
        const [existing] = await db.query('SELECT * FROM offers WHERE id = ?', [req.params.id]);
        if (existing.length === 0) return res.status(404).json({ error: 'Offer not found' });

        const photo = req.file ? '/uploads/offers/' + req.file.filename : existing[0].photo;

        await db.query(
            `UPDATE offers SET title=?, description=?, photo=?, discount_percent=?, start_date=?, end_date=?, is_active=? WHERE id=?`,
            [title || existing[0].title, description || existing[0].description, photo,
             discount_percent || existing[0].discount_percent, start_date || existing[0].start_date,
             end_date || existing[0].end_date, is_active !== undefined ? is_active : existing[0].is_active, req.params.id]
        );

        res.json({ message: 'Offer updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/offers/delete/:id (admin only)
router.delete('/delete/:id', adminAuth, resolveWorkerContext, adminOnly, async (req, res) => {
    try {
        await db.query('DELETE FROM offers WHERE id = ?', [req.params.id]);
        res.json({ message: 'Offer deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
