const express = require('express');
const router = express.Router();
const { syncUser, updateProfile } = require('../controllers/userController');

// Only User Routes
router.post('/sync', syncUser);
router.put('/profile', updateProfile);
const platformController = require('../controllers/platformController');

// 2. Get Leaderboard (GET)
// This matches the frontend call to: /api/platforms/leaderboard
router.get('/leaderboard', platformController.getLeaderboard);

// 3. Get Dashboard Stats (GET)
router.get('/stats/:firebase_uid', platformController.getDashboardStats);

// 4. Get User's Connected Platforms (GET)
router.get('/:firebase_uid', platformController.getPlatforms);

// 5. Bulk Update Handles (PUT)
router.put('/update-handles', platformController.updatePlatformHandles);

module.exports = router;