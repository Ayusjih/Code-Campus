const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const platformRoutes = require('./routes/platformRoutes'); // <--- Import
const developerRoutes = require('./routes/developerRoutes');
const taskRoutes = require('./routes/taskRoutes');
const branchRoutes = require('./routes/branchRoutes');
const compression = require('compression');

// Load env variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json());

// Normalize branch inputs globally before reaching controllers
app.use((req, res, next) => {
    if (req.body) {
        if (typeof req.body.branch === 'string') {
            req.body.branch = req.body.branch.trim().toUpperCase();
        }
        if (typeof req.body.target_branch === 'string') {
            req.body.target_branch = req.body.target_branch.trim().toUpperCase();
        }
    }
    next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/platforms', platformRoutes); // <--- Use
app.use('/api/developer', developerRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/branches', branchRoutes);

// Health Check
app.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.status(200).json({ 
            message: 'Code-Campus API is running', 
            timestamp: result.rows[0].now 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// Server Listener
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;