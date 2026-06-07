const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');
const router = express.Router();

// Get user statistics
router.get('/stats', auth, async (req, res) => {
    try {
        const [total] = await db.execute(
            'SELECT COUNT(*) as count FROM tasks WHERE user_id = ?',
            [req.user.id]
        );
        
        const [completed] = await db.execute(
            'SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status = "completed"',
            [req.user.id]
        );
        
        const [pending] = await db.execute(
            'SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status != "completed"',
            [req.user.id]
        );
        
        const [byPriority] = await db.execute(
            'SELECT priority, COUNT(*) as count FROM tasks WHERE user_id = ? GROUP BY priority',
            [req.user.id]
        );
        
        const [byCategory] = await db.execute(
            `SELECT c.name, COUNT(t.id) as count 
             FROM tasks t 
             LEFT JOIN categories c ON t.category_id = c.id 
             WHERE t.user_id = ? 
             GROUP BY c.name`,
            [req.user.id]
        );
        
        res.json({
            totalTasks: total[0].count,
            completedTasks: completed[0].count,
            pendingTasks: pending[0].count,
            completionRate: total[0].count > 0 ? Math.round((completed[0].count / total[0].count) * 100) : 0,
            byPriority,
            byCategory
        });
    } catch (err) {
        console.error('Get stats error:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;