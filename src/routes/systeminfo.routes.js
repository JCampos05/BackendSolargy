const express = require('express');
const router = express.Router();
const {
    getSystemInfo,
    updateSystemInfo,
    syncSystemStats,
    updateSystemStatus,
    updateLocation
} = require('../controllers/systeminfo.controller');

// GET /api/system-info - Obtener información del sistema
router.get('/', getSystemInfo);

// PUT /api/system-info - Actualizar información del sistema
router.put('/', updateSystemInfo);

// POST /api/system-info/sync - Sincronizar estadísticas
router.post('/sync', syncSystemStats);

// PATCH /api/system-info/status - Actualizar estado del sistema
router.patch('/status', updateSystemStatus);

// PATCH /api/system-info/location - Actualizar localización del sistema
router.patch('/location', updateLocation);

module.exports = router;