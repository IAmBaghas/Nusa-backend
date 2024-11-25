const pool = require('../config/database');
const moment = require('moment-timezone');

// Get all agendas for mobile
const getMobileAgendas = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, title, description, 
                   start_date AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta' as start_date,
                   end_date AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta' as end_date 
            FROM agenda 
            ORDER BY start_date ASC
        `);
        
        // Process dates for mobile display
        const processedAgendas = result.rows.map(agenda => ({
            ...agenda,
            start_date: moment(agenda.start_date).format('YYYY-MM-DD HH:mm:ss'),
            end_date: moment(agenda.end_date).format('YYYY-MM-DD HH:mm:ss')
        }));

        res.json({
            success: true,
            data: processedAgendas
        });
    } catch (error) {
        console.error('Error fetching mobile agendas:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching agendas',
            error: error.message 
        });
    }
};

// Get upcoming agendas for mobile
const getUpcomingAgendas = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, title, description, 
                   start_date AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta' as start_date,
                   end_date AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta' as end_date 
            FROM agenda 
            WHERE end_date >= CURRENT_TIMESTAMP
            ORDER BY start_date ASC
            LIMIT 5
        `);

        // Process dates for mobile display
        const processedAgendas = result.rows.map(agenda => ({
            ...agenda,
            start_date: moment(agenda.start_date).format('YYYY-MM-DD HH:mm:ss'),
            end_date: moment(agenda.end_date).format('YYYY-MM-DD HH:mm:ss')
        }));

        res.json({
            success: true,
            data: processedAgendas
        });
    } catch (error) {
        console.error('Error fetching upcoming agendas:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching upcoming agendas',
            error: error.message 
        });
    }
};

module.exports = {
    getMobileAgendas,
    getUpcomingAgendas
}; 