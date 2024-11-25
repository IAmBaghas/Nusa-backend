const pool = require('../config/database');
const moment = require('moment-timezone');

// Get all agendas (web version)
const getAgendas = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, title, description, 
                   start_date AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta' as start_date,
                   end_date AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta' as end_date 
            FROM agenda 
            ORDER BY start_date ASC
        `);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching agendas:', error);
        res.status(500).json({ message: 'Error fetching agendas' });
    }
};

// Create new agenda
const createAgenda = async (req, res) => {
    const { title, description, start_date, end_date } = req.body;
    try {
        const utcStart = moment(start_date).tz('Asia/Jakarta').utc();
        const utcEnd = moment(end_date).tz('Asia/Jakarta').utc();

        const result = await pool.query(
            `INSERT INTO agenda (title, description, start_date, end_date) 
             VALUES ($1, $2, $3, $4) 
             RETURNING *`,
            [title, description, utcStart.toISOString(), utcEnd.toISOString()]
        );
        
        const agenda = {
            ...result.rows[0],
            start_date: moment.utc(result.rows[0].start_date).tz('Asia/Jakarta').format(),
            end_date: moment.utc(result.rows[0].end_date).tz('Asia/Jakarta').format()
        };
        
        res.status(201).json(agenda);
    } catch (error) {
        console.error('Error creating agenda:', error);
        res.status(500).json({ message: 'Error creating agenda' });
    }
};

// Update agenda with timezone handling
const updateAgenda = async (req, res) => {
    const { id } = req.params;
    const { title, description, start_date, end_date } = req.body;
    try {
        const utcStart = moment(start_date).tz('Asia/Jakarta').utc();
        const utcEnd = moment(end_date).tz('Asia/Jakarta').utc();

        const result = await pool.query(
            `UPDATE agenda 
             SET title = $1, description = $2, 
                 start_date = $3, end_date = $4 
             WHERE id = $5 
             RETURNING *`,
            [title, description, utcStart.toISOString(), utcEnd.toISOString(), id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Agenda not found' });
        }

        const agenda = {
            ...result.rows[0],
            start_date: moment.utc(result.rows[0].start_date).tz('Asia/Jakarta').format(),
            end_date: moment.utc(result.rows[0].end_date).tz('Asia/Jakarta').format()
        };

        res.json(agenda);
    } catch (error) {
        console.error('Error updating agenda:', error);
        res.status(500).json({ message: 'Error updating agenda' });
    }
};

// Delete agenda
const deleteAgenda = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'DELETE FROM agenda WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Agenda not found' });
        }

        res.json({ message: 'Agenda deleted successfully' });
    } catch (error) {
        console.error('Error deleting agenda:', error);
        res.status(500).json({ message: 'Error deleting agenda' });
    }
};

module.exports = {
    getAgendas,
    createAgenda,
    updateAgenda,
    deleteAgenda
}; 