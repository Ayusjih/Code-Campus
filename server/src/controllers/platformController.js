const db = require('../config/db');
const NodeCache = require('node-cache');
const myCache = new NodeCache({ stdTTL: 300 });
// Ensure these paths match where your scraper files actually are
const { fetchLeetCodeData } = require('../utils/leetcode'); 
const { 
    fetchCodeforces, 
    fetchCodeChef, 
    fetchGeeksForGeeks, 
    fetchHackerRank 
} = require('../utils/scrapers');

// @desc    Connect a platform (fetch data & save to DB)
// @route   POST /api/platform/connect
const connectPlatform = async (req, res) => {
    const { firebase_uid, platform, username } = req.body;

    try {
        // 1. Get User ID
        const userResult = await db.query('SELECT id FROM users WHERE firebase_uid = $1', [firebase_uid]);
        if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        const userId = userResult.rows[0].id;

        // 2. Fetch Data
        let stats = null;
        console.log(`Fetching data for ${platform}: ${username}...`);

        switch (platform) {
            case 'LeetCode': stats = await fetchLeetCodeData(username); break;
            case 'Codeforces': stats = await fetchCodeforces(username); break;
            case 'CodeChef': stats = await fetchCodeChef(username); break;
            case 'GeeksForGeeks': stats = await fetchGeeksForGeeks(username); break;
            case 'HackerRank': stats = await fetchHackerRank(username); break;
            default: return res.status(400).json({ error: 'Unknown platform' });
        }

        if (!stats) return res.status(404).json({ error: `Could not fetch data for ${platform}. Check username.` });

        // 3. Save to DB
        const safeRank = (typeof stats.globalRank === 'number') ? stats.globalRank : 0;

        const savedStats = await db.query(
            `INSERT INTO platform_stats 
            (user_id, platform_name, platform_handle, rating, global_rank, problems_solved, last_fetched)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            ON CONFLICT (user_id, platform_name) 
            DO UPDATE SET 
                rating = EXCLUDED.rating,
                global_rank = EXCLUDED.global_rank,
                problems_solved = EXCLUDED.problems_solved,
                last_fetched = NOW()
            RETURNING *`,
            [userId, platform, stats.handle, stats.rating, safeRank, stats.problemsSolved]
        );

        res.status(200).json({ message: 'Platform connected successfully', data: savedStats.rows[0] });

    } catch (error) {
        console.error("Connect Platform Error:", error);
        res.status(500).json({ error: 'Server Error' });
    }
};

// @desc    Get all connected platforms
const getPlatforms = async (req, res) => {
    const { firebase_uid } = req.params;
    try {
        const platforms = await db.query(
            `SELECT ps.* FROM platform_stats ps
             JOIN users u ON ps.user_id = u.id
             WHERE u.firebase_uid = $1`,
            [firebase_uid]
        );
        res.status(200).json(platforms.rows);
    } catch (error) {
        console.error("Get Platforms Error:", error);
        res.status(500).json({ error: 'Server Error' });
    }
};

// @desc    Get Global Leaderboard (Weighted Score + Total Count)
// @route   GET /api/platforms/leaderboard
const getLeaderboard = async (req, res) => {
    try {
        const cacheKey = "leaderboard_data";
        
        // 1. Check if data is already in Cache
        const cachedData = myCache.get(cacheKey);
        if (cachedData) {
            // console.log("Serving Leaderboard from Cache ⚡"); // Optional: Debug log
            return res.status(200).json(cachedData);
        }

        // 2. If NOT in cache, Query the Database (The "Heavy" Operation)
        const query = `
            SELECT 
                u.full_name as name,
                u.branch,
                u.academic_year as year,
                u.semester,
                u.email,
                
                -- 1. TOTAL QUESTIONS SOLVED
                COALESCE(SUM(ps.problems_solved), 0) as total_problems_solved,

                -- 2. WEIGHTED TOTAL SCORE
                COALESCE(SUM(
                    CASE 
                        WHEN ps.platform_name = 'Codeforces'    THEN ps.problems_solved * 20
                        WHEN ps.platform_name = 'LeetCode'      THEN ps.problems_solved * 10
                        WHEN ps.platform_name = 'CodeChef'      THEN ps.problems_solved * 5
                        WHEN ps.platform_name = 'HackerRank'    THEN ps.problems_solved * 2
                        WHEN ps.platform_name = 'GeeksForGeeks' THEN ps.problems_solved * 1
                        ELSE 0 
                    END
                ), 0) as total_score,
                
                -- Extract Platform Specific Data
                MAX(CASE WHEN ps.platform_name = 'LeetCode' THEN ps.problems_solved ELSE 0 END) as lc_solved,
                MAX(CASE WHEN ps.platform_name = 'Codeforces' THEN ps.rating ELSE 0 END) as cf_rating,
                MAX(CASE WHEN ps.platform_name = 'CodeChef' THEN ps.rating ELSE 0 END) as cc_rating,
                MAX(CASE WHEN ps.platform_name = 'HackerRank' THEN ps.rating ELSE 0 END) as hr_score,
                MAX(CASE WHEN ps.platform_name = 'GeeksForGeeks' THEN ps.rating ELSE 0 END) as gfg_score

            FROM users u
            LEFT JOIN platform_stats ps ON u.id = ps.user_id
            
            WHERE u.is_hidden = FALSE
            
            GROUP BY u.id, u.full_name, u.branch, u.academic_year, u.semester, u.email
            
            ORDER BY total_score DESC
            LIMIT 50;
        `;

        const result = await db.query(query);

        const responseData = {
            leaderboard: result.rows,
            coderOfWeek: result.rows.length > 0 ? result.rows[0] : null
        };

        // 3. Save result to Cache for next time
        myCache.set(cacheKey, responseData);

        // 4. Send response
        res.status(200).json(responseData);

    } catch (error) {
        console.error('Leaderboard Error:', error.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

// @desc    Get Dashboard Stats
const getDashboardStats = async (req, res) => {
    const { firebase_uid } = req.params;
    try {
        // 1. User Total
        const userStats = await db.query(
            `SELECT u.id, COALESCE(SUM(ps.problems_solved), 0) as total_problems, COUNT(ps.platform_name) as platform_count
             FROM users u LEFT JOIN platform_stats ps ON u.id = ps.user_id
             WHERE u.firebase_uid = $1 GROUP BY u.id`, [firebase_uid]
        );
        
        if (userStats.rows.length === 0) return res.status(404).json({ error: 'User not found' });

        const myTotal = parseInt(userStats.rows[0].total_problems);
        const myPlatformCount = parseInt(userStats.rows[0].platform_count);
        const userId = userStats.rows[0].id;

        // 2. Rank Calculation
        const rankResult = await db.query(
            `SELECT COUNT(*) + 1 as rank FROM (
                SELECT user_id, SUM(problems_solved) as total FROM platform_stats GROUP BY user_id
             ) as scores WHERE total > $1`, [myTotal]
        );
        
        res.status(200).json({
            totalSolved: myTotal,
            collegeRank: rankResult.rows[0].rank,
            activePlatforms: myPlatformCount,
            weeklyProgress: [] // Add real graph data logic later
        });
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ error: 'Server Error' });
    }
};

// @desc    Bulk Update Handles (Edit Profile)
const updatePlatformHandles = async (req, res) => {
    const { firebase_uid, profiles } = req.body; 
    try {
        const userResult = await db.query('SELECT id FROM users WHERE firebase_uid = $1', [firebase_uid]);
        if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        const userId = userResult.rows[0].id;

        const results = [];
        const validPlatforms = ['LeetCode', 'CodeChef', 'Codeforces', 'HackerRank', 'GeeksForGeeks'];

        for (const platform of validPlatforms) {
            const username = profiles[platform];
            if (!username || username.trim() === "") continue;

            let stats = null;
            try {
                if (platform === 'LeetCode') stats = await fetchLeetCodeData(username);
                else if (platform === 'Codeforces') stats = await fetchCodeforces(username);
                else if (platform === 'CodeChef') stats = await fetchCodeChef(username);
                else if (platform === 'HackerRank') stats = await fetchHackerRank(username);
                else if (platform === 'GeeksForGeeks') stats = await fetchGeeksForGeeks(username);
            } catch (err) {
                console.error(`Failed to fetch ${platform}`, err.message);
            }

            if (!stats) {
                results.push({ platform, status: 'failed' });
                continue; 
            }

            const safeRank = (typeof stats.globalRank === 'number') ? stats.globalRank : 0;
            await db.query(
                `INSERT INTO platform_stats (user_id, platform_name, platform_handle, rating, global_rank, problems_solved, last_fetched)
                 VALUES ($1, $2, $3, $4, $5, $6, NOW())
                 ON CONFLICT (user_id, platform_name) DO UPDATE SET 
                    rating = EXCLUDED.rating, global_rank = EXCLUDED.global_rank, problems_solved = EXCLUDED.problems_solved, last_fetched = NOW()`,
                [userId, platform, stats.handle, stats.rating, safeRank, stats.problemsSolved]
            );
            results.push({ platform, status: 'success' });
        }
        res.status(200).json({ message: 'Process Complete', results });
    } catch (error) {
        console.error("Bulk Update Error:", error);
        res.status(500).json({ error: 'Server Error' });
    }
};

// @desc    Get User Role (Teacher/Student Check)
const getUserRole = async (req, res) => {
    const { firebase_uid } = req.params;
    try {
        const result = await db.query('SELECT role FROM users WHERE firebase_uid = $1', [firebase_uid]);
        if (result.rows.length === 0) {
            return res.status(404).json({ role: 'student' });
        }
        res.json({ role: result.rows[0].role });
    } catch (error) {
        console.error("Get Role Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

// @desc    Toggle Visibility (Hide Profile from Leaderboard)
const toggleVisibility = async (req, res) => {
    const { firebase_uid, is_hidden } = req.body;
    try {
        await db.query(
            'UPDATE users SET is_hidden = $1 WHERE firebase_uid = $2',
            [is_hidden, firebase_uid]
        );
        res.json({ message: "Visibility updated successfully" });
    } catch (error) {
        console.error("Visibility Update Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

// @desc    Get Visibility Status
const getVisibilityStatus = async (req, res) => {
    const { firebase_uid } = req.params;
    try {
        const result = await db.query('SELECT is_hidden FROM users WHERE firebase_uid = $1', [firebase_uid]);
        if (result.rows.length === 0) return res.status(404).json({ is_hidden: false });
        res.json({ is_hidden: result.rows[0].is_hidden });
    } catch (error) {
        console.error("Get Visibility Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

// @desc    Sync/Refresh (Max 5 times/day)
const syncUserStats = async (req, res) => {
    const { firebase_uid } = req.body;
    try {
        const userResult = await db.query('SELECT id, last_sync_date, sync_count FROM users WHERE firebase_uid = $1', [firebase_uid]);
        if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        
        const user = userResult.rows[0];
        const userId = user.id;

        // Rate Limiting
        const today = new Date().toISOString().split('T')[0];
        const lastSync = user.last_sync_date ? new Date(user.last_sync_date).toISOString().split('T')[0] : null;
        let newCount = user.sync_count;

        if (lastSync !== today) {
            newCount = 0;
            await db.query('UPDATE users SET last_sync_date = $1, sync_count = 0 WHERE id = $2', [today, userId]);
        }
        
        if (newCount >= 5) {
            return res.status(429).json({ error: 'Daily sync limit reached (5/5). Try again tomorrow.' });
        }

        const platformsResult = await db.query('SELECT * FROM platform_stats WHERE user_id = $1', [userId]);
        const platforms = platformsResult.rows;
        if (platforms.length === 0) return res.status(400).json({ error: 'No platforms connected.' });

        const updates = [];
        for (const p of platforms) {
            let stats = null;
            try {
                if (p.platform_name === 'LeetCode') stats = await fetchLeetCodeData(p.platform_handle);
                else if (p.platform_name === 'Codeforces') stats = await fetchCodeforces(p.platform_handle);
                else if (p.platform_name === 'CodeChef') stats = await fetchCodeChef(p.platform_handle);
                else if (p.platform_name === 'HackerRank') stats = await fetchHackerRank(p.platform_handle);
                else if (p.platform_name === 'GeeksForGeeks') stats = await fetchGeeksForGeeks(p.platform_handle);

                if (stats) {
                    await db.query(
                        `UPDATE platform_stats SET rating = $1, global_rank = $2, problems_solved = $3, last_fetched = NOW()
                         WHERE user_id = $4 AND platform_name = $5`,
                        [stats.rating, (typeof stats.globalRank === 'number' ? stats.globalRank : 0), stats.problemsSolved, userId, p.platform_name]
                    );
                    updates.push(p.platform_name);
                }
            } catch (err) {
                console.error(`Sync failed for ${p.platform_name}:`, err.message);
            }
        }

        await db.query('UPDATE users SET sync_count = sync_count + 1 WHERE id = $1', [userId]);

        res.status(200).json({ 
            message: 'Sync Successful', 
            updated: updates,
            remaining: 5 - (newCount + 1)
        });

    } catch (error) {
        console.error("Sync Controller Error:", error);
        res.status(500).json({ error: 'Server Error' });
    }
};
// @route   GET /api/platforms/profile/:firebase_uid
const getUserProfile = async (req, res) => {
    const { firebase_uid } = req.params;
    try {
        // 1. Fetch User Details
        const userRes = await db.query(
            'SELECT full_name, enrollment_number, branch, semester, academic_year, email, role FROM users WHERE firebase_uid = $1',
            [firebase_uid]
        );
        
        if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        const user = userRes.rows[0];

        // 2. Fetch Platform Stats
        const platformsRes = await db.query(
            `SELECT ps.* FROM platform_stats ps
             JOIN users u ON ps.user_id = u.id
             WHERE u.firebase_uid = $1`,
            [firebase_uid]
        );

        res.json({
            user: user,
            platforms: platformsRes.rows
        });

    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

module.exports = { 
    connectPlatform, 
    getPlatforms, 
    getLeaderboard, 
    getDashboardStats,
    updatePlatformHandles,
    getUserRole,
    syncUserStats,
    toggleVisibility,
    getVisibilityStatus,
    getUserProfile
};