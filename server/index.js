// [2025-12-06 22:30] server/index.js
// Description: Main server file updated to use Firebase Auth routes.

const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

// 1. Import New Auth Routes (Jo humne auth.js banaya)
const authRoutes = require('./routes/auth');

// Old Fetchers (Stats update ke liye)
const fetchLeetCodeStats = require('./leetcodeFetcher');
const fetchHackerRankStats = require('./hackerrankFetcher');
const fetchCodeforcesStats = require('./codeforcesFetcher');
const fetchCodeChefStats = require('./codechefFetcher');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 5000;

// --- CORS CONFIGURATION ---
const allowedOrigins = [
  'https://code-campus-gamma.vercel.app',  // Tumhara Vercel Frontend
  'https://codeecampus.netlify.app',       // Tumhara Netlify Frontend
  'http://localhost:5173'                  // Local testing
];

app.use(cors({
  origin: function (origin, callback) {
    // Mobile apps ya curl request ke liye allow karo
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// --- 🔗 CONNECT NEW ROUTES (Ye line missing thi) ---
// Ab Backend ko pata chalega ki Register/Login kahan bhejna hai
app.use('/api/auth', authRoutes);


// --- HEALTH CHECK ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// --- LEADERBOARD API ---
app.get('/api/leaderboard', async (req, res) => {
  try {
    const result = await pool.query(`
           SELECT name, email, branch, year, semester, role, passout_year, bg_skin,
                  lc_easy, lc_medium, lc_hard, total_score, 
                  cf_rating, cc_rating, hackerrank_score, college_contest_points,
                  leetcode_id, codeforces_id, codechef_id, hackerrank_id
           FROM users ORDER BY total_score DESC
       `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// --- CRON JOBS (Automation) ---
cron.schedule('0 0 28 2 *', async () => {
  await pool.query("UPDATE users SET semester = semester + 1 WHERE semester < 8");
  console.log("Cron: Semester updated");
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});