const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all tasks
router.get('/', auth, async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT t.*, c.name as category_name 
             FROM tasks t 
             LEFT JOIN categories c ON t.category_id = c.id 
             WHERE t.user_id = ? 
             ORDER BY t.created_at DESC`,
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        console.error('Get tasks error:', err);
        res.status(500).json({ message: err.message });
    }
});

// Create task
router.post('/', auth, async (req, res) => {
    const { title, description, due_date, priority, status, category_id } = req.body;
    
    if (!title) {
        return res.status(400).json({ message: 'Title is required' });
    }
    
    try {
        const [result] = await db.execute(
            `INSERT INTO tasks (title, description, due_date, priority, status, category_id, user_id)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [title, description || null, due_date || null, priority || 'medium', status || 'pending', category_id || null, req.user.id]
        );
        
        const [newTask] = await db.execute(
            'SELECT * FROM tasks WHERE id = ?',
            [result.insertId]
        );
        
        res.status(201).json(newTask[0]);
    } catch (err) {
        console.error('Create task error:', err);
        res.status(500).json({ message: err.message });
    }
});

// Update task
router.put('/:id', auth, async (req, res) => {
    const { title, description, due_date, priority, status, category_id } = req.body;
    
    try {
        await db.execute(
            `UPDATE tasks 
             SET title = ?, description = ?, due_date = ?, priority = ?, status = ?, category_id = ?
             WHERE id = ? AND user_id = ?`,
            [title, description, due_date, priority, status, category_id, req.params.id, req.user.id]
        );
        
        const [updatedTask] = await db.execute(
            'SELECT * FROM tasks WHERE id = ?',
            [req.params.id]
        );
        
        res.json(updatedTask[0]);
    } catch (err) {
        console.error('Update task error:', err);
        res.status(500).json({ message: err.message });
    }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
    try {
        await db.execute(
            'DELETE FROM tasks WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        res.json({ message: 'Task deleted successfully' });
    } catch (err) {
        console.error('Delete task error:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;