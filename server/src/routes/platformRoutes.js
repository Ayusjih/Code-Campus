const express = require('express');
const router = express.Router();
const platformController = require('../controllers/platformController');

// 1. Connect a new platform (POST)
router.post('/connect', platformController.connectPlatform);

// 2. Sync/Refresh Data (POST) - THIS WAS MISSING
router.post('/sync', platformController.syncUserStats);

// 3. Bulk Update Handles (PUT)
router.put('/update-handles', platformController.updatePlatformHandles);

// 4. Get Leaderboard (GET)
router.get('/leaderboard', platformController.getLeaderboard);

// 5. Get Dashboard Stats (GET)
router.get('/stats/:firebase_uid', platformController.getDashboardStats);

// 6. Get User's Connected Platforms (GET)
router.get('/:firebase_uid', platformController.getPlatforms);
router.get('/role/:firebase_uid', platformController.getUserRole);
router.post('/visibility', platformController.toggleVisibility);
router.get('/visibility/:firebase_uid', platformController.getVisibilityStatus);
router.get('/profile/:firebase_uid', platformController.getUserProfile); // <--- ADD THIS
module.exports = router;

