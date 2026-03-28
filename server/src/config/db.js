const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

// Debug logs (remove later)
console.log("CWD:", process.cwd());
console.log("DB URL:", process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is missing. Check .env.local file location.");
    process.exit(1);
}

// Create pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Test connection
pool.connect((err, client, release) => {
    if (err) {
        return console.error('❌ DB Connection Error:', err.message);
    }

    client.query('SELECT NOW()', (err, result) => {
        release();

        if (err) {
            return console.error('❌ Query Error:', err.stack);
        }

        console.log('✅ Connected to Supabase PostgreSQL');
    });
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};