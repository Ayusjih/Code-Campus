const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function run() {
    try {
        await pool.query(`
            INSERT INTO branches (branch_code, branch_name) 
            VALUES 
                ('AIML', 'Artificial Intelligence & ML'), 
                ('CIVIL', 'Civil Engineering'), 
                ('IOT', 'Internet of Things') 
            ON CONFLICT DO NOTHING;
        `);
        console.log('Branches Seeded Success!');
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
run();
