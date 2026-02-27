const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');
const { JWT_SECRET, adminAuth, resolveWorkerContext } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email and password are required' });
        }

        // Check both admins and workers tables for email uniqueness
        const [existing] = await db.query('SELECT id FROM admins WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        const [existingWorker] = await db.query('SELECT id FROM workers WHERE email = ?', [email]);
        if (existingWorker.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            'INSERT INTO admins (name, email, password, phone) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, phone || null]
        );

        const token = jwt.sign({ id: result.insertId, email, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            message: 'Registration successful',
            token,
            role: 'admin',
            admin: { id: result.insertId, name, email, phone }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        // Check admins table first
        const [adminRows] = await db.query('SELECT * FROM admins WHERE email = ?', [email]);
        if (adminRows.length > 0) {
            const admin = adminRows[0];
            const valid = await bcrypt.compare(password, admin.password);
            if (!valid) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            const token = jwt.sign({ id: admin.id, email: admin.email, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });

            return res.json({
                message: 'Login successful',
                token,
                role: 'admin',
                admin: { id: admin.id, name: admin.name, email: admin.email, phone: admin.phone }
            });
        }

        // Check workers table
        const [workerRows] = await db.query('SELECT * FROM workers WHERE email = ?', [email]);
        if (workerRows.length > 0) {
            const worker = workerRows[0];
            const valid = await bcrypt.compare(password, worker.password);
            if (!valid) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            const token = jwt.sign({ id: worker.id, email: worker.email, role: 'worker' }, JWT_SECRET, { expiresIn: '7d' });

            return res.json({
                message: 'Login successful',
                token,
                role: 'worker',
                admin: { id: worker.id, name: worker.name, email: worker.email, phone: worker.phone, shop_id: worker.shop_id }
            });
        }

        return res.status(401).json({ error: 'Invalid email or password' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/auth/me
router.get('/me', adminAuth, resolveWorkerContext, async (req, res) => {
    try {
        if (req.userRole === 'worker') {
            const [rows] = await db.query('SELECT id, name, email, phone, shop_id, created_at FROM workers WHERE id = ?', [req.userId]);
            if (rows.length === 0) return res.status(404).json({ error: 'Worker not found' });
            return res.json({ ...rows[0], role: 'worker' });
        }

        const [rows] = await db.query('SELECT id, name, email, phone, created_at FROM admins WHERE id = ?', [req.adminId]);
        if (rows.length === 0) return res.status(404).json({ error: 'Admin not found' });
        res.json({ ...rows[0], role: 'admin' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
