const express = require('express');
const router = express.Router();
const timezonesController = require('../controllers/timezones.controller');

// GET - Obtener todas las zonas horarias
router.get('/', timezonesController.getAllTimezones);

// GET - Obtener una zona horaria por ID
router.get('/:id', timezonesController.getTimezoneById);

module.exports = router;