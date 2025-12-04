const { Pool } = require('pg');
require('dotenv').config();

// Determine if we are in production (Render) or local development
const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction 
    ? { rejectUnauthorized: false } // REQUIRED for Render Postgres
    : false // Optional for local dev
});

// Test connection on startup
pool.connect()
  .then(() => console.log('✅ Database connected successfully!'))
  .catch((err) => console.error('❌ Database connection failed:', err.message));

module.exports = pool;
