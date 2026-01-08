const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statistics.controller');

// GET - Obtener estadísticas de todos los dispositivos para una fecha
// Query: ?date=YYYY-MM-DD
router.get('/all', statisticsController.getAllDevicesStats);

// POST - Generar estadísticas para todos los dispositivos
// Body: { date: "YYYY-MM-DD" }
router.post('/generate-all', statisticsController.generateAllDailyStats);

// GET - Obtener resumen de estadísticas de un dispositivo
// Query: ?period=week|month|year
router.get('/:deviceId/summary', statisticsController.getStatsSummary);

// GET - Obtener estadísticas diarias de un dispositivo
// Query: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get('/:deviceId', statisticsController.getDailyStats);

// POST - Generar estadísticas diarias para un dispositivo
// Body: { date: "YYYY-MM-DD" }
router.post('/:deviceId/generate', statisticsController.generateDailyStats);

module.exports = router;