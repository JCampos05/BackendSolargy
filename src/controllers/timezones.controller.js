const timezonesService = require('../services/timezones.service');

// Obtener todas las zonas horarias
exports.getAllTimezones = async (req, res) => {
    try {
        const timezones = await timezonesService.getAllTimezones();

        res.status(200).json({
            success: true,
            message: 'Zonas horarias obtenidas correctamente',
            count: timezones.length,
            data: timezones
        });
    } catch (error) {
        console.error('Error en getAllTimezones:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener zonas horarias',
            error: error.message
        });
    }
};

// Obtener una zona horaria por ID
exports.getTimezoneById = async (req, res) => {
    try {
        const { id } = req.params;
        const timezone = await timezonesService.getTimezoneById(id);

        res.status(200).json({
            success: true,
            message: 'Zona horaria encontrada',
            data: timezone
        });
    } catch (error) {
        console.error('Error en getTimezoneById:', error);
        res.status(404).json({
            success: false,
            message: error.message,
            error: error.message
        });
    }
};