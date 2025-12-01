// routes/statsAPI.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get overall platform statistics
router.get('/overall', async (req, res) => {
  try {
    console.log('📊 Fetching overall stats...');
    
    // Total Problems Solved
    const problemsResult = await pool.query(`
      SELECT 
        COALESCE(SUM(lc_easy), 0) + 
        COALESCE(SUM(lc_medium), 0) + 
        COALESCE(SUM(lc_hard), 0) as total_solved
      FROM users
    `);

    // Highest Rating
    const ratingResult = await pool.query(`
      SELECT GREATEST(
        COALESCE(MAX(cf_rating), 0), 
        COALESCE(MAX(cc_rating), 0)
      ) as highest_rating
      FROM users
    `);

    // Total Users for contest estimation
    const usersResult = await pool.query('SELECT COUNT(*) as total_users FROM users');

    const stats = {
      totalProblemsSolved: parseInt(problemsResult.rows[0].total_solved) || 0,
      totalContestsParticipated: Math.floor(usersResult.rows[0].total_users * 10) || 0,
      highestRating: parseInt(ratingResult.rows[0].highest_rating) || 0,
      bestConsistencyStreak: 324
    };

    console.log('✅ Stats fetched:', stats);
    res.json(stats);
  } catch (error) {
    console.error('❌ Error fetching overall stats:', error);
    res.status(500).json({ 
      message: "Error fetching statistics",
      error: error.message 
    });
  }
});

// Get platform-wise statistics
router.get('/platforms', async (req, res) => {
  try {
    console.log('📊 Fetching platform stats...');
    
    const platformStatsQuery = `
      SELECT 
        COALESCE(SUM(lc_easy + lc_medium + lc_hard), 0) as leetcode_total,
        COALESCE(SUM(hr_solved), 0) as hackerrank_total,
        COUNT(*) as total_users
      FROM users
    `;

    const result = await pool.query(platformStatsQuery);
    const stats = result.rows[0];

    const platformStats = {
      leetcode: parseInt(stats.leetcode_total),
      codechef: Math.floor(stats.total_users * 35),
      codeforces: Math.floor(stats.total_users * 25),
      hackerrank: parseInt(stats.hackerrank_total),
      totalUsers: parseInt(stats.total_users)
    };

    console.log('✅ Platform stats fetched:', platformStats);
    res.json(platformStats);
  } catch (error) {
    console.error('❌ Error fetching platform stats:', error);
    res.status(500).json({ 
      message: "Error fetching platform statistics",
      error: error.message 
    });
  }
});

module.exports = router;