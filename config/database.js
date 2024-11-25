const { Pool } = require('pg');
require('dotenv').config();

// Database configuration
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'sekolahglr',
    password: 'sayaikan',
    port: 5432,
    // Add these options for better error handling
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    max: 20,
    maxUses: 7500,
    connectionTimeoutMillis: 2000
});

// Test database connection
const testConnection = async () => {
    let client;
    try {
        client = await pool.connect();
        console.log('Database connected successfully');

        // Test if agenda table exists
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'agenda'
            );
        `);

        if (!tableCheck.rows[0].exists) {
            console.log('Creating agenda table...');
            await client.query(`
                CREATE TABLE IF NOT EXISTS agenda (
                    id SERIAL PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    start_date TIMESTAMP NOT NULL,
                    end_date TIMESTAMP NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('Agenda table created successfully');
        }

        // Insert test data if table is empty
        const countResult = await client.query('SELECT COUNT(*) FROM agenda');
        if (parseInt(countResult.rows[0].count) === 0) {
            console.log('Inserting test data...');
            await client.query(`
                INSERT INTO agenda (title, description, start_date, end_date)
                VALUES 
                    ('Test Event 1', 'Description for test event 1', NOW(), NOW() + interval '2 days'),
                    ('Test Event 2', 'Description for test event 2', NOW() + interval '3 days', NOW() + interval '5 days')
            `);
            console.log('Test data inserted successfully');
        }

    } catch (err) {
        console.error('Database connection error:', err);
        throw err;
    } finally {
        if (client) {
            client.release();
        }
    }
};

// Execute test connection
testConnection().catch(console.error);

// Add error handler
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = pool;