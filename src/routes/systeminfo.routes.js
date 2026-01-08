const express = require('express');
const router = express.Router();
const systemInfoController = require('../controllers/systemInfo.controller');

// GET /api/system-info - Obtener información del sistema
router.get('/', systemInfoController.getSystemInfo);

// PUT /api/system-info - Actualizar información del sistema
router.put('/', systemInfoController.updateSystemInfo);

// POST /api/system-info/sync - Sincronizar estadísticas
router.post('/sync', systemInfoController.syncSystemStats);

// PATCH /api/system-info/status - Actualizar estado del sistema
router.patch('/status', systemInfoController.updateSystemStatus);

module.exports = router;