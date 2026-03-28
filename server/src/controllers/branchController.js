const db = require('../config/db');

const getAllBranches = async (req, res) => {
    try {
        const result = await db.query('SELECT branch_code, branch_name FROM branches WHERE is_active = true ORDER BY branch_code ASC');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Error fetching branches:", err);
        res.status(500).json({ error: 'Failed to fetch branches' });
    }
};

module.exports = {
    getAllBranches
};
