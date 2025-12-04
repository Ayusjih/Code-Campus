const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for Render to allow INSERT/WRITE
    }
});

pool.connect()
    .then(() => console.log('✅ Database connected (SSL Enabled)'))
    .catch((err) => console.error('❌ Database connection error', err));

module.exports = pool;
