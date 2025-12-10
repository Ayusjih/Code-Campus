const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Teacher: Upload Task
router.post('/create', taskController.createTask);

// Teacher: View Submissions
router.get('/submissions/:firebase_uid', taskController.getTeacherSubmissions);

// Student: View Available Tasks
router.get('/list/:firebase_uid', taskController.getStudentTasks);

// Student: Submit Task
router.post('/submit', taskController.submitTask);

module.exports = router;