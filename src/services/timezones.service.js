const { ZonaHoraria } = require('../models');

/**
 * Obtener todas las zonas horarias
 */
exports.getAllTimezones = async () => {
    try {
        const timezones = await ZonaHoraria.findAll({
            order: [['offsetUTC', 'ASC']]
        });

        return timezones;
    } catch (error) {
        console.error('Error al obtener zonas horarias:', error);
        throw error;
    }
};

/**
 * Obtener una zona horaria por ID
 */
exports.getTimezoneById = async (id) => {
    try {
        const timezone = await ZonaHoraria.findByPk(id);

        if (!timezone) {
            throw new Error('Zona horaria no encontrada');
        }

        return timezone;
    } catch (error) {
        console.error('Error al obtener zona horaria:', error);
        throw error;
    }
};

/**
 * Buscar zona horaria por nombre
 */
exports.getTimezoneByName = async (nombreZona) => {
    try {
        const timezone = await ZonaHoraria.findOne({
            where: { nombreZona }
        });

        if (!timezone) {
            throw new Error('Zona horaria no encontrada');
        }

        return timezone;
    } catch (error) {
        console.error('Error al buscar zona horaria:', error);
        throw error;
    }
};