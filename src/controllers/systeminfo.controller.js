const { SystemInfo, Device, Reading, Event, ZonaHoraria } = require('../models');
const { Op } = require('sequelize');

/**
 * Detecta la zona horaria más apropiada según las coordenadas
 * Basado en rangos de longitud aproximados
 */
const detectTimezoneByCoordinates = (longitude) => {
    // Conversión simple: cada 15 grados de longitud = 1 hora
    const offsetHours = Math.round(longitude / 15);
    
    // Mapeo de offset a IDs de zonas horarias
    const timezoneMap = {
        '-12': 1, '-11': 2, '-10': 3, '-9': 4, '-8': 5, '-7': 6,
        '-6': 7, '-5': 8, '-4': 9, '-3': 10, '-2': 11, '-1': 12,
        '0': 13, '1': 14, '2': 15, '3': 16, '4': 17, '5': 18,
        '6': 19, '7': 20, '8': 21, '9': 22, '10': 23, '11': 23, '12': 24
    };
    
    return timezoneMap[offsetHours.toString()] || 6; // Default: CST (UTC-7)
};

/**
 * Obtener información del sistema
 */
exports.getSystemInfo = async (req, res) => {
    try {
        let systemInfo = await SystemInfo.findOne({
            order: [['idInfo', 'DESC']],
            include: [{
                model: ZonaHoraria,
                as: 'zonaHoraria',
                required: false
            }]
        });

        if (!systemInfo) {
            // Si no existe, crear registro inicial
            systemInfo = await SystemInfo.create({
                nombreSistema: 'Solargy',
                versionSistema: '1.0.0',
                versionBackend: '1.0.0',
                versionFrontend: '1.0.0',
                idZonaHoraria: 7,
                fechaInicioOperacion: new Date()
            });
            
            // Cargar relación de zona horaria
            systemInfo = await SystemInfo.findByPk(systemInfo.idInfo, {
                include: [{
                    model: ZonaHoraria,
                    as: 'zonaHoraria',
                    required: false
                }]
            });
        }

        // SINCRONIZAR ESTADÍSTICAS AUTOMÁTICAMENTE
        const totalDispositivos = await Device.count();
        const dispositivosActivos = await Device.count({
            where: { esActivo: true }
        });
        const totalLecturas = await Reading.count();
        const eventosNoResueltos = await Event.count({
            where: { esResuelto: false }
        });
        const ultimoEventoCritico = await Event.findOne({
            where: { severidad: 'CRITICAL' },
            order: [['fechaCreado', 'DESC']],
            attributes: ['fechaCreado']
        });

        // Actualizar estadísticas en el registro
        await systemInfo.update({
            totalDispositivos,
            dispositivosActivos,
            totalLecturas,
            eventosNoResueltos,
            ultimoEventoCritico: ultimoEventoCritico?.fechaCreado || null
        });

        // Recargar para obtener datos actualizados
        systemInfo = await SystemInfo.findByPk(systemInfo.idInfo, {
            include: [{
                model: ZonaHoraria,
                as: 'zonaHoraria',
                required: false
            }]
        });

        // Convertir a JSON
        const result = systemInfo.toJSON();
        
        // Enviar fechaInicioOperacion como string YYYY-MM-DD sin conversión
        if (result.fechaInicioOperacion) {
            // Mantener solo la fecha, sin conversión de zona horaria
            if (typeof result.fechaInicioOperacion === 'string') {
                // Ya es string, mantenerlo así
                result.fechaInicioOperacion = result.fechaInicioOperacion;
            } else {
                // Es un objeto Date, extraer solo la parte de fecha
                result.fechaInicioOperacion = result.fechaInicioOperacion.toISOString().split('T')[0];
            }
        }

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error al obtener información del sistema:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener información del sistema',
            error: error.message
        });
    }
};
/**
 * Actualizar información del sistema
 */
exports.updateSystemInfo = async (req, res) => {
    try {
        const updates = req.body;
        
        let systemInfo = await SystemInfo.findOne({
            order: [['idInfo', 'DESC']]
        });

        if (!systemInfo) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró información del sistema'
            });
        }

        await systemInfo.update(updates);
        
        // Recargar con relaciones
        systemInfo = await SystemInfo.findByPk(systemInfo.idInfo, {
            include: [{
                model: ZonaHoraria,
                as: 'zonaHoraria',
                required: false
            }]
        });

        res.json({
            success: true,
            message: 'Información actualizada correctamente',
            data: systemInfo
        });
    } catch (error) {
        console.error('Error al actualizar información del sistema:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar información del sistema',
            error: error.message
        });
    }
};

/**
 * Sincronizar estadísticas del sistema
 */
exports.syncSystemStats = async (req, res) => {
    try {
        // Contar dispositivos
        const totalDispositivos = await Device.count();
        const dispositivosActivos = await Device.count({
            where: { esActivo: true }
        });

        // Contar lecturas
        const totalLecturas = await Reading.count();

        // Contar eventos no resueltos
        const eventosNoResueltos = await Event.count({
            where: { esResuelto: false }
        });

        // Obtener último evento crítico
        const ultimoEventoCritico = await Event.findOne({
            where: { severidad: 'CRITICAL' },
            order: [['fechaCreado', 'DESC']],
            attributes: ['fechaCreado']
        });

        // Actualizar system_info
        let systemInfo = await SystemInfo.findOne({
            order: [['idInfo', 'DESC']]
        });

        if (!systemInfo) {
            systemInfo = await SystemInfo.create({
                nombreSistema: 'Solargy',
                versionSistema: '1.0.0',
                idZonaHoraria: 7,
                totalDispositivos,
                dispositivosActivos,
                totalLecturas,
                eventosNoResueltos,
                ultimoEventoCritico: ultimoEventoCritico?.fechaCreado || null,
                fechaInicioOperacion: new Date()
            });
        } else {
            await systemInfo.update({
                totalDispositivos,
                dispositivosActivos,
                totalLecturas,
                eventosNoResueltos,
                ultimoEventoCritico: ultimoEventoCritico?.fechaCreado || null
            });
        }
        
        // Recargar con relaciones
        systemInfo = await SystemInfo.findByPk(systemInfo.idInfo, {
            include: [{
                model: ZonaHoraria,
                as: 'zonaHoraria',
                required: false
            }]
        });

        res.json({
            success: true,
            message: 'Estadísticas sincronizadas correctamente',
            data: systemInfo
        });
    } catch (error) {
        console.error('Error al sincronizar estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al sincronizar estadísticas',
            error: error.message
        });
    }
};

/**
 * Actualizar estado general del sistema
 */
exports.updateSystemStatus = async (req, res) => {
    try {
        const { estadoGeneral } = req.body;

        if (!['OPERATIVO', 'DEGRADADO', 'MANTENIMIENTO', 'ERROR'].includes(estadoGeneral)) {
            return res.status(400).json({
                success: false,
                message: 'Estado inválido'
            });
        }

        let systemInfo = await SystemInfo.findOne({
            order: [['idInfo', 'DESC']]
        });

        if (!systemInfo) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró información del sistema'
            });
        }

        await systemInfo.update({ estadoGeneral });
        
        // Recargar con relaciones
        systemInfo = await SystemInfo.findByPk(systemInfo.idInfo, {
            include: [{
                model: ZonaHoraria,
                as: 'zonaHoraria',
                required: false
            }]
        });

        res.json({
            success: true,
            message: 'Estado actualizado correctamente',
            data: systemInfo
        });
    } catch (error) {
        console.error('Error al actualizar estado del sistema:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar estado del sistema',
            error: error.message
        });
    }
};

/**
 * Actualizar localización del sistema
 */
exports.updateLocation = async (req, res) => {
    try {
        const { 
            localizacion, 
            latitud, 
            longitud, 
            ciudad, 
            estado, 
            pais, 
            codigoPostal,
            altitud,
            idZonaHoraria
        } = req.body;

        let systemInfo = await SystemInfo.findOne({
            order: [['idInfo', 'DESC']]
        });

        if (!systemInfo) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró información del sistema'
            });
        }

        const locationData = {};
        if (localizacion !== undefined) locationData.localizacion = localizacion;
        if (latitud !== undefined) locationData.latitud = latitud;
        if (longitud !== undefined) locationData.longitud = longitud;
        if (ciudad !== undefined) locationData.ciudad = ciudad;
        if (estado !== undefined) locationData.estado = estado;
        if (pais !== undefined) locationData.pais = pais;
        if (codigoPostal !== undefined) locationData.codigoPostal = codigoPostal;
        if (altitud !== undefined) locationData.altitud = altitud;

        // Detectar zona horaria automáticamente si se proporcionan coordenadas
        // pero no se especifica zona horaria
        if (longitud !== undefined && idZonaHoraria === undefined) {
            locationData.idZonaHoraria = detectTimezoneByCoordinates(longitud);
            console.log(`Zona horaria detectada automáticamente: ${locationData.idZonaHoraria} para longitud ${longitud}`);
        } else if (idZonaHoraria !== undefined) {
            locationData.idZonaHoraria = idZonaHoraria;
        }

        await systemInfo.update(locationData);
        
        // Recargar con relaciones
        systemInfo = await SystemInfo.findByPk(systemInfo.idInfo, {
            include: [{
                model: ZonaHoraria,
                as: 'zonaHoraria',
                required: false
            }]
        });

        res.json({
            success: true,
            message: 'Localización actualizada correctamente',
            data: systemInfo
        });
    } catch (error) {
        console.error('Error al actualizar localización:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar localización',
            error: error.message
        });
    }
};