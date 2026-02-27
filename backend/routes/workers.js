const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../database');
const { adminAuth, resolveWorkerContext, adminOnly } = require('../middleware/auth');

// GET /api/workers/:shopId - List workers for a shop (admin only)
router.get('/:shopId', adminAuth, resolveWorkerContext, adminOnly, async (req, res) => {
    try {
        const [workers] = await db.query(
            'SELECT id, name, email, phone, created_at FROM workers WHERE shop_id = ? AND admin_id = ?',
            [req.params.shopId, req.adminId]
        );
        res.json(workers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/workers/:shopId - Create worker (admin only)
router.post('/:shopId', adminAuth, resolveWorkerContext, adminOnly, async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email and password are required' });
        }

        // Verify the shop belongs to this admin
        const [shops] = await db.query('SELECT id FROM shops WHERE id = ? AND admin_id = ?', [req.params.shopId, req.adminId]);
        if (shops.length === 0) return res.status(404).json({ error: 'Shop not found' });

        // Check email uniqueness across both tables
        const [existingAdmin] = await db.query('SELECT id FROM admins WHERE email = ?', [email]);
        if (existingAdmin.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        const [existingWorker] = await db.query('SELECT id FROM workers WHERE email = ?', [email]);
        if (existingWorker.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            'INSERT INTO workers (shop_id, admin_id, name, email, password, phone) VALUES (?, ?, ?, ?, ?, ?)',
            [req.params.shopId, req.adminId, name, email, hashedPassword, phone || null]
        );

        res.status(201).json({
            message: 'Worker created',
            worker: { id: result.insertId, name, email, phone }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/workers/delete/:id - Remove worker (admin only)
router.delete('/delete/:id', adminAuth, resolveWorkerContext, adminOnly, async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM workers WHERE id = ? AND admin_id = ?', [req.params.id, req.adminId]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Worker not found' });
        res.json({ message: 'Worker removed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
