const express = require('express');
const router = express.Router();
const db = require('../database');
const { adminAuth, resolveWorkerContext, adminOnly, workerShopGuard } = require('../middleware/auth');
const { createUploader } = require('../middleware/upload');
const csv = require('csv-parser');
const fs = require('fs');
const multer = require('multer');

const productUpload = createUploader('products');
const csvUpload = multer({ dest: '/tmp/' });

// GET /api/products/:shopId - Get all products
router.get('/:shopId', adminAuth, resolveWorkerContext, workerShopGuard(), async (req, res) => {
    try {
        const [products] = await db.query(
            `SELECT p.*, z.name as zone_name, z.icon as zone_icon, z.color as zone_color,
             c.name as category_name, c.icon as category_icon, c.color as category_color
             FROM products p
             LEFT JOIN zones z ON p.zone_id = z.id
             LEFT JOIN categories c ON p.category_id = c.id
             WHERE p.shop_id = ? ORDER BY p.name`,
            [req.params.shopId]
        );
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/products/:shopId - Add product
router.post('/:shopId', adminAuth, resolveWorkerContext, workerShopGuard(), productUpload.single('photo'), async (req, res) => {
    try {
        const { name, zone_id, category_id, icon, description, price, in_stock } = req.body;
        if (!name) return res.status(400).json({ error: 'Product name required' });

        const photo = req.file ? '/uploads/products/' + req.file.filename : null;

        const [result] = await db.query(
            `INSERT INTO products (shop_id, zone_id, category_id, name, icon, photo, description, price, in_stock)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.params.shopId, zone_id || null, category_id || null, name,
             icon || '📦', photo, description || null, price || null, in_stock !== undefined ? in_stock : 1]
        );

        res.status(201).json({ message: 'Product added', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/products/update/:id - Update product
router.put('/update/:id', adminAuth, resolveWorkerContext, productUpload.single('photo'), async (req, res) => {
    try {
        const { name, zone_id, category_id, icon, description, price, in_stock } = req.body;
        const [existing] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (existing.length === 0) return res.status(404).json({ error: 'Product not found' });

        const photo = req.file ? '/uploads/products/' + req.file.filename : existing[0].photo;

        await db.query(
            `UPDATE products SET name=?, zone_id=?, category_id=?, icon=?, photo=?, description=?, price=?, in_stock=? WHERE id=?`,
            [name || existing[0].name, zone_id || existing[0].zone_id, category_id || existing[0].category_id,
             icon || existing[0].icon, photo, description || existing[0].description,
             price || existing[0].price, in_stock !== undefined ? in_stock : existing[0].in_stock, req.params.id]
        );

        res.json({ message: 'Product updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/products/delete/:id (admin only)
router.delete('/delete/:id', adminAuth, resolveWorkerContext, adminOnly, async (req, res) => {
    try {
        await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/products/:shopId/bulk-import - CSV Import
router.post('/:shopId/bulk-import', adminAuth, resolveWorkerContext, workerShopGuard(), csvUpload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'CSV file required' });

        const products = [];
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (row) => {
                products.push(row);
            })
            .on('end', async () => {
                let inserted = 0;
                for (const p of products) {
                    try {
                        let zoneId = null;
                        if (p.zone_name) {
                            const [zones] = await db.query(
                                'SELECT id FROM zones WHERE shop_id = ? AND name = ?',
                                [req.params.shopId, p.zone_name]
                            );
                            if (zones.length > 0) zoneId = zones[0].id;
                        }

                        let catId = null;
                        if (p.category_name) {
                            const [cats] = await db.query(
                                'SELECT id FROM categories WHERE shop_id = ? AND name = ?',
                                [req.params.shopId, p.category_name]
                            );
                            if (cats.length > 0) catId = cats[0].id;
                        }

                        await db.query(
                            `INSERT INTO products (shop_id, zone_id, category_id, name, icon, description, price)
                             VALUES (?, ?, ?, ?, ?, ?, ?)`,
                            [req.params.shopId, zoneId, catId, p.name, p.icon || '📦', p.description || null, p.price || null]
                        );
                        inserted++;
                    } catch (e) { /* skip duplicates */ }
                }

                fs.unlinkSync(req.file.path);
                res.json({ message: `Imported ${inserted} of ${products.length} products` });
            });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
