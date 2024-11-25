const pool = require('../config/database');

const getCategories = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, judul 
            FROM kategori 
            ORDER BY id ASC
        `);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching categories' 
        });
    }
};

module.exports = {
    getCategories
}; 