require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const categoryRoutes = require('./routes/categories');
const userRoutes = require('./routes/users');
const reportRoutes = require('./routes/reports');

const app = express();
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'Todo API Server is running!' });
});

// API Routes - ဒါတွေ ရှိရမယ်
app.use('/api/auth', authRoutes);      // ← /api/auth/register, /api/auth/login
app.use('/api/tasks', taskRoutes);     // ← /api/tasks ဒါထည့်ထားရမယ်
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        message: 'Route not found', 
        requestedUrl: req.url 
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});