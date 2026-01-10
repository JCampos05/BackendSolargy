const { Device, Reading, ZonaHoraria, Event, DailyStatistic } = require('../models');
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
    
    return timezoneMap[offsetHours.toString()] || 7; // Default: CST (UTC-6)
};

/**
 * Obtener todos los dispositivos
 */
exports.getAllDevices = async (filters = {}) => {
    try {
        const where = {};

        // Filtro por estado activo
        if (filters.esActivo !== undefined) {
            where.esActivo = filters.esActivo === 'true' || filters.esActivo === true;
        }

        const devices = await Device.findAll({
            where,
            include: [{
                model: ZonaHoraria,
                as: 'zonaHoraria',
                attributes: ['idZonaHoraria', 'nombreZona', 'offsetUTC', 'nombreMostrar']
            }],
            order: [['fechaCreado', 'DESC']]
        });

        return devices;
    } catch (error) {
        console.error('Error al obtener dispositivos:', error);
        throw error;
    }
};

/**
 * Obtener un dispositivo por ID
 */
exports.getDeviceById = async (deviceId) => {
    try {
        const device = await Device.findByPk(deviceId, {
            include: [
                {
                    model: ZonaHoraria,
                    as: 'zonaHoraria',
                    attributes: ['idZonaHoraria', 'nombreZona', 'offsetUTC', 'nombreMostrar']
                },
                {
                    model: Reading,
                    as: 'lecturas',
                    limit: 10,
                    order: [['fechaCreacion', 'DESC']],
                    attributes: ['idReading', 'timestampUTC', 'voltage', 'corriente', 'power', 'irradiance']
                }
            ]
        });

        if (!device) {
            throw new Error('Dispositivo no encontrado');
        }

        return device;
    } catch (error) {
        console.error('Error al obtener dispositivo:', error);
        throw error;
    }
};

/**
 * Crear un nuevo dispositivo
 */
exports.createDevice = async (deviceData) => {
    try {
        const device = await Device.create(deviceData);

        // Crear evento de registro
        await Event.create({
            idDispositivo: device.idDispositivo,
            tipoEvento: 'DISPOSITIVO_REGISTRADO',
            severidad: 'INFO',
            titulo: 'Dispositivo registrado manualmente',
            descripcion: `El dispositivo ${device.nombre} fue registrado en el sistema`,
            metadata: JSON.stringify({
                deviceId: device.idDispositivo,
                createdBy: 'manual',
                timestamp: new Date()
            })
        });

        return device;
    } catch (error) {
        console.error('Error al crear dispositivo:', error);
        throw error;
    }
};

/**
 * Actualizar un dispositivo
 */
exports.updateDevice = async (deviceId, updates) => {
    try {
        const device = await Device.findByPk(deviceId);

        if (!device) {
            throw new Error('Dispositivo no encontrado');
        }

        // Lista de campos permitidos para actualizar
        const allowedFields = [
            'nombre',
            'localizacion',
            'latitud',
            'longitud',
            'idZonaHoraria',
            'panelVoltageNominal',
            'panelCorrienteMax',
            'panelPotenciaNominal',
            'esActivo'
        ];

        // Filtrar solo los campos permitidos
        const filteredUpdates = {};
        for (const field of allowedFields) {
            if (updates.hasOwnProperty(field)) {
                // Convertir valores numéricos correctamente
                if (field === 'latitud' || field === 'longitud') {
                    filteredUpdates[field] = updates[field] !== null && updates[field] !== '' 
                        ? parseFloat(updates[field]) 
                        : null;
                } else if (field === 'panelVoltageNominal' || field === 'panelCorrienteMax' || field === 'panelPotenciaNominal') {
                    filteredUpdates[field] = updates[field] !== null && updates[field] !== '' 
                        ? parseFloat(updates[field]) 
                        : null;
                } else if (field === 'idZonaHoraria') {
                    filteredUpdates[field] = parseInt(updates[field]);
                } else {
                    filteredUpdates[field] = updates[field];
                }
            }
        }

        // Detectar zona horaria automáticamente si se actualizan coordenadas
        // pero NO se especifica zona horaria explícitamente
        if (updates.hasOwnProperty('longitud') && updates.longitud !== null && !updates.hasOwnProperty('idZonaHoraria')) {
            const detectedTimezone = detectTimezoneByCoordinates(parseFloat(updates.longitud));
            filteredUpdates.idZonaHoraria = detectedTimezone;
            console.log(`Zona horaria detectada automáticamente: ${detectedTimezone} para longitud ${updates.longitud}`);
        }

        console.log('Actualizando dispositivo:', deviceId);
        console.log('Datos a actualizar:', JSON.stringify(filteredUpdates, null, 2));

        // Actualizar el dispositivo
        await device.update(filteredUpdates);

        // Recargar el dispositivo con sus relaciones
        await device.reload({
            include: [{
                model: ZonaHoraria,
                as: 'zonaHoraria',
                attributes: ['idZonaHoraria', 'nombreZona', 'offsetUTC', 'nombreMostrar']
            }]
        });

        console.log('Dispositivo actualizado exitosamente');
        return device;
    } catch (error) {
        console.error('Error al actualizar dispositivo:', error);
        throw error;
    }
};

/**
 * Eliminar un dispositivo
 */
exports.deleteDevice = async (deviceId) => {
    try {
        const device = await Device.findByPk(deviceId);

        if (!device) {
            throw new Error('Dispositivo no encontrado');
        }

        await device.destroy();

        return { message: 'Dispositivo eliminado correctamente' };
    } catch (error) {
        console.error('Error al eliminar dispositivo:', error);
        throw error;
    }
};

/**
 * Obtener estadísticas resumidas de un dispositivo
 */
exports.getDeviceStats = async (deviceId, days = 7) => {
    try {
        const device = await Device.findByPk(deviceId);

        if (!device) {
            throw new Error('Dispositivo no encontrado');
        }

        // Fecha de inicio (hace N días)
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Obtener lecturas del período
        const readings = await Reading.findAll({
            where: {
                idDispositivo: deviceId,
                timestampUTC: {
                    [Op.gte]: startDate
                }
            },
            order: [['timestampUTC', 'ASC']]
        });

        if (readings.length === 0) {
            return {
                device,
                stats: null,
                message: 'No hay datos suficientes para generar estadísticas'
            };
        }

        // Calcular estadísticas
        const powers = readings.map(r => parseFloat(r.power));
        const voltages = readings.map(r => parseFloat(r.voltage));
        const irradiances = readings.map(r => parseFloat(r.irradiance));

        const stats = {
            period: {
                days,
                from: startDate,
                to: new Date(),
                totalReadings: readings.length
            },
            power: {
                max: Math.max(...powers).toFixed(3),
                min: Math.min(...powers).toFixed(3),
                avg: (powers.reduce((a, b) => a + b, 0) / powers.length).toFixed(3),
                current: readings[readings.length - 1].power
            },
            voltage: {
                max: Math.max(...voltages).toFixed(3),
                min: Math.min(...voltages).toFixed(3),
                avg: (voltages.reduce((a, b) => a + b, 0) / voltages.length).toFixed(3),
                current: readings[readings.length - 1].voltage
            },
            irradiance: {
                max: Math.max(...irradiances).toFixed(2),
                min: Math.min(...irradiances).toFixed(2),
                avg: (irradiances.reduce((a, b) => a + b, 0) / irradiances.length).toFixed(2),
                current: readings[readings.length - 1].irradiance
            },
            energy: {
                accumulated: readings[readings.length - 1].energiaAcumulada,
                unit: 'Wh'
            }
        };

        return {
            device,
            stats
        };
    } catch (error) {
        console.error('Error al obtener estadísticas del dispositivo:', error);
        throw error;
    }
};

/**
 * Verificar dispositivos offline
 */
exports.checkOfflineDevices = async (minutesThreshold = 10) => {
    try {
        const thresholdDate = new Date();
        thresholdDate.setMinutes(thresholdDate.getMinutes() - minutesThreshold);

        const offlineDevices = await Device.findAll({
            where: {
                esActivo: true,
                ultimaLectura: {
                    [Op.lt]: thresholdDate
                }
            }
        });

        // Crear eventos para dispositivos offline
        for (const device of offlineDevices) {
            const minutesOffline = Math.floor((Date.now() - device.ultimaLectura.getTime()) / (1000 * 60));

            // Verificar si ya existe un evento OFFLINE reciente (última hora)
            const recentOfflineEvent = await Event.findOne({
                where: {
                    idDispositivo: device.idDispositivo,
                    tipoEvento: 'DISPOSITIVO_OFFLINE',
                    fechaCreado: {
                        [Op.gte]: new Date(Date.now() - 60 * 60 * 1000) // Última hora
                    }
                }
            });

            if (!recentOfflineEvent) {
                await Event.create({
                    idDispositivo: device.idDispositivo,
                    tipoEvento: 'DISPOSITIVO_OFFLINE',
                    severidad: 'WARNING',
                    titulo: 'Dispositivo sin comunicación',
                    descripcion: `El dispositivo ${device.nombre} no ha enviado datos en ${minutesOffline} minutos`,
                    metadata: JSON.stringify({
                        minutesOffline,
                        lastReading: device.ultimaLectura,
                        timestamp: new Date()
                    })
                });
            }
        }

        return offlineDevices;
    } catch (error) {
        console.error('Error al verificar dispositivos offline:', error);
        throw error;
    }
};