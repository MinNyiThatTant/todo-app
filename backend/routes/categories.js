const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all categories
router.get('/', auth, async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM categories WHERE user_id = ? OR user_id IS NULL ORDER BY name',
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        console.error('Get categories error:', err);
        res.status(500).json({ message: err.message });
    }
});

// Create category
router.post('/', auth, async (req, res) => {
    const { name } = req.body;
    
    if (!name) {
        return res.status(400).json({ message: 'Category name is required' });
    }
    
    try {
        const [result] = await db.execute(
            'INSERT INTO categories (name, user_id) VALUES (?, ?)',
            [name, req.user.id]
        );
        res.status(201).json({ id: result.insertId, name, user_id: req.user.id });
    } catch (err) {
        console.error('Create category error:', err);
        res.status(500).json({ message: err.message });
    }
});

// Delete category
router.delete('/:id', auth, async (req, res) => {
    try {
        await db.execute(
            'DELETE FROM categories WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        res.json({ message: 'Category deleted successfully' });
    } catch (err) {
        console.error('Delete category error:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;