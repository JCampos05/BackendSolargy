const express = require('express');
const router = express.Router();
const devicesController = require('../controllers/devices.controller');

// GET - Obtener todos los dispositivos
// Query params: ?activo=true
router.get('/', devicesController.getAllDevices);

// GET - Verificar dispositivos offline
// Query params: ?minutes=10
router.get('/check-offline', devicesController.checkOfflineDevices);

// GET - Obtener estadísticas de un dispositivo
// Query params: ?days=7
router.get('/:id/stats', devicesController.getDeviceStats);

// GET - Obtener un dispositivo por ID
router.get('/:id', devicesController.getDeviceById);

// POST - Crear nuevo dispositivo
router.post('/', devicesController.createDevice);

// PUT - Actualizar dispositivo
router.put('/:id', devicesController.updateDevice);

// PUT - Actualizar solo la zona horaria
router.put('/:id/timezone', devicesController.updateTimezone);

// DELETE - Eliminar dispositivo
router.delete('/:id', devicesController.deleteDevice);

module.exports = router;