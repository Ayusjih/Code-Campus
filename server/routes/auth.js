// [2025-12-06 22:10] server/routes/auth.js
// Description: Fixed Column names to match Neon DB Schema exactly.

const router = require("express").Router();
const pool = require("../db");
const admin = require("../firebaseAdmin");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Token Verification Error:", error);
    return res.status(403).json({ message: "Unauthorized: Invalid token" });
  }
};

// --- REGISTER ROUTE (DB Schema Matched) ---
router.post("/register", verifyToken, async (req, res) => {
  try {
    const { 
      name, 
      roll_number, 
      branch, 
      semester, 
      year, 
      leetcode_handle,    // Frontend se handle hi aayega
      codeforces_handle, 
      codechef_handle, 
      hackerrank_handle 
    } = req.body;

    const email = req.user.email;

    // 1. Check User
    const userExist = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ message: "User already exists!" });
    }

    // 2. Insert (Using Correct DB Column Names)
    // created_at -> joined_at
    // leetcode_handle -> leetcode_id
    // is_verified -> REMOVED (doesn't exist in DB)
    const newUser = await pool.query(
      `INSERT INTO users (
        name, email, password, roll_number, branch, semester, year,
        leetcode_id, codeforces_id, codechef_id, hackerrank_id,
        joined_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW()) 
      RETURNING *`,
      [
        name,
        email,
        "firebase_authenticated",
        roll_number,
        branch,
        semester,
        year, // Make sure this is a Number, not "2nd"
        leetcode_handle || null,
        codeforces_handle || null,
        codechef_handle || null,
        hackerrank_handle || null
      ]
    );

    res.json({ message: "Registration Successful", user: newUser.rows[0] });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server Error: " + err.message });
  }
});

// --- LOGIN ROUTE ---
router.post("/login", verifyToken, async (req, res) => {
  try {
    const email = req.user.email;
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found. Please Register." });
    }

    // Update login time logic removed as 'last_login' column wasn't clearly visible/might cause issues
    // If you have 'last_login' column, uncomment below:
    // await pool.query("UPDATE users SET last_login = NOW() WHERE email = $1", [email]);

    res.json({ message: "Login Successful", user: user.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;