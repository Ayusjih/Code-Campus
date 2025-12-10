const db = require('../config/db');

// @desc    Create a new Task (Teacher Only)
const createTask = async (req, res) => {
    const { firebase_uid, title, description, branch, semester } = req.body;

    try {
        // 1. Verify Teacher Role
        const userRes = await db.query('SELECT id, role FROM users WHERE firebase_uid = $1', [firebase_uid]);
        if (userRes.rows.length === 0 || userRes.rows[0].role !== 'teacher') {
            return res.status(403).json({ error: "Access Denied. Teachers only." });
        }
        const teacherId = userRes.rows[0].id;

        // 2. Insert Task (Expires automatically in 24h via DB default, but we can enforce)
        await db.query(
            `INSERT INTO tasks (teacher_id, title, description, target_branch, target_semester)
             VALUES ($1, $2, $3, $4, $5)`,
            [teacherId, title, description, branch, semester]
        );

        res.status(201).json({ message: "Assessment Uploaded Successfully (Valid for 24h)" });

    } catch (error) {
        console.error("Create Task Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

// @desc    Get Active Tasks for a Student
const getStudentTasks = async (req, res) => {
    const { firebase_uid } = req.params;

    try {
        // 1. Get Student Info
        const studentRes = await db.query('SELECT id, branch, semester FROM users WHERE firebase_uid = $1', [firebase_uid]);
        if (studentRes.rows.length === 0) return res.status(404).json({ error: "User not found" });
        
        const { branch, semester } = studentRes.rows[0];

        // 2. Fetch Tasks matching Branch & Sem AND are NOT expired
        const tasks = await db.query(
            `SELECT t.*, u.full_name as teacher_name 
             FROM tasks t
             JOIN users u ON t.teacher_id = u.id
             WHERE t.target_branch = $1 
             AND t.target_semester = $2
             AND t.created_at > NOW() - INTERVAL '24 HOURS' -- The 24hr Logic
             ORDER BY t.created_at DESC`,
            [branch, semester]
        );

        res.json(tasks.rows);

    } catch (error) {
        console.error("Get Tasks Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

// @desc    Submit an Answer (Student)
const submitTask = async (req, res) => {
    const { firebase_uid, task_id, code } = req.body;

    try {
        const userRes = await db.query('SELECT id FROM users WHERE firebase_uid = $1', [firebase_uid]);
        const studentId = userRes.rows[0].id;

        await db.query(
            `INSERT INTO submissions (task_id, student_id, code_answer) VALUES ($1, $2, $3)`,
            [task_id, studentId, code]
        );

        res.json({ message: "Assessment Submitted!" });

    } catch (error) {
        console.error("Submit Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

// @desc    Get Submissions for a Teacher's Tasks
const getTeacherSubmissions = async (req, res) => {
    const { firebase_uid } = req.params;

    try {
        // 1. Get Teacher ID
        const teacherRes = await db.query('SELECT id FROM users WHERE firebase_uid = $1', [firebase_uid]);
        const teacherId = teacherRes.rows[0].id;

        // 2. Fetch submissions for tasks created by THIS teacher
        // Only shows data for active tasks (created in last 24h)
        const submissions = await db.query(
            `SELECT 
                s.id, s.code_answer, s.submitted_at,
                t.title as task_title,
                u.full_name as student_name, u.email as student_email
             FROM submissions s
             JOIN tasks t ON s.task_id = t.id
             JOIN users u ON s.student_id = u.id
             WHERE t.teacher_id = $1
             AND t.created_at > NOW() - INTERVAL '24 HOURS'
             ORDER BY s.submitted_at DESC`,
            [teacherId]
        );

        res.json(submissions.rows);

    } catch (error) {
        console.error("Teacher View Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

module.exports = { createTask, getStudentTasks, submitTask, getTeacherSubmissions };