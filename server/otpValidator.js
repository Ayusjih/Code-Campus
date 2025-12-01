const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { Pool } = require('pg');

// ==================== CONFIGURATION ====================
const router = express.Router();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Email transporter (with fallback)
let transporter = null;
try {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password'
    },
    tls: { rejectUnauthorized: false }
  });
  console.log('✅ Email service initialized');
} catch (error) {
  console.log('⚠️ Email service setup failed:', error.message);
  transporter = null;
}

// ==================== HELPER FUNCTIONS ====================

// Generate 6-digit OTP
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

// Initialize OTP table
async function initOTPTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS otp_store (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_store(email);
      CREATE INDEX IF NOT EXISTS idx_otp_expiry ON otp_store(expires_at);
    `);
    console.log('✅ OTP table initialized');
  } catch (error) {
    console.error('Error initializing OTP table:', error);
  }
}

// Store OTP in database
async function storeOTP(email, otp) {
  try {
    // Delete old OTPs for this email
    await pool.query('DELETE FROM otp_store WHERE email = $1', [email]);

    // Store new OTP (expires in 10 minutes)
    await pool.query(
      `INSERT INTO otp_store (email, otp, expires_at) 
       VALUES ($1, $2, NOW() + INTERVAL '10 minutes')`,
      [email, otp]
    );
    return true;
  } catch (error) {
    console.error('Error storing OTP:', error);
    throw error;
  }
}

// Send OTP via email or console
async function sendOTP(email, otp) {
  // Store in database first
  await storeOTP(email, otp);

  // If no email service, log to console
  if (!transporter) {
    console.log(`📧 [CONSOLE] OTP for ${email}: ${otp}`);
    return { success: true, method: 'console', otp: otp };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Code Campus" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP Code - Code Campus',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #4F46E5;">Your Verification Code</h2>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="font-size: 32px; letter-spacing: 10px; color: #111827; margin: 0;">${otp}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p style="color: #6b7280; font-size: 14px;">Code Campus Platform</p>
        </div>
      `
    });
    console.log(`📧 Email sent to ${email}`);
    return { success: true, method: 'email', messageId: info.messageId };
  } catch (error) {
    console.error('Email send failed, logging to console:', error.message);
    console.log(`📧 [FALLBACK] OTP for ${email}: ${otp}`);
    return { success: true, method: 'console_fallback', otp: otp };
  }
}

// Verify OTP from database
async function verifyOTP(email, otp) {
  try {
    const result = await pool.query(
      `SELECT * FROM otp_store 
       WHERE email = $1 
       AND otp = $2 
       AND verified = false
       AND expires_at > NOW()`,
      [email, otp]
    );

    if (result.rows.length === 0) {
      return { success: false, message: 'Invalid or expired OTP' };
    }

    // Mark OTP as verified
    await pool.query(
      'UPDATE otp_store SET verified = true WHERE email = $1 AND otp = $2',
      [email, otp]
    );

    // Update user verification status if user exists
    try {
      await pool.query(
        'UPDATE users SET is_verified = true, last_login = NOW() WHERE email = $1',
        [email]
      );
    } catch (userError) {
      console.log('Note: User may not exist in users table yet');
    }

    return { success: true, message: 'OTP verified successfully' };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
}

// Clean expired OTPs
async function cleanupOTPs() {
  try {
    const result = await pool.query(
      'DELETE FROM otp_store WHERE expires_at < NOW()'
    );
    console.log(`🧹 Cleaned ${result.rowCount} expired OTPs`);
  } catch (error) {
    console.error('Error cleaning OTPs:', error);
  }
}

// ==================== API ROUTES ====================

// Initialize OTP system on startup
initOTPTable();
// Clean expired OTPs every hour
setInterval(cleanupOTPs, 60 * 60 * 1000);

// Request OTP
router.post('/request', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const otp = generateOTP();
    const result = await sendOTP(email, otp);

    res.json({
      success: true,
      message: result.method === 'email' 
        ? 'OTP sent to your email' 
        : 'OTP generated (check logs)',
      method: result.method
    });
  } catch (error) {
    console.error('OTP request error:', error);
    res.status(500).json({ error: 'Failed to process OTP request' });
  }
});

// Verify OTP
router.post('/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp || otp.length !== 6) {
      return res.status(400).json({ 
        error: 'Valid email and 6-digit OTP required' 
      });
    }

    const result = await verifyOTP(email, otp);
    
    if (result.success) {
      // Get or create user data
      let userResult;
      try {
        userResult = await pool.query(
          'SELECT id, name, email, department, total_score FROM users WHERE email = $1',
          [email]
        );
      } catch (dbError) {
        userResult = { rows: [] };
      }

      const user = userResult.rows[0] || { email, isNew: true };
      
      res.json({
        success: true,
        message: 'Login successful',
        user: user
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message
      });
    }
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'OTP verification failed' });
  }
});

// Check OTP status
router.post('/status', async (req, res) => {
  try {
    const { email } = req.body;
    const result = await pool.query(
      `SELECT otp, created_at, expires_at, verified 
       FROM otp_store 
       WHERE email = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.json({ hasOTP: false });
    }
    
    const otpData = result.rows[0];
    const isExpired = new Date() > new Date(otpData.expires_at);
    
    res.json({
      hasOTP: true,
      isVerified: otpData.verified,
      isExpired: isExpired,
      expiresIn: Math.max(0, Math.floor((new Date(otpData.expires_at) - new Date()) / 1000))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Resend OTP
router.post('/resend', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if recent OTP exists
    const recentOTP = await pool.query(
      `SELECT created_at FROM otp_store 
       WHERE email = $1 AND created_at > NOW() - INTERVAL '1 minute'`,
      [email]
    );
    
    if (recentOTP.rows.length > 0) {
      return res.status(429).json({ 
        error: 'Please wait 1 minute before requesting new OTP' 
      });
    }
    
    const otp = generateOTP();
    const result = await sendOTP(email, otp);
    
    res.json({
      success: true,
      message: 'New OTP sent',
      method: result.method
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    emailService: transporter ? 'active' : 'inactive',
    database: 'connected',
    timestamp: new Date().toISOString()
  });
});

// ==================== EXPORT ====================
module.exports = router;
