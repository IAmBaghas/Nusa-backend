const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { 
    getAgendas, 
    createAgenda, 
    updateAgenda, 
    deleteAgenda 
} = require('../controllers/agendaController');

// Public routes
router.get('/', getAgendas);

// Protected routes
router.post('/', authenticateToken, createAgenda);
router.put('/:id', authenticateToken, updateAgenda);
router.delete('/:id', authenticateToken, deleteAgenda);

module.exports = router;