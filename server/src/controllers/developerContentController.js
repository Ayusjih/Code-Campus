const db = require('../config/db');
const jwt = require('jsonwebtoken'); // npm install jsonwebtoken

// Config
const DEVELOPER_KEY = process.env.DEV_LOGIN_USER || 'dev_ayush'; 
const DEV_PASS = process.env.DEV_LOGIN_PASS || 'default_secret';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// --- 1. AUTH FUNCTIONS ---

// @desc    Login and generate token
const developerLogin = (req, res) => {
    const { email, password } = req.body;

    // Simple hardcoded check
    if (email === DEVELOPER_KEY && password === DEV_PASS) {
        const token = jwt.sign({ user: DEVELOPER_KEY, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({ message: 'Access granted', token });
    } else {
        return res.status(401).json({ message: 'Invalid credentials.' });
    }
};

// @desc    Middleware to protect routes
const ensureDevToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Token required' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
};

// --- 2. CONTENT FUNCTIONS ---

const getDevContent = async (req, res) => {
    try {
        const result = await db.query(
            "SELECT section, content FROM developer_content WHERE developer_user_id = $1", 
            [DEVELOPER_KEY]
        );
        // Convert rows to object: { projects: [], education: [] }
        const data = result.rows.reduce((acc, row) => {
            acc[row.section] = row.content;
            return acc;
        }, {});
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateDevContent = async (req, res) => {
    const { section, content } = req.body;
    try {
        // Upsert logic
        await db.query(
            `INSERT INTO developer_content (developer_user_id, section, content)
             VALUES ($1, $2, $3)
             ON CONFLICT (developer_user_id, section) 
             DO UPDATE SET content = EXCLUDED.content`,
            [DEVELOPER_KEY, section, JSON.stringify(content)] // Ensure content is stringified if using JSONB
        );
        res.json({ message: 'Saved' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Save failed' });
    }
};

const deleteDevItem = async (req, res) => {
    // Basic delete logic (fetching array, filtering, saving back)
    // For simplicity in MVP, we usually just use updateDevContent from frontend with the item removed
    // But if you need specific delete endpoint:
    const { section, index } = req.params;
    // ... logic to fetch, splice, and update ...
    res.json({ message: 'Delete implementation pending' }); 
};

module.exports = {
    developerLogin,
    ensureDevToken,
    getDevContent,
    updateDevContent,
    deleteDevItem
};