const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/events.controller');

// GET - Obtener todos los eventos
// Query params: ?deviceId=X&tipo=X&severidad=X&resuelto=true&startDate=X&endDate=X&limit=100
router.get('/', eventsController.getAllEvents);

// GET - Obtener eventos no resueltos
// Query params: ?deviceId=X
router.get('/unresolved', eventsController.getUnresolvedEvents);

// GET - Obtener resumen de eventos
// Query params: ?deviceId=X&days=7
router.get('/summary', eventsController.getEventsSummary);

// GET - Obtener eventos críticos recientes
// Query params: ?hours=24
router.get('/critical', eventsController.getCriticalEvents);

// GET - Obtener un evento por ID
router.get('/:id', eventsController.getEventById);

// POST - Crear nuevo evento
router.post('/', eventsController.createEvent);

// PUT - Marcar evento como resuelto
// Body: { resolutionNote: "nota opcional" }
router.put('/:id/resolve', eventsController.resolveEvent);

// DELETE - Eliminar evento
router.delete('/:id', eventsController.deleteEvent);

module.exports = router;