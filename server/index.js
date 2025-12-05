const express = require('express');
const cors = require('cors');
const pool = require('./db');
const fetchLeetCodeStats = require('./leetcodeFetcher');
const fetchHackerRankStats = require('./hackerrankFetcher');
const fetchCodeforcesStats = require('./codeforcesFetcher');
const fetchCodeChefStats = require('./codechefFetcher');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const otpValidator = require('./otpValidator');
const bcrypt = require("bcryptjs");
require('dotenv').config();
const jwt = require("jsonwebtoken");
const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const allowedOrigins = [
  'https://codeecampus.netlify.app',      // Your Netlify frontend
  'http://localhost:5173',               // Local dev frontend
  'https://code-campus-2-r20j.onrender.com', // Your Render backend (self)
  // Add your Vercel URL here if you moved to Vercel
  'https://code-campus-gamma.vercel.app/' 
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Handle preflight requests
app.options('*', cors());
app.use(express.json());
app.use('/api/otp', otpValidator);

// --- EMAIL TRANSPORTER SETUP ---
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
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
         
         <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
           <p style="color: #999; font-size: 12px; margin: 5px 0;">
             If you didn't request this OTP, please ignore this email.
           </p>
           <p style="color: #999; font-size: 12px; margin: 5px 0;">
             © ${new Date().getFullYear()} Code Campus - ITM Gwalior. All rights reserved.
           </p>
         </div>
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
    if (process.env.NODE_ENV === 'development') {
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

// 3. REGISTER USER (after OTP verification)
app.post('/api/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      branch,
      semester,
      year,
      leetcode_id,
      codeforces_id,
      codechef_id,
      hackerrank_id,
      roll_number
    } = req.body;

    // ---------- VALIDATION ----------
    if (!name || !email || !password || !branch || !semester || !year || !roll_number) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    // Check user exist
    const userCheck = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR roll_number = $2",
      [email, roll_number]
    );

    if (userCheck.rows.length > 0) {
      const u = userCheck.rows[0];
      return res.status(401).json({
        message: u.email === email ? "Email already registered!" : "Roll Number already registered!"
      });
    }

    // 🔐 hash password before insert
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (
        name, email, password, branch, semester, year,
        leetcode_id, codeforces_id, codechef_id, hackerrank_id, roll_number
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        name,
        email,
        hashedPassword, // Saving the hash
        branch,
        semester,
        year,
        leetcode_id || null,
        codeforces_id || null,
        codechef_id || null,
        hackerrank_id || null,
        roll_number
      ]
    );

    // 🚀 RETURN RESPONSE IMMEDIATELY
    res.json({
      success: true,
      message: "Registration Successful! Redirecting...",
    });

    // ---------------- BACKGROUND STATS + WELCOME EMAIL ----------------
    (async () => {
      // 1️⃣ LeetCode
      if (leetcode_id) {
        try {
          const lc = await fetchLeetCodeStats(leetcode_id);
          if (lc) {
            await pool.query(
              `UPDATE users SET lc_easy=$1, lc_medium=$2, lc_hard=$3 WHERE email=$4`,
              [lc.easy, lc.medium, lc.hard, email]
            );
          }
        } catch (e) {
          console.log("LeetCode Fetch Error:", e.message);
        }
      }

      // 2️⃣ HackerRank
      if (hackerrank_id) {
        try {
          const hr = await fetchHackerRankStats(hackerrank_id);
          if (hr) {
            await pool.query(
              `UPDATE users SET hackerrank_score=$1 WHERE email=$2`,
              [hr.score, email]
            );
          }
        } catch (e) {
          console.log("HackerRank Fetch Error:", e.message);
        }
      }

      // 3️⃣ Codeforces
      if (codeforces_id) {
        try {
          const cf = await fetchCodeforcesStats(codeforces_id);
          if (cf) {
            await pool.query(
              `UPDATE users SET cf_rating=$1 WHERE email=$2`,
              [cf.rating, email]
            );
          }
        } catch (e) {
          console.log("Codeforces Fetch Error:", e.message);
        }
      }

      // 4️⃣ CodeChef
      if (codechef_id) {
        try {
          const cc = await fetchCodeChefStats(codechef_id);
          if (cc) {
            await pool.query(
              `UPDATE users SET cc_rating=$1 WHERE email=$2`,
              [cc.rating, email]
            );
          }
        } catch (e) {
          console.log("CodeChef Fetch Error:", e.message);
        }
      }

      // 5️⃣ Welcome Email
      try {
        const welcomeMail = {
          from: '"Code Campus Team" <noreply@codecampus.com>',
          to: email,
          subject: '🎉 Welcome to Code Campus!',
          html: `
             <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
               <div style="text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                           padding: 30px; border-radius: 10px 10px 0 0; color: white;">
                 <h1 style="margin: 0;">Welcome to Code Campus!</h1>
                 <p style="opacity: 0.9;">Your coding journey begins now</p>
               </div>
               
               <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
                 <h2>Hello ${name},</h2>
                 <p>Welcome to the official coding platform of ITM Gwalior! 🚀</p>
                 
                 <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                   <p style="margin: 10px 0;"><strong>📍 Your Account Details:</strong></p>
                   <p style="margin: 5px 0;">• Email: ${email}</p>
                   <p style="margin: 5px 0;">• Branch: ${branch}</p>
                   <p style="margin: 5px 0;">• Year: ${year}</p>
                   <p style="margin: 5px 0;">• Roll Number: ${roll_number}</p>
                 </div>
               </div>
             </div>
           `
        };

        await transporter.sendMail(welcomeMail);
        console.log(`📧 Welcome email sent to ${email}`);
      } catch (emailError) {
        console.log('Welcome email failed (but user registered):', emailError.message);
      }

      console.log("✔ Background Stats Updated for:", email);
    })();

  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({ message: "Server Error during registration" });
  }
});


// 4. LOGIN (UPDATED: SECURE BCRYPT CHECK)
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 1. Check if user exists
    const userRes = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userRes.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = userRes.rows[0];

    // 2. 🔥 SECURE PASSWORD CHECK 🔥
    // bcrypt.compare(plainPassword, hashedPassword)
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: "Incorrect Password" });
    }

    // 3. Generate Token
    const token = jwt.sign(
      { email: user.email, role: user.role, id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login Successful",
      token,
      user
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});


// 4.1 Developer Login (Plaintext check for developer is fine for now, or upgrade if needed)
app.post('/api/developer/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1 AND role='developer'",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ message: "Not Authorized Developer" });
    }

    const user = result.rows[0];
    // NOTE: If you want to use hashes for developers too, use bcrypt.compare here as well.
    // For now, keeping it as is based on your previous code.
    if (user.password !== password) {
      return res.status(401).json({ message: "Wrong Developer Password" });
    }

    const token = jwt.sign(
      { email: user.email, role: "developer" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({ success: true, message: "Developer Login Successful", token, user });
  } catch (err) {
    console.error('Developer login error:', err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// 5. UPDATE PROFILE
app.put('/api/update-profile', async (req, res) => {
  try {
    const { email, leetcode_id, codeforces_id, codechef_id, hackerrank_id, bg_skin } = req.body;
    
    // Safety check for existing user data to avoid null/undefined
    const currentUserRes = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (currentUserRes.rows.length === 0) return res.status(404).json({message: "User not found"});
    const currentUser = currentUserRes.rows[0];

    const new_lc = leetcode_id !== undefined ? leetcode_id : currentUser.leetcode_id;
    const new_cf = codeforces_id !== undefined ? codeforces_id : currentUser.codeforces_id;
    const new_cc = codechef_id !== undefined ? codechef_id : currentUser.codechef_id;
    const new_hr = hackerrank_id !== undefined ? hackerrank_id : currentUser.hackerrank_id;
    const new_skin = bg_skin !== undefined ? bg_skin : (currentUser.bg_skin || 'gradient-1');

    const updatedUser = await pool.query(
      `UPDATE users SET leetcode_id=$1, codeforces_id=$2, codechef_id=$3, hackerrank_id=$4, bg_skin=$5 WHERE email=$6 RETURNING *`,
      [new_lc, new_cf, new_cc, new_hr, new_skin, email]
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

    // Fetch All
    if (user.leetcode_id) {
      try {
        const lc = await fetchLeetCodeStats(user.leetcode_id);
        if (lc) await pool.query(`UPDATE users SET lc_easy=$1, lc_medium=$2, lc_hard=$3 WHERE email=$4`, [lc.easy, lc.medium, lc.hard, email]);
      } catch (e) {
        console.error('LeetCode fetch error:', e);
      }
    }
    if (user.hackerrank_id) {
      try {
        const hr = await fetchHackerRankStats(user.hackerrank_id);
        if (hr) await pool.query(`UPDATE users SET hackerrank_score=$1 WHERE email=$2`, [hr.score, email]);
      } catch (e) {
        console.error('HackerRank fetch error:', e);
      }
    }
    if (user.codeforces_id) {
      try {
        const cf = await fetchCodeforcesStats(user.codeforces_id);
        if (cf) await pool.query(`UPDATE users SET cf_rating=$1 WHERE email=$2`, [cf.rating, email]);
      } catch (e) {
        console.error('Codeforces fetch error:', e);
      }
    }
    if (user.codechef_id) {
      try {
        const cc = await fetchCodeChefStats(user.codechef_id);
        if (cc) await pool.query(`UPDATE users SET cc_rating=$1 WHERE email=$2`, [cc.rating, email]);
      } catch (e) {
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
                  leetcode_id, codeforces_id, codechef_id, hackerrank_id
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
