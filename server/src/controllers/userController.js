const db = require('../config/db');

// @desc    Sync user data from Firebase to Postgres
// @route   POST /api/users/sync
// @access  Public (Secured by Frontend Token later)
const syncUser = async (req, res) => {
    const { 
        firebase_uid, 
        email, 
        full_name, 
        avatar_url, 
        branch, 
        academic_year, // <--- New Field
        semester, 
        enrollment_number // <--- This is the Roll Number
    } = req.body;

    try {
        // 1. Check if user exists
        const userCheck = await db.query(
            'SELECT * FROM users WHERE firebase_uid = $1',
            [firebase_uid]
        );

        if (userCheck.rows.length > 0) {
            return res.status(200).json({
                message: 'User synced successfully',
                user: userCheck.rows[0]
            });
        }

        // 2. Create new user
        const newUser = await db.query(
            `INSERT INTO users (
                firebase_uid, email, full_name, avatar_url, 
                branch, academic_year, semester, enrollment_number
            ) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
             RETURNING *`,
            [
                firebase_uid, 
                email, 
                full_name, 
                avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${full_name}`,
                branch,
                academic_year,
                semester,
                enrollment_number
            ]
        );

        res.status(201).json({
            message: 'User created successfully',
            user: newUser.rows[0]
        });

    } catch (error) {
        // Handle Unique Roll Number Error
        if (error.code === '23505') { 
            return res.status(400).json({ error: 'Roll Number already registered!' });
        }
        console.error('Error syncing user:', error);
        res.status(500).json({ error: 'Server error syncing user' });
    }
};
// @desc    Update user profile (Enrollment, Branch, etc.)
// @route   PUT /api/users/profile
const updateProfile = async (req, res) => {
    const { firebase_uid, enrollment_number, branch, semester } = req.body;

    try {
        const updatedUser = await db.query(
            `UPDATE users 
             SET enrollment_number = $1, branch = $2, semester = $3, updated_at = NOW()
             WHERE firebase_uid = $4
             RETURNING *`,
            [enrollment_number, branch, semester, firebase_uid]
        );

        if (updatedUser.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            message: 'Profile updated',
            user: updatedUser.rows[0]
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Server error updating profile' });
    }
};

module.exports = { syncUser, updateProfile };