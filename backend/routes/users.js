const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const router = express.Router();

// Get all users (admin only)
router.get('/', auth, roleCheck('admin'), async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT id, name, email, role, created_at FROM users');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Change user role (admin only)
router.put('/:id/role', auth, roleCheck('admin'), async (req, res) => {
    const { role } = req.body;
    if (!['admin', 'user'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
    try {
        await db.execute('UPDATE users SET role=? WHERE id=?', [role, req.params.id]);
        res.json({ message: 'Role updated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete user (admin only)
router.delete('/:id', auth, roleCheck('admin'), async (req, res) => {
    try {
        await db.execute('DELETE FROM users WHERE id=?', [req.params.id]);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;