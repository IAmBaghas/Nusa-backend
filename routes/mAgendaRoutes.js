const express = require('express');
const router = express.Router();
const { 
    getMobileAgendas,
    getUpcomingAgendas 
} = require('../controllers/mAgendaController');

// Mobile agenda routes
router.get('/', getMobileAgendas);
router.get('/upcoming', getUpcomingAgendas);

module.exports = router; 