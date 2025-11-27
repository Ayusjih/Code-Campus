const express = require('express');
const cors = require('cors');
const pool = require('./db');
const fetchLeetCodeStats = require('./leetcodeFetcher');
const fetchHackerRankStats = require('./hackerrankFetcher');
const fetchCodeforcesStats = require('./codeforcesFetcher');
const fetchCodeChefStats = require('./codechefFetcher');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// --- HELPER: SCORE FORMULA ---
const RECALCULATE_SCORE_QUERY = `
    UPDATE users 
    SET total_score = 
        (COALESCE(lc_easy, 0) * 10) + 
        (COALESCE(lc_medium, 0) * 50) + 
        (COALESCE(lc_hard, 0) * 100) + 
        (COALESCE(cf_rating, 0) * 1) + 
        (COALESCE(cc_rating, 0) * 1) + 
        (COALESCE(hackerrank_score, 0) * 0.5) + 
        (COALESCE(college_contest_points, 0))
    WHERE email = $1
    RETURNING *
`;

// --- ROUTES ---

app.get('/', (req, res) => res.send('CodeCampus Server Running...'));

// 1. REGISTER
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password, branch, semester, year, leetcode_id, codeforces_id, codechef_id, hackerrank_id } = req.body;
        
        const userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userCheck.rows.length > 0) return res.status(401).json({ message: "User already exists!" });

        await pool.query(
            `INSERT INTO users (name, email, password, branch, semester, year, leetcode_id, codeforces_id, codechef_id, hackerrank_id) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [name, email, password, branch, semester, year, leetcode_id, codeforces_id, codechef_id, hackerrank_id]
        );

        // Initial Fetch (Registration ke waqt)
        if (leetcode_id) {
            const lcStats = await fetchLeetCodeStats(leetcode_id);
            if (lcStats) await pool.query(`UPDATE users SET lc_easy=$1, lc_medium=$2, lc_hard=$3 WHERE email=$4`, [lcStats.easy, lcStats.medium, lcStats.hard, email]);
        }
        if (hackerrank_id) {
            const hrStats = await fetchHackerRankStats(hackerrank_id);
            if (hrStats) await pool.query(`UPDATE users SET hackerrank_score=$1 WHERE email=$2`, [hrStats.score, email]);
        }

        const finalUser = await pool.query(RECALCULATE_SCORE_QUERY, [email]);
        res.json({ message: "Registration Successful", user: finalUser.rows[0] });
    } catch (err) { console.error(err); res.status(500).send("Server Error"); }
});

// 2. LOGIN
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (user.rows.length === 0) return res.status(401).json({ message: "User nahi mila!" });
        if (password !== user.rows[0].password) return res.status(401).json({ message: "Galat Password!" });
        res.json({ message: "Login Successful", user: user.rows[0] });
    } catch (err) { res.status(500).send("Server Error"); }
});

// 3. UPDATE PROFILE (Details Only - Fast)
app.put('/api/update-profile', async (req, res) => {
    try {
        const { email, leetcode_id, codeforces_id, codechef_id, hackerrank_id, bg_skin } = req.body;
        const updatedUser = await pool.query(
            `UPDATE users SET leetcode_id=$1, codeforces_id=$2, codechef_id=$3, hackerrank_id=$4, bg_skin=$5 WHERE email=$6 RETURNING *`,
            [leetcode_id, codeforces_id, codechef_id, hackerrank_id, bg_skin, email]
        );
        res.json({ message: "Profile Saved! Hit Refresh to sync stats.", user: updatedUser.rows[0] });
    } catch (err) { res.status(500).send("Server Error"); }
});

// 4. REFRESH STATS (THE MISSING PART - Daily Limit 5)
app.post('/api/refresh-stats', async (req, res) => {
    try {
        const { email } = req.body;
        const userRes = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        const user = userRes.rows[0];

        // Date Logic
        const today = new Date().toISOString().slice(0, 10);
        const lastDate = user.last_fetched ? new Date(user.last_fetched).toISOString().slice(0, 10) : null;
        let count = (lastDate === today) ? user.fetch_count : 0;

        if (count >= 5) return res.status(429).json({ message: "Daily Limit (5/5) Reached! Try tomorrow." });

        console.log(`🔄 Refreshing: ${email} (${count + 1}/5)`);

        // Fetch All
        if (user.leetcode_id) {
            try {
                const lc = await fetchLeetCodeStats(user.leetcode_id);
                if (lc) await pool.query(`UPDATE users SET lc_easy=$1, lc_medium=$2, lc_hard=$3 WHERE email=$4`, [lc.easy, lc.medium, lc.hard, email]);
            } catch(e) {}
        }
        if (user.hackerrank_id) {
            try {
                const hr = await fetchHackerRankStats(user.hackerrank_id);
                if (hr) await pool.query(`UPDATE users SET hackerrank_score=$1 WHERE email=$2`, [hr.score, email]);
            } catch(e) {}
        }
        if (user.codeforces_id) {
            try {
                const cf = await fetchCodeforcesStats(user.codeforces_id);
                if (cf) await pool.query(`UPDATE users SET cf_rating=$1 WHERE email=$2`, [cf.rating, email]);
            } catch(e) {}
        }
        if (user.codechef_id) {
            try {
                const cc = await fetchCodeChefStats(user.codechef_id);
                if (cc) await pool.query(`UPDATE users SET cc_rating=$1 WHERE email=$2`, [cc.rating, email]);
            } catch(e) {}
        }

        // Update Time, Count & Score
        await pool.query(`UPDATE users SET last_fetched=NOW(), fetch_count=$1 WHERE email=$2`, [count + 1, email]);
        const finalUser = await pool.query(RECALCULATE_SCORE_QUERY, [email]);

        res.json({ message: "Stats Refreshed!", user: finalUser.rows[0] });

    } catch (err) {
        console.error(err); // Error dekho terminal mein
        res.status(500).send("Server Error");
    }
});

// 5. LEADERBOARD
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
    } catch (err) { res.status(500).send("Server Error"); }
});

// --- AUTOMATION ---
cron.schedule('0 0 28 2 *', async () => { await pool.query("UPDATE users SET semester = semester + 1 WHERE semester < 8"); });
cron.schedule('0 0 31 8 *', async () => { 
    await pool.query("UPDATE users SET semester = semester + 1, year = year + 1 WHERE role = 'student'");
    const currentYear = new Date().getFullYear();
    await pool.query(`UPDATE users SET role = 'alumni', passout_year = $1, semester = NULL, year = NULL WHERE semester > 8 AND role = 'student'`, [currentYear]);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));