const express = require('express');
const router = express.Router();
const readingsController = require('../controllers/readings.controller');

// POST - Recibir datos del ESP32
router.post('/', readingsController.receiveReading);

// GET - Obtener la última lectura (para pruebas)
router.get('/latest', readingsController.getLatestReading);

// GET - Obtener todas las lecturas (opcional para futuro)
router.get('/', readingsController.getAllReadings);

module.exports = router;