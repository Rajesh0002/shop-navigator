const express = require('express');
const router = express.Router();
const db = require('../database');
const { adminAuth, resolveWorkerContext, adminOnly, workerShopGuard } = require('../middleware/auth');
const { createUploader } = require('../middleware/upload');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

const logoUpload = createUploader('logos');

// GET /api/shops - Get all shops for logged-in admin (workers see only their assigned shop)
router.get('/', adminAuth, resolveWorkerContext, async (req, res) => {
    try {
        if (req.userRole === 'worker') {
            const [shops] = await db.query(
                `SELECT s.*,
                 (SELECT COUNT(*) FROM zones WHERE shop_id = s.id) as zone_count,
                 (SELECT COUNT(*) FROM products WHERE shop_id = s.id) as product_count,
                 (SELECT COUNT(*) FROM offers WHERE shop_id = s.id AND is_active = 1) as offer_count
                 FROM shops s WHERE s.id = ? ORDER BY s.created_at DESC`,
                [req.workerShopId]
            );
            return res.json(shops);
        }

        const [shops] = await db.query(
            `SELECT s.*,
             (SELECT COUNT(*) FROM zones WHERE shop_id = s.id) as zone_count,
             (SELECT COUNT(*) FROM products WHERE shop_id = s.id) as product_count,
             (SELECT COUNT(*) FROM offers WHERE shop_id = s.id AND is_active = 1) as offer_count
             FROM shops s WHERE s.admin_id = ? ORDER BY s.created_at DESC`,
            [req.adminId]
        );
        res.json(shops);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/shops/:id - Get single shop
router.get('/:id', adminAuth, resolveWorkerContext, workerShopGuard('id'), async (req, res) => {
    try {
        const [shops] = await db.query('SELECT * FROM shops WHERE id = ? AND admin_id = ?', [req.params.id, req.adminId]);
        if (shops.length === 0) return res.status(404).json({ error: 'Shop not found' });
        res.json(shops[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/shops - Create new shop (admin only)
router.post('/', adminAuth, resolveWorkerContext, adminOnly, logoUpload.single('logo'), async (req, res) => {
    try {
        const { name, type, address } = req.body;
        if (!name) return res.status(400).json({ error: 'Shop name is required' });

        const apiKey = 'snk_' + uuidv4().replace(/-/g, '');
        const logo = req.file ? '/uploads/logos/' + req.file.filename : null;

        const [result] = await db.query(
            'INSERT INTO shops (admin_id, name, type, address, logo, api_key) VALUES (?, ?, ?, ?, ?, ?)',
            [req.adminId, name, type || 'general', address || null, logo, apiKey]
        );

        res.status(201).json({
            message: 'Shop created',
            shop: { id: result.insertId, name, type, address, logo, api_key: apiKey }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/shops/:id - Update shop
router.put('/:id', adminAuth, resolveWorkerContext, workerShopGuard('id'), logoUpload.single('logo'), async (req, res) => {
    try {
        const { name, type, address } = req.body;
        const shopId = req.params.id;

        const [existing] = await db.query('SELECT * FROM shops WHERE id = ? AND admin_id = ?', [shopId, req.adminId]);
        if (existing.length === 0) return res.status(404).json({ error: 'Shop not found' });

        const logo = req.file ? '/uploads/logos/' + req.file.filename : existing[0].logo;

        await db.query(
            'UPDATE shops SET name = ?, type = ?, address = ?, logo = ? WHERE id = ? AND admin_id = ?',
            [name || existing[0].name, type || existing[0].type, address || existing[0].address, logo, shopId, req.adminId]
        );

        res.json({ message: 'Shop updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/shops/:id (admin only)
router.delete('/:id', adminAuth, resolveWorkerContext, adminOnly, async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM shops WHERE id = ? AND admin_id = ?', [req.params.id, req.adminId]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Shop not found' });
        res.json({ message: 'Shop deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/shops/:id/qr - Generate QR code
router.get('/:id/qr', adminAuth, resolveWorkerContext, workerShopGuard('id'), async (req, res) => {
    try {
        const [shops] = await db.query('SELECT * FROM shops WHERE id = ? AND admin_id = ?', [req.params.id, req.adminId]);
        if (shops.length === 0) return res.status(404).json({ error: 'Shop not found' });

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const customerUrl = `${baseUrl}/shop/${req.params.id}`;
        const qrDataUrl = await QRCode.toDataURL(customerUrl, {
            width: 400,
            margin: 2,
            color: { dark: '#1a73e8', light: '#ffffff' }
        });

        res.json({ qr: qrDataUrl, url: customerUrl, shop: shops[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/shops/:id/regenerate-key - Regenerate API key (admin only)
router.post('/:id/regenerate-key', adminAuth, resolveWorkerContext, adminOnly, async (req, res) => {
    try {
        const newKey = 'snk_' + uuidv4().replace(/-/g, '');
        const [result] = await db.query(
            'UPDATE shops SET api_key = ? WHERE id = ? AND admin_id = ?',
            [newKey, req.params.id, req.adminId]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Shop not found' });
        res.json({ api_key: newKey });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
