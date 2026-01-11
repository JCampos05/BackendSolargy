const express = require('express');
const router = express.Router();
const readingsController = require('../controllers/readings.controller');

// POST - Recibir datos del ESP32
router.post('/', readingsController.receiveReading);

// GET - Obtener la última lectura (para pruebas)
router.get('/latest', readingsController.getLatestReading);

// GET - Obtener todas las lecturas (opcional para futuro)
router.get('/', readingsController.getAllReadings);

// GET - Obtener lecturas por rango de fechas
// Query: ?deviceId=X&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get('/range', readingsController.getReadingsByDateRange);

module.exports = router;