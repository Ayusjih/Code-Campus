const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for Neon DB connections
    },
    // --- POOLING OPTIMIZATIONS ---
    max: 10,                  // Limit total connections to 10 (Safe for Neon Free Tier)
    idleTimeoutMillis: 30000, // Close connections that have been idle for 30s
    connectionTimeoutMillis: 2000, // Return an error if a connection takes > 2s to establish
});

// Test the connection immediately when this file is loaded
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    client.query('SELECT NOW()', (err, result) => {
        release(); // Release the client back to the pool
        if (err) {
            return console.error('Error executing query', err.stack);
        }
        console.log('✅ Connected to Neon PostgreSQL Database');
    });
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};