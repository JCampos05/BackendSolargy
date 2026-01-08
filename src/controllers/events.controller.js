const eventsService = require('../services/events.service');

// Obtener todos los eventos
exports.getAllEvents = async (req, res) => {
    try {
        const filters = {
            deviceId: req.query.deviceId,
            tipoEvento: req.query.tipo,
            severidad: req.query.severidad,
            esResuelto: req.query.resuelto,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            limit: req.query.limit
        };

        const events = await eventsService.getAllEvents(filters);

        res.status(200).json({
            success: true,
            message: 'Eventos obtenidos correctamente',
            count: events.length,
            filters,
            data: events
        });
    } catch (error) {
        console.error('Error en getAllEvents:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener eventos',
            error: error.message
        });
    }
};

// Obtener un evento por ID
exports.getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await eventsService.getEventById(id);

        res.status(200).json({
            success: true,
            message: 'Evento encontrado',
            data: event
        });
    } catch (error) {
        console.error('Error en getEventById:', error);
        res.status(404).json({
            success: false,
            message: error.message,
            error: error.message
        });
    }
};

// Crear un nuevo evento
exports.createEvent = async (req, res) => {
    try {
        const eventData = req.body;
        const event = await eventsService.createEvent(eventData);

        res.status(201).json({
            success: true,
            message: 'Evento creado correctamente',
            data: event
        });
    } catch (error) {
        console.error('Error en createEvent:', error);
        res.status(400).json({
            success: false,
            message: 'Error al crear evento',
            error: error.message
        });
    }
};

// Marcar evento como resuelto
exports.resolveEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { resolutionNote } = req.body;

        const event = await eventsService.resolveEvent(id, resolutionNote);

        res.status(200).json({
            success: true,
            message: 'Evento marcado como resuelto',
            data: event
        });
    } catch (error) {
        console.error('Error en resolveEvent:', error);
        res.status(400).json({
            success: false,
            message: error.message,
            error: error.message
        });
    }
};

// Eliminar un evento
exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await eventsService.deleteEvent(id);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('Error en deleteEvent:', error);
        res.status(400).json({
            success: false,
            message: error.message,
            error: error.message
        });
    }
};

// Obtener eventos no resueltos
exports.getUnresolvedEvents = async (req, res) => {
    try {
        const { deviceId } = req.query;
        const events = await eventsService.getUnresolvedEvents(deviceId);

        res.status(200).json({
            success: true,
            message: 'Eventos no resueltos',
            count: events.length,
            data: events
        });
    } catch (error) {
        console.error('Error en getUnresolvedEvents:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener eventos no resueltos',
            error: error.message
        });
    }
};

// Obtener resumen de eventos
exports.getEventsSummary = async (req, res) => {
    try {
        const { deviceId, days } = req.query;
        const summary = await eventsService.getEventsSummary(
            deviceId,
            days ? parseInt(days) : 7
        );

        res.status(200).json({
            success: true,
            message: 'Resumen de eventos obtenido',
            data: summary
        });
    } catch (error) {
        console.error('Error en getEventsSummary:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener resumen de eventos',
            error: error.message
        });
    }
};

// Obtener eventos críticos recientes
exports.getCriticalEvents = async (req, res) => {
    try {
        const { hours } = req.query;
        const events = await eventsService.getCriticalEvents(
            hours ? parseInt(hours) : 24
        );

        res.status(200).json({
            success: true,
            message: 'Eventos críticos obtenidos',
            count: events.length,
            data: events
        });
    } catch (error) {
        console.error('Error en getCriticalEvents:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener eventos críticos',
            error: error.message
        });
    }
};