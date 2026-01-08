const devicesService = require('../services/devices.service');

// Obtener todos los dispositivos
exports.getAllDevices = async (req, res) => {
    try {
        const filters = {
            esActivo: req.query.activo
        };

        const devices = await devicesService.getAllDevices(filters);

        res.status(200).json({
            success: true,
            message: 'Dispositivos obtenidos correctamente',
            count: devices.length,
            data: devices
        });
    } catch (error) {
        console.error('Error en getAllDevices:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener dispositivos',
            error: error.message
        });
    }
};

// Obtener un dispositivo por ID
exports.getDeviceById = async (req, res) => {
    try {
        const { id } = req.params;
        const device = await devicesService.getDeviceById(id);

        res.status(200).json({
            success: true,
            message: 'Dispositivo encontrado',
            data: device
        });
    } catch (error) {
        console.error('Error en getDeviceById:', error);
        res.status(404).json({
            success: false,
            message: error.message,
            error: error.message
        });
    }
};

// Crear nuevo dispositivo
exports.createDevice = async (req, res) => {
    try {
        const deviceData = req.body;
        const device = await devicesService.createDevice(deviceData);

        res.status(201).json({
            success: true,
            message: 'Dispositivo creado correctamente',
            data: device
        });
    } catch (error) {
        console.error('Error en createDevice:', error);
        res.status(400).json({
            success: false,
            message: 'Error al crear dispositivo',
            error: error.message
        });
    }
};

// Actualizar dispositivo
exports.updateDevice = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const device = await devicesService.updateDevice(id, updates);

        res.status(200).json({
            success: true,
            message: 'Dispositivo actualizado correctamente',
            data: device
        });
    } catch (error) {
        console.error('Error en updateDevice:', error);
        res.status(400).json({
            success: false,
            message: error.message,
            error: error.message
        });
    }
};

// Eliminar dispositivo
exports.deleteDevice = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await devicesService.deleteDevice(id);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('Error en deleteDevice:', error);
        res.status(400).json({
            success: false,
            message: error.message,
            error: error.message
        });
    }
};

// Obtener estadísticas de un dispositivo
exports.getDeviceStats = async (req, res) => {
    try {
        const { id } = req.params;
        const { days } = req.query;

        const stats = await devicesService.getDeviceStats(id, days ? parseInt(days) : 7);

        res.status(200).json({
            success: true,
            message: 'Estadísticas obtenidas correctamente',
            data: stats
        });
    } catch (error) {
        console.error('Error en getDeviceStats:', error);
        res.status(400).json({
            success: false,
            message: error.message,
            error: error.message
        });
    }
};

// Verificar dispositivos offline
exports.checkOfflineDevices = async (req, res) => {
    try {
        const { minutes } = req.query;
        const offlineDevices = await devicesService.checkOfflineDevices(
            minutes ? parseInt(minutes) : 10
        );

        res.status(200).json({
            success: true,
            message: 'Verificación completada',
            count: offlineDevices.length,
            data: offlineDevices
        });
    } catch (error) {
        console.error('Error en checkOfflineDevices:', error);
        res.status(500).json({
            success: false,
            message: 'Error al verificar dispositivos offline',
            error: error.message
        });
    }
};

// Actualizar zona horaria de un dispositivo
exports.updateTimezone = async (req, res) => {
    try {
        const { id } = req.params;
        const { idZonaHoraria } = req.body;

        if (!idZonaHoraria) {
            return res.status(400).json({
                success: false,
                message: 'idZonaHoraria es requerido'
            });
        }

        const device = await devicesService.updateDevice(id, { idZonaHoraria });

        res.status(200).json({
            success: true,
            message: 'Zona horaria actualizada correctamente',
            data: device
        });
    } catch (error) {
        console.error('Error en updateTimezone:', error);
        res.status(400).json({
            success: false,
            message: error.message,
            error: error.message
        });
    }
};