const express = require('express');
const router = express.Router();

// Importar rutas específicas
const readingsRoutes = require('./readings.routes');
const devicesRoutes = require('./devices.routes');
const statisticsRoutes = require('./statistics.routes');
const eventsRoutes = require('./events.routes');
const timezonesRoutes = require('./timezones.routes');
const systemInfoRoutes = require('./systeminfo.routes');

// Usar rutas
router.use('/readings', readingsRoutes);
router.use('/devices', devicesRoutes);
router.use('/statistics', statisticsRoutes);
router.use('/events', eventsRoutes);
router.use('/timezones', timezonesRoutes);
router.use('/system-info', systemInfoRoutes);

module.exports = router;