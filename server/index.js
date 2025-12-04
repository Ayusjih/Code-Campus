const express = require('express');
const cors = require('cors');
const pool = require('./db');
const fetchLeetCodeStats = require('./leetcodeFetcher');
const fetchHackerRankStats = require('./hackerrankFetcher');
const fetchCodeforcesStats = require('./codeforcesFetcher');
const fetchCodeChefStats = require('./codechefFetcher');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration (Permissive for development & production)
app.use(cors({
  origin: [
    'https://codecampus.netlify.app',          // Production Frontend
    'https://code-campus-2-r20j.onrender.com', // Production Backend
    'http://localhost:5173',                   // Local Frontend
    'http://localhost:5000'                    // Local Backend
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// --- EMAIL TRANSPORTER SETUP ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Test email connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email server connection failed:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// --- OTP STORAGE (Temporary - use database in production) ---
const otpStore = new Map();

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// 1. SEND OTP FOR REGISTRATION
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email, name = '' } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Check if email already registered
    const userCheck = await pool.query(
      "SELECT email FROM users WHERE email = $1", 
      [email]
    );
    
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered. Please login instead.' 
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with expiration (10 minutes)
    otpStore.set(email, {
      otp,
      timestamp: Date.now(),
      attempts: 0,
      name: name
    });

    // Email HTML template
    const mailOptions = {
      from: '"Code Campus - ITM Gwalior" <noreply@codecampus.com>',
      to: email,
      subject: '🔐 Your OTP for Code Campus Registration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4F46E5; margin: 0;">Code Campus</h1>
            <p style="color: #666; margin: 5px 0;">ITM Gwalior</p>
          </div>
          
          <h2 style="color: #333;">Hello ${name || 'there'},</h2>
          <p>Your One-Time Password (OTP) for registration is:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; font-size: 32px; font-weight: bold; letter-spacing: 10px; 
                        padding: 20px 40px; border-radius: 10px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
              ${otp}
            </div>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            ⏰ This OTP is valid for <strong>10 minutes</strong>.<br>
            🔒 Do not share this OTP with anyone.<br>
            🚀 Enter this code in the registration form to verify your email.
          </p>
        </div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);
    
    console.log(`📧 OTP sent to ${email}: ${otp}`);
    
    res.json({ 
      success: true, 
      message: 'OTP sent successfully! Check your email.',
      email: email
    });

  } catch (err) {
    console.error('❌ OTP sending error:', err);
    
    // Fallback to console OTP for development
    if (process.env.NODE_ENV !== 'production') {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const { email } = req.body;
      
      if (email) {
        otpStore.set(email, {
          otp,
          timestamp: Date.now(),
          attempts: 0,
          name: req.body.name || ''
        });
        
        console.log(`🛠️ DEVELOPMENT MODE - OTP for ${email}: ${otp}`);
        
        return res.json({ 
          success: true, 
          message: 'OTP sent (development mode)',
          email: email,
          development_otp: otp
        });
      }
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send OTP. Please try again later.' 
    });
  }
});

// 2. VERIFY OTP
app.post('/api/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and OTP are required' 
      });
    }

    const storedData = otpStore.get(email);
    
    if (!storedData) {
      return res.status(400).json({ 
        success: false, 
        message: 'OTP expired or not found. Please request a new one.' 
      });
    }

    // Check if OTP expired (10 minutes)
    const isExpired = (Date.now() - storedData.timestamp) > 10 * 60 * 1000;
    
    if (isExpired) {
      otpStore.delete(email);
      return res.status(400).json({ 
        success: false, 
        message: 'OTP expired. Please request a new one.' 
      });
    }

    // Check OTP attempts
    if (storedData.attempts >= 3) {
      otpStore.delete(email);
      return res.status(400).json({ 
        success: false, 
        message: 'Too many failed attempts. Please request a new OTP.' 
      });
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      storedData.attempts += 1;
      otpStore.set(email, storedData);
      
      return res.status(400).json({ 
        success: false, 
        message: `Invalid OTP. ${3 - storedData.attempts} attempts remaining.` 
      });
    }

    // OTP verified successfully
    otpStore.delete(email);
    
    res.json({ 
      success: true, 
      message: 'Email verified successfully!',
      verified: true 
    });

  } catch (err) {
    console.error('❌ OTP verification error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify OTP' 
    });
  }
});

// 3. REGISTER USER (FIXED: Uses exact columns provided)
app.post('/api/register', async (req, res) => {
    try {
        console.log("📝 Register Request:", req.body); // Log request

        const { 
            name, email, password, branch, semester, year, enrollment, 
            leetcode_handle, codeforces_handle, codechef_handle, hackerrank_handle 
        } = req.body;
        
        // Validation
        if (!name || !email || !password || !branch || !semester || !year || !enrollment) {
          return res.status(400).json({ message: "All required fields must be filled" });
        }

        // Check for duplicates (Using 'roll_number' to match DB)
        const userCheck = await pool.query(
            "SELECT * FROM users WHERE email = $1 OR roll_number = $2", 
            [email, enrollment]
        );
        
        if (userCheck.rows.length > 0) {
            const existingUser = userCheck.rows[0];
            if (existingUser.email === email) {
                return res.status(401).json({ message: "Email already registered!" });
            }
            if (existingUser.roll_number === enrollment) {
                return res.status(401).json({ message: "Enrollment number already registered!" });
            }
        }

        // INSERT Query - Updated to match YOUR database columns exactly
        const newUser = await pool.query(
            `INSERT INTO users (
                name, email, password, branch, semester, year, 
                roll_number, 
                leetcode_handle, codeforces_handle, codechef_handle, hackerrank_handle,
                -- Initialize scores to 0
                lc_easy, lc_medium, lc_hard, cf_rating, cc_rating, hackerrank_score, total_score,
                -- Initialize defaults
                role, bg_skin, fetch_count, weekly_solved_count
            ) VALUES (
                $1, $2, $3, $4, $5, $6, 
                $7, 
                $8, $9, $10, $11, 
                0, 0, 0, 0, 0, 0, 0, 
                'student', 'gradient-1', 0, 0
            ) 
            RETURNING *`,
            [
                name, email, password, branch, semester, year, 
                enrollment, // Maps to roll_number
                leetcode_handle || null, 
                codeforces_handle || null, 
                codechef_handle || null, 
                hackerrank_handle || null
            ]
        );

        console.log(`✅ User registered: ${name}`);

        res.json({ 
            success: true,
            message: "Registration Successful!", 
            user: newUser.rows[0] 
        });

    } catch (err) { 
        console.error('❌ Registration error:', err); 
        // Send specific error for debugging
        res.status(500).json({ 
            success: false,
            message: `Server Error: ${err.message}`, 
            error: err.message 
        });
    }
});

// 4. LOGIN
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (user.rows.length === 0) return res.status(401).json({ message: "User not found!" });
        if (password !== user.rows[0].password) return res.status(401).json({ message: "Incorrect Password!" });
        res.json({ message: "Login Successful", user: user.rows[0] });
    } catch (err) { 
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

// 5. UPDATE PROFILE
app.put('/api/update-profile', async (req, res) => {
    try {
        const { email, leetcode_id, codeforces_id, codechef_id, hackerrank_id, bg_skin } = req.body;
        // Updated to use both _id and _handle to keep DB consistent if you use both
        const updatedUser = await pool.query(
            `UPDATE users SET 
             leetcode_handle=$1, codeforces_handle=$2, codechef_handle=$3, hackerrank_handle=$4, 
             leetcode_id=$1, codeforces_id=$2, codechef_id=$3, hackerrank_id=$4,
             bg_skin=$5 
             WHERE email=$6 RETURNING *`,
            [leetcode_id, codeforces_id, codechef_id, hackerrank_id, bg_skin, email]
        );
        res.json({ message: "Profile Saved!", user: updatedUser.rows[0] });
    } catch (err) { 
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

// 6. REFRESH STATS
app.post('/api/refresh-stats', async (req, res) => {
    try {
        const { email } = req.body;
        const userRes = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        const user = userRes.rows[0];

        if (!user) return res.status(404).json({ message: "User not found" });

        // Date Logic
        const today = new Date().toISOString().slice(0, 10);
        const lastDate = user.last_fetched ? new Date(user.last_fetched).toISOString().slice(0, 10) : null;
        let count = (lastDate === today) ? user.fetch_count : 0;

        if (count >= 5) return res.status(429).json({ message: "Daily Limit (5/5) Reached! Try tomorrow." });

        console.log(`🔄 Refreshing: ${email} (${count + 1}/5)`);

        // Use handles if ids are missing (fallbacks)
        const lc_user = user.leetcode_handle || user.leetcode_id;
        const hr_user = user.hackerrank_handle || user.hackerrank_id;
        const cf_user = user.codeforces_handle || user.codeforces_id;
        const cc_user = user.codechef_handle || user.codechef_id;

        // Fetch All
        if (lc_user) {
            try {
                const lc = await fetchLeetCodeStats(lc_user);
                if (lc) await pool.query(`UPDATE users SET lc_easy=$1, lc_medium=$2, lc_hard=$3 WHERE email=$4`, [lc.easy, lc.medium, lc.hard, email]);
            } catch(e) {
                console.error('LeetCode fetch error:', e);
            }
        }
        if (hr_user) {
            try {
                const hr = await fetchHackerRankStats(hr_user);
                if (hr) await pool.query(`UPDATE users SET hackerrank_score=$1 WHERE email=$2`, [hr.score, email]);
            } catch(e) {
                console.error('HackerRank fetch error:', e);
            }
        }
        if (cf_user) {
            try {
                const cf = await fetchCodeforcesStats(cf_user);
                if (cf) await pool.query(`UPDATE users SET cf_rating=$1 WHERE email=$2`, [cf.rating, email]);
            } catch(e) {
                console.error('Codeforces fetch error:', e);
            }
        }
        if (cc_user) {
            try {
                const cc = await fetchCodeChefStats(cc_user);
                if (cc) await pool.query(`UPDATE users SET cc_rating=$1 WHERE email=$2`, [cc.rating, email]);
            } catch(e) {
                console.error('CodeChef fetch error:', e);
            }
        }

        // Update Time, Count & Score
        await pool.query(`UPDATE users SET last_fetched=NOW(), fetch_count=$1 WHERE email=$2`, [count + 1, email]);
        const finalUser = await pool.query(RECALCULATE_SCORE_QUERY, [email]);

        res.json({ message: "Stats Refreshed!", user: finalUser.rows[0] });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

// 7. LEADERBOARD
app.get('/api/leaderboard', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT name, email, branch, year, semester, role, passout_year, bg_skin,
                   lc_easy, lc_medium, lc_hard, total_score, 
                   cf_rating, cc_rating, hackerrank_score, college_contest_points,
                   leetcode_handle, codeforces_handle, codechef_handle, hackerrank_handle
            FROM users ORDER BY total_score DESC
        `);
        res.json(result.rows);
    } catch (err) { 
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

// 8. RESEND OTP
app.post('/api/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Check if email already registered
    const userCheck = await pool.query(
      "SELECT email FROM users WHERE email = $1", 
      [email]
    );
    
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered.' 
      });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with expiration
    otpStore.set(email, {
      otp,
      timestamp: Date.now(),
      attempts: 0
    });

    // Send email
    const mailOptions = {
      from: '"Code Campus" <noreply@codecampus.com>',
      to: email,
      subject: '🔐 New OTP for Code Campus Registration',
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
          <h2 style="color: #4F46E5;">New OTP Requested</h2>
          <p>Your new verification code is:</p>
          <h1 style="background: #4F46E5; color: white; padding: 15px; display: inline-block; 
                     border-radius: 8px; letter-spacing: 8px; margin: 20px 0;">
            ${otp}
          </h1>
          <p>This code expires in 10 minutes.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    
    console.log(`📧 OTP resent to ${email}: ${otp}`);
    
    res.json({ 
      success: true, 
      message: 'New OTP sent successfully!' 
    });

  } catch (err) {
    console.error('❌ Resend OTP error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to resend OTP' 
    });
  }
});

// --- AUTOMATION ---
cron.schedule('0 0 28 2 *', async () => { 
    await pool.query("UPDATE users SET semester = semester + 1 WHERE semester < 8"); 
});

cron.schedule('0 0 31 8 *', async () => { 
    await pool.query("UPDATE users SET semester = semester + 1, year = year + 1 WHERE role = 'student'");
    const currentYear = new Date().getFullYear();
    await pool.query(
        `UPDATE users SET role = 'alumni', passout_year = $1, semester = NULL, year = NULL WHERE semester > 8 AND role = 'student'`, 
        [currentYear]
    );
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 Access at: http://localhost:${PORT}`);
    console.log(`📧 Email service: ${transporter.options.auth.user ? 'Configured' : 'Not configured'}`);
});
