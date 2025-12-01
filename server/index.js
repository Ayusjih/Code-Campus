const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const pool = require('./db');
const fetchLeetCodeStats = require('./leetcodeFetcher');
const fetchHackerRankStats = require('./hackerrankFetcher');
const fetchCodeforcesStats = require('./codeforcesFetcher');
const fetchCodeChefStats = require('./codechefFetcher');
const cron = require('node-cron');
const nodemailer = require('nodemailer'); // ✅ IMPORT NODEMAILER
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ MIDDLEWARE SETUP FIRST
app.use(cors());
app.use(express.json());

// ✅ DEBUG MIDDLEWARE
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
    }
    next();
});

// ✅ ROUTES
const statsRoutes = require('./routes/statsAPI');
app.use('/api/stats', statsRoutes);
app.use('/api/developer', require('./routes/developer'));

// -------------------------------------------------------------------------
// 📧 EMAIL OTP CONFIGURATION (NODEMAILER)
// -------------------------------------------------------------------------

// 👇👇👇 CHANGE PERSONAL DETAILS HERE (Line 43-46) 👇👇👇
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'codecampus.0923@gmail.com',

    pass: 'soux udsk gfhs szyc'        // 2. REPLACE with your 16-char App Password
  }
});

// Temporary OTP Store (In production, consider Redis)
const otpStore = new Map();

// --- OTP ROUTE 1: SEND CODE ---
app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email required" });

  // Generate 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store OTP (Expires in 10 minutes)
  otpStore.set(email, { otp, expires: Date.now() + 10 * 60 * 1000 });

  const mailOptions = {
    from: '"CodeCampus Security" <your-email@gmail.com>', // Sender address
    to: email,
    subject: 'Verify Your Email - CodeCampus',
    html: `
      <div style="font-family: sans-serif; padding: 20px; text-align: center; border: 1px solid #ddd; border-radius: 10px; max-width: 500px; margin: auto;">
        <h2 style="color: #4F46E5;">CodeCampus Verification</h2>
        <p>Use the code below to complete your registration:</p>
        <h1 style="background: #f3f4f6; display: inline-block; padding: 10px 20px; letter-spacing: 5px; border-radius: 8px; color: #333;">${otp}</h1>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">This code expires in 10 minutes.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 OTP sent to ${email}`);
    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("❌ Email error:", error);
    res.status(500).json({ success: false, message: "Failed to send email. Check server logs." });
  }
});

// --- OTP ROUTE 2: VERIFY CODE ---
app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore.get(email);

  if (!record) return res.status(400).json({ success: false, message: "No OTP found. Please resend." });
  
  if (Date.now() > record.expires) {
    otpStore.delete(email);
    return res.status(400).json({ success: false, message: "OTP has expired." });
  }

  if (record.otp === otp) {
    otpStore.delete(email); // OTP is single-use
    return res.json({ success: true, message: "Verified" });
  } else {
    return res.status(400).json({ success: false, message: "Invalid OTP." });
  }
});

// -------------------------------------------------------------------------
// 🛠️ EXISTING LOGIC BELOW
// -------------------------------------------------------------------------

// --- MIDDLEWARE ---
const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validateUserData = (req, res, next) => {
    const { name, email, password, branch, semester, year, roll_number } = req.body;
    
    if (!name || !email || !password || !branch || !semester || !year || !roll_number) {
        return res.status(400).json({ message: "All fields are required" });
    }
    
    if (!validateEmail(email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }
    
    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    
    if (roll_number.length < 3) {
        return res.status(400).json({ message: "Roll number must be at least 3 characters" });
    }
    
    next();
};

// --- SCORE CALCULATION ---
const RECALCULATE_SCORE_QUERY = `
    UPDATE users 
    SET 
        total_score = 
            (COALESCE(lc_easy, 0) * 10) + 
            (COALESCE(lc_medium, 0) * 50) + 
            (COALESCE(lc_hard, 0) * 100) + 
            (COALESCE(cf_rating, 0) * 1) + 
            (COALESCE(cc_rating, 0) * 1) + 
            (COALESCE(hackerrank_score, 0) * 0.5) + 
            (COALESCE(college_contest_points, 0)),
        
        weekly_solved_count = (
            (COALESCE(lc_easy, 0) + COALESCE(lc_medium, 0) + COALESCE(lc_hard, 0)) - COALESCE(total_solved_snapshot, 0)
        )
    WHERE email = $1
    RETURNING *
`;

// Helper function to calculate progress metrics
async function calculateProgressMetrics(email) {
  try {
    const userResult = await pool.query(
      `SELECT lc_easy, lc_medium, lc_hard, cf_solved, cc_solved, hr_solved, created_at 
       FROM users WHERE email = $1`,
      [email]
    );
    
    if (userResult.rows.length === 0) return [];
    
    const user = userResult.rows[0];
    const totalSolved = (user.lc_easy || 0) + (user.lc_medium || 0) + (user.lc_hard || 0) + 
                       (user.cf_solved || 0) + (user.cc_solved || 0) + (user.hr_solved || 0);
    
    const joinDate = new Date(user.created_at);
    const monthsDiff = Math.floor((new Date() - joinDate) / (30 * 24 * 60 * 60 * 1000));
    
    const progressData = [];
    for (let i = 0; i <= Math.min(monthsDiff, 6); i++) {
      const date = new Date(joinDate);
      date.setMonth(joinDate.getMonth() + i);
      
      const progressFactor = (i + 1) / (monthsDiff + 1);
      const monthlySolved = Math.floor(totalSolved * progressFactor * (0.2 + Math.random() * 0.3));
      
      progressData.push({
        date: date.toISOString().slice(0, 7),
        problemsSolved: monthlySolved,
        cumulativeSolved: Math.floor(totalSolved * progressFactor)
      });
    }
    
    return progressData;
  } catch (error) {
    console.error('Progress metrics error:', error);
    return [];
  }
}

// Helper function to calculate skill distribution
function calculateSkillDistribution(user) {
  const skills = [];
  
  if ((user.lc_easy || 0) > 0) {
    skills.push({ name: 'Basic Problems', value: user.lc_easy, color: '#10B981' });
  }
  
  if ((user.lc_medium || 0) > 0) {
    skills.push({ name: 'Intermediate Problems', value: user.lc_medium, color: '#F59E0B' });
  }
  
  if ((user.lc_hard || 0) > 0) {
    skills.push({ name: 'Advanced Problems', value: user.lc_hard, color: '#EF4444' });
  }
  
  if ((user.cf_rating || 0) > 0) {
    skills.push({ name: 'Competitive Rating', value: Math.floor(user.cf_rating / 10), color: '#3B82F6' });
  }
  
  return skills;
}

// Helper function to calculate percentile
function calculatePercentile(userValue, average) {
  if (!average || average === 0) return 50;
  const ratio = userValue / average;
  if (ratio >= 2) return 95;
  if (ratio >= 1.5) return 85;
  if (ratio >= 1.2) return 75;
  if (ratio >= 1) return 60;
  if (ratio >= 0.8) return 40;
  if (ratio >= 0.6) return 25;
  return 15;
}

// --- ROUTES ---

app.get('/', (req, res) => res.json({ 
    message: 'CodeCampus Server Running 🚀',
    version: '1.0.0',
    endpoints: [
        '/api/register', 
        '/api/login', 
        '/api/leaderboard', 
        '/api/leaderboard/top10',
        '/api/refresh-stats', 
        '/api/metrics',
        '/api/stats/overall',
        '/api/stats/platforms',
        '/api/analytics/user/:email',
        '/api/analytics/comparison/:email'
    ]
}));

// 1. REGISTER
app.post('/api/register', validateUserData, async (req, res) => {
    try {
        const { name, email, password, branch, semester, year, roll_number, leetcode_id, codeforces_id, codechef_id, hackerrank_id } = req.body;
        
        console.log('📝 Registration attempt:', { name, email, roll_number });

        const userCheck = await pool.query(
            "SELECT * FROM users WHERE email = $1 OR roll_number = $2", 
            [email, roll_number]
        );
        
        if (userCheck.rows.length > 0) {
            const existing = userCheck.rows[0];
            if (existing.email === email) {
                return res.status(409).json({ message: "User already exists with this email!" });
            }
            if (existing.roll_number === roll_number) {
                return res.status(409).json({ message: "User already exists with this roll number!" });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        console.log('🔐 Password hashed successfully');

        await pool.query(
            `INSERT INTO users (name, email, password, branch, semester, year, roll_number, leetcode_id, codeforces_id, codechef_id, hackerrank_id) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [name, email, hashedPassword, branch, semester, year, roll_number, leetcode_id, codeforces_id, codechef_id, hackerrank_id]
        );

        console.log(`✅ New user registered: ${name} (${email})`);

        // Initial Data Fetch (async - don't wait for completion)
        setTimeout(async () => {
            try {
                const fetchPromises = [];
                
                if (leetcode_id) {
                    fetchPromises.push(
                        fetchLeetCodeStats(leetcode_id).then(lcStats => {
                            if (lcStats) {
                                return pool.query(
                                    `UPDATE users SET lc_easy=$1, lc_medium=$2, lc_hard=$3 WHERE email=$4`,
                                    [lcStats.easy, lcStats.medium, lcStats.hard, email]
                                );
                            }
                        })
                    );
                }

                if (hackerrank_id) {
                    fetchPromises.push(
                        fetchHackerRankStats(hackerrank_id).then(hrStats => {
                            if (hrStats) {
                                return pool.query(
                                    `UPDATE users SET hackerrank_score=$1, hr_solved=$2 WHERE email=$3`,
                                    [hrStats.score, hrStats.solved || 0, email]
                                );
                            }
                        })
                    );
                }

                if (codeforces_id) {
                    fetchPromises.push(
                        fetchCodeforcesStats(codeforces_id).then(cfStats => {
                            if (cfStats) {
                                return pool.query(
                                    `UPDATE users SET cf_rating=$1, cf_solved=$2 WHERE email=$3`,
                                    [cfStats.rating, cfStats.solved, email]
                                );
                            }
                        })
                    );
                }

                if (codechef_id) {
                    fetchPromises.push(
                        fetchCodeChefStats(codechef_id).then(ccStats => {
                            if (ccStats) {
                                return pool.query(
                                    `UPDATE users SET cc_rating=$1, cc_solved=$2 WHERE email=$3`,
                                    [ccStats.rating, ccStats.solved, email]
                                );
                            }
                        })
                    );
                }

                await Promise.allSettled(fetchPromises);

                const userRes = await pool.query("SELECT lc_easy, lc_medium, lc_hard FROM users WHERE email = $1", [email]);
                const user = userRes.rows[0];
                if (user) {
                    const totalSolved = (user.lc_easy || 0) + (user.lc_medium || 0) + (user.lc_hard || 0);
                    await pool.query(`UPDATE users SET total_solved_snapshot=$1 WHERE email=$2`, [totalSolved, email]);
                    await pool.query(RECALCULATE_SCORE_QUERY, [email]);
                }
                
                console.log(`✅ Stats fetched for: ${name}`);
            } catch (error) {
                console.error(`❌ Error fetching stats for ${name}:`, error);
            }
        }, 1000);

        res.status(201).json({ 
            message: "Registration Successful! 🎉", 
            user: { name, email, roll_number, branch, semester, year }
        });

    } catch (err) {
        console.error('❌ Registration error:', err);
        res.status(500).json({ message: "Server Error during registration: " + err.message });
    }
});

// 2. LOGIN
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('🔐 Login attempt for:', email);
        
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        
        if (userResult.rows.length === 0) {
            console.log('❌ User not found:', email);
            return res.status(401).json({ message: "User not found!" });
        }

        const user = userResult.rows[0];
        console.log('👤 User found:', user.email);
        
        let isValidPassword = false;
        
        if (user.password && user.password.length < 60) {
            isValidPassword = (user.password === password);
            console.log('🔐 Using plain text comparison');
        } else {
            isValidPassword = await bcrypt.compare(password, user.password);
            console.log('🔐 Using bcrypt comparison');
        }

        if (isValidPassword) {
            const { password: _, ...userWithoutPassword } = user;
            console.log('✅ Login successful for:', email);
            return res.json({ 
                message: "Login Successful! ✅", 
                user: userWithoutPassword 
            });
        }

        console.log('❌ Invalid password for:', email);
        return res.status(401).json({ message: "Invalid password!" });

    } catch (err) {
        console.error('❌ Login error:', err);
        res.status(500).json({ message: "Server Error during login: " + err.message });
    }
});

// 3. UPDATE PROFILE
app.put('/api/update-profile', async (req, res) => {
    try {
        const { email, leetcode_id, codeforces_id, codechef_id, hackerrank_id, bg_skin } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const updatedUser = await pool.query(
            `UPDATE users SET leetcode_id=$1, codeforces_id=$2, codechef_id=$3, hackerrank_id=$4, bg_skin=$5 
             WHERE email=$6 RETURNING id, name, email, roll_number, branch, semester, year, role, leetcode_id, codeforces_id, codechef_id, hackerrank_id, bg_skin`,
            [leetcode_id, codeforces_id, codechef_id, hackerrank_id, bg_skin, email]
        );
        
        res.json({ 
            message: "Profile Updated Successfully! ✅", 
            user: updatedUser.rows[0] 
        });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ message: "Server Error while updating profile" });
    }
});

// 4. GET USER PROFILE
app.get('/api/user/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const user = await pool.query(
            "SELECT id, name, email, roll_number, branch, semester, year, role, leetcode_id, codeforces_id, codechef_id, hackerrank_id, bg_skin FROM users WHERE email = $1",
            [email]
        );
        
        if (user.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.json(user.rows[0]);
    } catch (err) {
        console.error('User profile error:', err);
        res.status(500).json({ message: "Server Error" });
    }
});

// 5. REFRESH STATS
app.post('/api/refresh-stats', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const userRes = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = userRes.rows[0];
        const today = new Date().toISOString().slice(0, 10);
        const lastDate = user.last_fetched ? new Date(user.last_fetched).toISOString().slice(0, 10) : null;
        let count = (lastDate === today) ? user.fetch_count : 0;

        if (count >= 5) {
            return res.status(429).json({ 
                message: "Daily refresh limit reached! (5/5) Try again tomorrow. 🕒",
                limit: 5,
                used: count
            });
        }

        console.log(`🔄 Refreshing stats for: ${email} (${count + 1}/5)`);

        const fetchPromises = [];

        if (user.leetcode_id) {
            fetchPromises.push(
                fetchLeetCodeStats(user.leetcode_id).then(lc => {
                    if (lc) {
                        return pool.query(
                            `UPDATE users SET lc_easy=$1, lc_medium=$2, lc_hard=$3 WHERE email=$4`,
                            [lc.easy, lc.medium, lc.hard, email]
                        );
                    }
                })
            );
        }

        if (user.codeforces_id) {
            fetchPromises.push(
                fetchCodeforcesStats(user.codeforces_id).then(cf => {
                    if (cf) {
                        return pool.query(
                            `UPDATE users SET cf_rating=$1, cf_solved=$2 WHERE email=$3`,
                            [cf.rating, cf.solved, email]
                        );
                    }
                })
            );
        }

        if (user.codechef_id) {
            fetchPromises.push(
                fetchCodeChefStats(user.codechef_id).then(cc => {
                    if (cc) {
                        return pool.query(
                            `UPDATE users SET cc_rating=$1, cc_solved=$2 WHERE email=$3`,
                            [cc.rating, cc.solved, email]
                        );
                    }
                })
            );
        }

        if (user.hackerrank_id) {
            fetchPromises.push(
                fetchHackerRankStats(user.hackerrank_id).then(hr => {
                    if (hr) {
                        return pool.query(
                            `UPDATE users SET hackerrank_score=$1, hr_solved=$2 WHERE email=$3`,
                            [hr.score, hr.solved || 0, email]
                        );
                    }
                })
            );
        }

        await Promise.allSettled(fetchPromises);
        await pool.query(`UPDATE users SET last_fetched=NOW(), fetch_count=$1 WHERE email=$2`, [count + 1, email]);
        
        const finalUser = await pool.query(RECALCULATE_SCORE_QUERY, [email]);

        res.json({ 
            message: "Stats Refreshed Successfully! ✅", 
            user: finalUser.rows[0],
            refreshCount: count + 1,
            remaining: 5 - (count + 1)
        });

    } catch (err) {
        console.error('Refresh stats error:', err);
        res.status(500).json({ message: "Server Error while refreshing stats" });
    }
});

// 6. LEADERBOARD & CODER OF THE WEEK
app.get('/api/leaderboard', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT name, email, roll_number, branch, year, semester, role, passout_year, bg_skin,
                   lc_easy, lc_medium, lc_hard, total_score, weekly_solved_count,
                   cf_rating, cc_rating, hackerrank_score, college_contest_points,
                   leetcode_id, codeforces_id, codechef_id, hackerrank_id
            FROM users 
            ORDER BY total_score DESC
        `);

        const topPerformer = [...result.rows].sort((a, b) => {
            if (b.weekly_solved_count === a.weekly_solved_count) {
                return b.total_score - a.total_score;
            }
            return b.weekly_solved_count - a.weekly_solved_count;
        })[0];

        res.json({ 
            leaderboard: result.rows, 
            coderOfWeek: topPerformer,
            totalStudents: result.rows.length,
            lastUpdated: new Date().toISOString()
        });
    } catch (err) {
        console.error('Leaderboard error:', err);
        res.status(500).json({ message: "Server Error while fetching leaderboard" });
    }
});

// 7. GET TOP 10 PERFORMERS
app.get('/api/leaderboard/top10', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT name, email, roll_number, branch, year, semester, role, 
                   lc_easy, lc_medium, lc_hard, total_score, weekly_solved_count,
                   cf_rating, cc_rating, hackerrank_score, college_contest_points,
                   leetcode_id, codeforces_id, codechef_id, hackerrank_id, bg_skin
            FROM users 
            ORDER BY total_score DESC
            LIMIT 10
        `);

        res.json({
            topPerformers: result.rows,
            lastUpdated: new Date().toISOString()
        });
    } catch (err) {
        console.error('Top 10 leaderboard error:', err);
        res.status(500).json({ message: "Server Error while fetching top performers" });
    }
});

// 8. GET GLOBAL METRICS
app.get('/api/metrics', async (req, res) => {
    try {
        const solvedResult = await pool.query(`
            SELECT 
                COALESCE(SUM(lc_easy), 0) + 
                COALESCE(SUM(lc_medium), 0) + 
                COALESCE(SUM(lc_hard), 0) AS total_solved
            FROM users
        `);

        const ratingResult = await pool.query(`
            SELECT GREATEST(
                COALESCE(MAX(cf_rating), 0), 
                COALESCE(MAX(cc_rating), 0)
            ) AS highest_rating
            FROM users
        `);

        const contestEstimateResult = await pool.query(`
            SELECT COUNT(*) as total_users FROM users
        `);

        const metrics = {
            total_solved: solvedResult.rows[0].total_solved || 0,
            highest_rating: ratingResult.rows[0].highest_rating || 0,
            contests_participated: Math.floor(contestEstimateResult.rows[0].total_users * 10) || 0,
            consistency_streak: 365,
        };

        res.json(metrics);
    } catch (err) {
        console.error('Metrics error:', err);
        res.status(500).json({ message: "Server Error while fetching global metrics" });
    }
});

// 9. GET USER ANALYTICS DATA
app.get('/api/analytics/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const userResult = await pool.query(
      `SELECT name, email, roll_number, branch, semester, year,
              lc_easy, lc_medium, lc_hard, cf_rating, cc_rating, 
              hackerrank_score, hr_solved, cf_solved, cc_solved,
              total_score, weekly_solved_count, college_contest_points,
              leetcode_id, codeforces_id, codechef_id, hackerrank_id,
              created_at, last_fetched
       FROM users WHERE email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userResult.rows[0];
    
    const leetcodeTotal = (user.lc_easy || 0) + (user.lc_medium || 0) + (user.lc_hard || 0);
    const totalSolved = leetcodeTotal + (user.cf_solved || 0) + (user.cc_solved || 0) + (user.hr_solved || 0);
    
    const progressData = await calculateProgressMetrics(email);
    
    const analytics = {
      userProfile: {
        name: user.name,
        email: user.email,
        rollNumber: user.roll_number,
        branch: user.branch,
        semester: user.semester,
        year: user.year,
        joinDate: user.created_at,
        lastActive: user.last_fetched
      },
      platformStats: {
        leetcode: {
          easy: user.lc_easy || 0,
          medium: user.lc_medium || 0,
          hard: user.lc_hard || 0,
          total: leetcodeTotal
        },
        codeforces: {
          solved: user.cf_solved || 0,
          rating: user.cf_rating || 0
        },
        codechef: {
          solved: user.cc_solved || 0,
          rating: user.cc_rating || 0
        },
        hackerrank: {
          solved: user.hr_solved || 0,
          score: user.hackerrank_score || 0
        }
      },
      overallMetrics: {
        totalProblemsSolved: totalSolved,
        totalScore: user.total_score || 0,
        weeklySolved: user.weekly_solved_count || 0,
        contestPoints: user.college_contest_points || 0,
        platformCount: [user.leetcode_id, user.codeforces_id, user.codechef_id, user.hackerrank_id]
          .filter(Boolean).length
      },
      progressOverTime: progressData,
      skillDistribution: calculateSkillDistribution(user)
    };

    res.json(analytics);
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ message: "Server Error while fetching analytics" });
  }
});

// 10. GET COMPARATIVE ANALYSIS
app.get('/api/analytics/comparison/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const userResult = await pool.query(
      `SELECT lc_easy, lc_medium, lc_hard, cf_solved, cc_solved, hr_solved, total_score, branch
       FROM users WHERE email = $1`,
      [email]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const currentUser = userResult.rows[0];
    const userTotal = (currentUser.lc_easy || 0) + (currentUser.lc_medium || 0) + (currentUser.lc_hard || 0) +
                     (currentUser.cf_solved || 0) + (currentUser.cc_solved || 0) + (currentUser.hr_solved || 0);
    
    const branchAvgResult = await pool.query(
      `SELECT 
        AVG(lc_easy + lc_medium + lc_hard + cf_solved + cc_solved + hr_solved) as avg_solved,
        AVG(total_score) as avg_score,
        COUNT(*) as total_students
       FROM users 
       WHERE branch = $1 AND email != $2`,
      [currentUser.branch, email]
    );
    
    const overallAvgResult = await pool.query(
      `SELECT 
        AVG(lc_easy + lc_medium + lc_hard + cf_solved + cc_solved + hr_solved) as avg_solved,
        AVG(total_score) as avg_score,
        COUNT(*) as total_students
       FROM users 
       WHERE email != $1`,
      [email]
    );
    
    const comparison = {
      userStats: {
        totalSolved: userTotal,
        totalScore: currentUser.total_score || 0,
        branch: currentUser.branch
      },
      branchComparison: {
        avgSolved: Math.round(branchAvgResult.rows[0].avg_solved || 0),
        avgScore: Math.round(branchAvgResult.rows[0].avg_score || 0),
        totalStudents: parseInt(branchAvgResult.rows[0].total_students) + 1
      },
      overallComparison: {
        avgSolved: Math.round(overallAvgResult.rows[0].avg_solved || 0),
        avgScore: Math.round(overallAvgResult.rows[0].avg_score || 0),
        totalStudents: parseInt(overallAvgResult.rows[0].total_students) + 1
      },
      percentile: {
        branchPercentile: calculatePercentile(userTotal, branchAvgResult.rows[0].avg_solved),
        overallPercentile: calculatePercentile(userTotal, overallAvgResult.rows[0].avg_solved)
      }
    };
    
    res.json(comparison);
  } catch (err) {
    console.error('Comparison analytics error:', err);
    res.status(500).json({ message: "Server Error while fetching comparison data" });
  }
});

// 11. FIX PASSWORDS ENDPOINT
app.post('/api/fix-passwords', async (req, res) => {
    try {
        const users = await pool.query("SELECT id, email, password FROM users");
        let fixedCount = 0;
        
        for (const user of users.rows) {
            if (user.password && user.password.length < 60) {
                const hashedPassword = await bcrypt.hash(user.password, 12);
                await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, user.id]);
                console.log(`✅ Fixed password for: ${user.email}`);
                fixedCount++;
            }
        }
        
        res.json({ 
            message: `Passwords fixed successfully! Updated ${fixedCount} users.`,
            fixedCount 
        });
    } catch (error) {
        console.error('Error fixing passwords:', error);
        res.status(500).json({ error: error.message });
    }
});

// 12. DEBUG ROUTES
app.get('/api/debug/routes', (req, res) => {
    const routes = [];
    
    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            routes.push({
                path: middleware.route.path,
                methods: Object.keys(middleware.route.methods)
            });
        } else if (middleware.name === 'router') {
            middleware.handle.stack.forEach((handler) => {
                if (handler.route) {
                    routes.push({
                        path: '/api/stats' + handler.route.path,
                        methods: Object.keys(handler.route.methods)
                    });
                }
            });
        }
    });
    
    res.json({
        message: "All registered routes",
        routes: routes
    });
});

app.get('/api/debug/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, email, roll_number, branch, semester, year, total_score FROM users ORDER BY total_score DESC');
        res.json({
            realUserCount: result.rows.length,
            realUsers: result.rows
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 13. HEALTH CHECK
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// --- AUTOMATION (Cron Jobs) ---
cron.schedule('0 0 * * 0', async () => {
    console.log("📅 Weekly Reset: Updating Snapshots...");
    try {
        await pool.query(`
            UPDATE users 
            SET total_solved_snapshot = (COALESCE(lc_easy, 0) + COALESCE(lc_medium, 0) + COALESCE(lc_hard, 0)),
                weekly_solved_count = 0
        `);
        console.log("✅ Weekly reset completed successfully");
    } catch (error) {
        console.error("❌ Weekly reset failed:", error);
    }
});

cron.schedule('0 0 28 2 *', async () => {
    console.log("🎓 Incrementing semesters...");
    try {
        await pool.query("UPDATE users SET semester = semester + 1 WHERE semester < 8 AND role = 'student'");
        console.log("✅ Semesters incremented successfully");
    } catch (error) {
        console.error("❌ Semester increment failed:", error);
    }
});

cron.schedule('0 0 31 8 *', async () => {
    console.log("🎓 Updating years and converting alumni...");
    try {
        await pool.query("UPDATE users SET semester = semester + 1, year = year + 1 WHERE role = 'student'");
        const currentYear = new Date().getFullYear();
        await pool.query(
            `UPDATE users SET role = 'alumni', passout_year = $1, semester = NULL, year = NULL 
             WHERE semester > 8 AND role = 'student'`, 
            [currentYear]
        );
        console.log("✅ Year update and alumni conversion completed");
    } catch (error) {
        console.error("❌ Year update failed:", error);
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: "Endpoint not found" });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`👤 Test registration: http://localhost:${PORT}/api/register`);
    console.log(`🔐 Test login: http://localhost:${PORT}/api/login`);
    console.log(`📊 Stats overall: http://localhost:${PORT}/api/stats/overall`);
    console.log(`🏆 Top 10: http://localhost:${PORT}/api/leaderboard/top10`);
    console.log(`📈 Analytics: http://localhost:${PORT}/api/analytics/user/test@example.com`);
});