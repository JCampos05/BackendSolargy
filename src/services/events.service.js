const { Event, Device } = require('../models');
const { Op } = require('sequelize');

/**
 * Obtener todos los eventos con filtros
 */
exports.getAllEvents = async (filters = {}) => {
    try {
        const where = {};

        // Filtro por dispositivo
        if (filters.deviceId) {
            where.idDispositivo = filters.deviceId;
        }

        // Filtro por tipo de evento
        if (filters.tipoEvento) {
            where.tipoEvento = filters.tipoEvento;
        }

        // Filtro por severidad
        if (filters.severidad) {
            where.severidad = filters.severidad;
        }

        // Filtro por estado resuelto
        if (filters.esResuelto !== undefined) {
            where.esResuelto = filters.esResuelto === 'true' || filters.esResuelto === true;
        }

        // Filtro por rango de fechas
        if (filters.startDate || filters.endDate) {
            where.fechaCreado = {};
            if (filters.startDate) {
                where.fechaCreado[Op.gte] = new Date(filters.startDate);
            }
            if (filters.endDate) {
                where.fechaCreado[Op.lte] = new Date(filters.endDate);
            }
        }

        const events = await Event.findAll({
            where,
            include: [{
                model: Device,
                as: 'dispositivo',
                attributes: ['idDispositivo', 'nombre', 'localizacion']
            }],
            order: [['fechaCreado', 'DESC']],
            limit: filters.limit ? parseInt(filters.limit) : 100
        });

        return events;
    } catch (error) {
        console.error('Error al obtener eventos:', error);
        throw error;
    }
};

/**
 * Obtener un evento por ID
 */
exports.getEventById = async (eventId) => {
    try {
        const event = await Event.findByPk(eventId, {
            include: [{
                model: Device,
                as: 'dispositivo',
                attributes: ['idDispositivo', 'nombre', 'localizacion']
            }]
        });

        if (!event) {
            throw new Error('Evento no encontrado');
        }

        return event;
    } catch (error) {
        console.error('Error al obtener evento:', error);
        throw error;
    }
};

/**
 * Crear un nuevo evento
 */
exports.createEvent = async (eventData) => {
    try {
        const event = await Event.create(eventData);

        console.log(`📋 Nuevo evento creado: ${event.tipoEvento} - ${event.titulo}`);

        return event;
    } catch (error) {
        console.error('Error al crear evento:', error);
        throw error;
    }
};

/**
 * Marcar evento como resuelto
 */
exports.resolveEvent = async (eventId, resolutionNote = null) => {
    try {
        const event = await Event.findByPk(eventId);

        if (!event) {
            throw new Error('Evento no encontrado');
        }

        if (event.esResuelto) {
            throw new Error('El evento ya está resuelto');
        }

        await event.update({
            esResuelto: true,
            fechaResuelto: new Date(),
            descripcion: resolutionNote
                ? `${event.descripcion}\n\nResolución: ${resolutionNote}`
                : event.descripcion
        });

        console.log(`✅ Evento resuelto: ${event.idEvento}`);

        return event;
    } catch (error) {
        console.error('Error al resolver evento:', error);
        throw error;
    }
};

/**
 * Eliminar un evento
 */
exports.deleteEvent = async (eventId) => {
    try {
        const event = await Event.findByPk(eventId);

        if (!event) {
            throw new Error('Evento no encontrado');
        }

        await event.destroy();

        return { message: 'Evento eliminado correctamente' };
    } catch (error) {
        console.error('Error al eliminar evento:', error);
        throw error;
    }
};

/**
 * Obtener eventos no resueltos
 */
exports.getUnresolvedEvents = async (deviceId = null) => {
    try {
        const where = {
            esResuelto: false
        };

        if (deviceId) {
            where.idDispositivo = deviceId;
        }

        const events = await Event.findAll({
            where,
            include: [{
                model: Device,
                as: 'dispositivo',
                attributes: ['idDispositivo', 'nombre', 'localizacion']
            }],
            order: [
                ['severidad', 'DESC'], // CRITICAL primero
                ['fechaCreado', 'DESC']
            ]
        });

        return events;
    } catch (error) {
        console.error('Error al obtener eventos no resueltos:', error);
        throw error;
    }
};

/**
 * Obtener conteo de eventos por severidad
 */
exports.getEventsSummary = async (deviceId = null, days = 7) => {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const where = {
            fechaCreado: {
                [Op.gte]: startDate
            }
        };

        if (deviceId) {
            where.idDispositivo = deviceId;
        }

        const events = await Event.findAll({
            where,
            attributes: ['severidad', 'esResuelto']
        });

        const summary = {
            total: events.length,
            bySeverity: {
                INFO: 0,
                WARNING: 0,
                ERROR: 0,
                CRITICAL: 0
            },
            resolved: 0,
            unresolved: 0
        };

        events.forEach(event => {
            summary.bySeverity[event.severidad]++;
            if (event.esResuelto) {
                summary.resolved++;
            } else {
                summary.unresolved++;
            }
        });

        return {
            period: {
                days,
                from: startDate,
                to: new Date()
            },
            deviceId: deviceId || 'todos',
            summary
        };
    } catch (error) {
        console.error('Error al obtener resumen de eventos:', error);
        throw error;
    }
};

/**
 * Obtener eventos críticos recientes
 */
exports.getCriticalEvents = async (hours = 24) => {
    try {
        const startDate = new Date();
        startDate.setHours(startDate.getHours() - hours);

        const events = await Event.findAll({
            where: {
                severidad: 'CRITICAL',
                fechaCreado: {
                    [Op.gte]: startDate
                },
                esResuelto: false
            },
            include: [{
                model: Device,
                as: 'dispositivo',
                attributes: ['idDispositivo', 'nombre', 'localizacion']
            }],
            order: [['fechaCreado', 'DESC']]
        });

        return events;
    } catch (error) {
        console.error('Error al obtener eventos críticos:', error);
        throw error;
    }
};