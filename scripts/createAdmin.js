const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'sekolahglr',
    password: 'sayaikan',
    port: 5432,
});

async function createAdmin(username, email, password) {
    try {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new admin
        const query = `
            INSERT INTO petugas (username, email, password, is_verified)
            VALUES ($1, $2, $3, true)
            RETURNING id, username, email
        `;
        
        const result = await pool.query(query, [username, email, hashedPassword]);
        console.log('Admin created successfully:', result.rows[0]);
    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        pool.end();
    }
}

// Usage: node createAdmin.js username email password
const [,, username, email, password] = process.argv;
if (username && email && password) {
    createAdmin(username, email, password);
} else {
    console.log('Usage: node createAdmin.js username email password');
} 