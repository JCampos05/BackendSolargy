const { DailyStatistic, Device, Reading, ZonaHoraria } = require('../models');
const { Op } = require('sequelize');
const { getTodayDateString, utcToTimezone } = require('../utils/timezone');
const { calculateEfficiency, calculateCapacityFactor, hasUsefulLight } = require('../utils/calculations');

/**
 * Actualizar estadísticas diarias en tiempo real cuando llega una nueva lectura
 */
exports.updateDailyStatsRealTime = async (deviceId, reading, device) => {
    try {
        // 1. Calcular la fecha LOCAL según la zona horaria del dispositivo
        const offsetHours = device.zonaHoraria ? parseFloat(device.zonaHoraria.offsetUTC) : 0;
        const fechaUTC = new Date(reading.timestampUTC);
        const fechaLocal = new Date(fechaUTC.getTime() + (offsetHours * 60 * 60 * 1000));
        const fechaEstadistica = fechaLocal.toISOString().split('T')[0]; // YYYY-MM-DD

        console.log('[Stats] Actualizando estadísticas:', {
            deviceId,
            fechaEstadistica,
            offsetHours,
            timestampUTC: reading.timestampUTC
        });

        // 2. Buscar estadística existente para este día
        let statistic = await DailyStatistic.findOne({
            where: {
                idDispositivo: deviceId,
                fechaEstadistica: fechaEstadistica
            }
        });

        // 3. Si no existe, crear una nueva
        if (!statistic) {
            statistic = await DailyStatistic.create({
                idDispositivo: deviceId,
                fechaEstadistica: fechaEstadistica,
                energiaTotalDia: 0,
                picoPotencia: 0,
                picoPotenciaHora: null,
                promPotencia: 0,
                picoRadiacion: 0,
                promRadiacion: 0,
                minutosLuzUtil: 0,
                panelEficiencia: 0,
                factorCapacidad: 0,
                lecturasTotales: 0
            });
            console.log('[Stats] Estadística creada para:', fechaEstadistica);
        }

        // 4. CORREGIDO: Obtener todas las lecturas del día en hora LOCAL
        // Convertir la fecha local del dispositivo a UTC para buscar
        const startDateLocal = new Date(fechaEstadistica + 'T00:00:00');
        const endDateLocal = new Date(fechaEstadistica + 'T23:59:59.999');
        
        // Convertir a UTC restando el offset
        const startDateUTC = new Date(startDateLocal.getTime() - (offsetHours * 60 * 60 * 1000));
        const endDateUTC = new Date(endDateLocal.getTime() - (offsetHours * 60 * 60 * 1000));

        console.log('[Stats] Buscando lecturas:', {
            fechaEstadistica,
            startDateUTC: startDateUTC.toISOString(),
            endDateUTC: endDateUTC.toISOString()
        });

        const readings = await Reading.findAll({
            where: {
                idDispositivo: deviceId,
                timestampUTC: {
                    [Op.between]: [startDateUTC, endDateUTC]
                }
            },
            order: [['timestampUTC', 'ASC']]
        });

        console.log('[Stats] Lecturas encontradas:', readings.length);

        if (readings.length === 0) {
            return statistic;
        }

        // 5. Recalcular todas las estadísticas
        const powers = readings.map(r => parseFloat(r.power));
        const radiations = readings.map(r => parseFloat(r.solarRadiation));
        const irradiances = readings.map(r => parseFloat(r.irradiance));

        // Encontrar pico de potencia y su hora LOCAL
        const maxPowerReading = readings.reduce((prev, current) =>
            parseFloat(current.power) > parseFloat(prev.power) ? current : prev
        );
        
        // Convertir timestamp UTC a hora local
        const maxPowerTimeUTC = new Date(maxPowerReading.timestampUTC);
        const maxPowerTimeLocal = new Date(maxPowerTimeUTC.getTime() + (offsetHours * 60 * 60 * 1000));
        const picoPotenciaHora = maxPowerTimeLocal.toTimeString().split(' ')[0];

        console.log('[Stats] Pico de potencia:', {
            power: Math.max(...powers),
            hora: picoPotenciaHora,
            timestampUTC: maxPowerReading.timestampUTC
        });

        // Minutos con luz útil
        const minutosLuzUtil = readings.filter(r => hasUsefulLight(parseFloat(r.irradiance))).length;

        // Energía total (última lectura - primera lectura del día)
        const energiaTotalDia = parseFloat(readings[readings.length - 1].energiaAcumulada) -
            parseFloat(readings[0].energiaAcumulada);

        // Eficiencia promedio
        const efficiencies = readings
            .filter(r => parseFloat(r.irradiance) > 0)
            .map(r => calculateEfficiency(
                parseFloat(r.power),
                parseFloat(r.irradiance),
                0.01
            ));

        const panelEficiencia = efficiencies.length > 0
            ? efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length
            : 0;

        // Factor de capacidad
        const horasTranscurridas = readings.length / 60; // Asumiendo lecturas cada minuto
        const factorCapacidad = calculateCapacityFactor(
            energiaTotalDia,
            device.panelPotenciaNominal || 800,
            horasTranscurridas
        );

        // 6. Actualizar estadística
        await statistic.update({
            energiaTotalDia: energiaTotalDia,
            picoPotencia: Math.max(...powers),
            picoPotenciaHora: picoPotenciaHora,
            promPotencia: powers.reduce((a, b) => a + b, 0) / powers.length,
            picoRadiacion: Math.max(...radiations),
            promRadiacion: radiations.reduce((a, b) => a + b, 0) / radiations.length,
            minutosLuzUtil: minutosLuzUtil,
            panelEficiencia: panelEficiencia,
            factorCapacidad: factorCapacidad,
            lecturasTotales: readings.length
        });

        console.log('[Stats] Estadística actualizada:', {
            fechaEstadistica,
            picoPotencia: Math.max(...powers),
            lecturas: readings.length
        });

        return statistic;

    } catch (error) {
        console.error('Error al actualizar estadísticas en tiempo real:', error);
        throw error;
    }
};

/**
 * Generar estadísticas diarias para un dispositivo y fecha específica
 */
exports.generateDailyStats = async (deviceId, date) => {
    try {
        const device = await Device.findByPk(deviceId, {
            include: [{
                model: ZonaHoraria,
                as: 'zonaHoraria'
            }]
        });

        if (!device) {
            throw new Error('Dispositivo no encontrado');
        }

        const offsetHours = device.zonaHoraria ? parseFloat(device.zonaHoraria.offsetUTC) : 0;

        // CORREGIDO: Convertir la fecha local a rango UTC
        const startDateLocal = new Date(date + 'T00:00:00');
        const endDateLocal = new Date(date + 'T23:59:59.999');
        
        const startDateUTC = new Date(startDateLocal.getTime() - (offsetHours * 60 * 60 * 1000));
        const endDateUTC = new Date(endDateLocal.getTime() - (offsetHours * 60 * 60 * 1000));

        console.log('[Generate Stats] Generando para:', {
            deviceId,
            date,
            startDateUTC: startDateUTC.toISOString(),
            endDateUTC: endDateUTC.toISOString()
        });

        // Obtener todas las lecturas del día
        const readings = await Reading.findAll({
            where: {
                idDispositivo: deviceId,
                timestampUTC: {
                    [Op.between]: [startDateUTC, endDateUTC]
                }
            },
            order: [['timestampUTC', 'ASC']]
        });

        console.log('[Generate Stats] Lecturas encontradas:', readings.length);

        if (readings.length === 0) {
            return {
                message: 'No hay lecturas para este día',
                date,
                deviceId
            };
        }

        // Calcular estadísticas
        const powers = readings.map(r => parseFloat(r.power));
        const radiations = readings.map(r => parseFloat(r.solarRadiation));
        const irradiances = readings.map(r => parseFloat(r.irradiance));

        // Encontrar pico de potencia y su hora LOCAL
        const maxPowerReading = readings.reduce((prev, current) =>
            parseFloat(current.power) > parseFloat(prev.power) ? current : prev
        );

        const maxPowerTimeUTC = new Date(maxPowerReading.timestampUTC);
        const maxPowerTimeLocal = new Date(maxPowerTimeUTC.getTime() + (offsetHours * 60 * 60 * 1000));
        const picoPotenciaHora = maxPowerTimeLocal.toTimeString().split(' ')[0];

        console.log('[Generate Stats] Pico encontrado:', {
            power: Math.max(...powers),
            hora: picoPotenciaHora
        });

        // Calcular minutos con luz útil (irradiancia > 50 W/m²)
        const minutosLuzUtil = readings.filter(r => hasUsefulLight(parseFloat(r.irradiance))).length;

        // Energía total del día (última lectura menos primera)
        const energiaTotalDia = parseFloat(readings[readings.length - 1].energiaAcumulada) -
            parseFloat(readings[0].energiaAcumulada);

        // Calcular eficiencia promedio
        const efficiencies = readings
            .filter(r => parseFloat(r.irradiance) > 0)
            .map(r => calculateEfficiency(
                parseFloat(r.power),
                parseFloat(r.irradiance),
                0.01
            ));

        const panelEficiencia = efficiencies.length > 0
            ? efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length
            : 0;

        // Calcular factor de capacidad (24 horas)
        const factorCapacidad = calculateCapacityFactor(
            energiaTotalDia,
            device.panelPotenciaNominal || 800,
            24
        );

        // Crear o actualizar estadística diaria
        const [statistic, created] = await DailyStatistic.upsert({
            idDispositivo: deviceId,
            fechaEstadistica: date,
            energiaTotalDia: energiaTotalDia,
            picoPotencia: Math.max(...powers),
            picoPotenciaHora: picoPotenciaHora,
            promPotencia: powers.reduce((a, b) => a + b, 0) / powers.length,
            picoRadiacion: Math.max(...radiations),
            promRadiacion: radiations.reduce((a, b) => a + b, 0) / radiations.length,
            minutosLuzUtil: minutosLuzUtil,
            panelEficiencia: panelEficiencia,
            factorCapacidad: factorCapacidad,
            lecturasTotales: readings.length
        }, {
            returning: true
        });

        console.log('[Generate Stats] Estadística guardada:', {
            created,
            picoPotencia: Math.max(...powers)
        });

        return {
            created,
            statistic,
            message: created ? 'Estadística creada' : 'Estadística actualizada'
        };

    } catch (error) {
        console.error('Error al generar estadísticas diarias:', error);
        throw error;
    }
};

/**
 * Obtener estadísticas diarias de un dispositivo
 */
exports.getDailyStats = async (deviceId, startDate, endDate) => {
    try {
        const where = {
            idDispositivo: deviceId
        };

        if (startDate && endDate) {
            where.fechaEstadistica = {
                [Op.between]: [startDate, endDate]
            };
        } else if (startDate) {
            where.fechaEstadistica = {
                [Op.gte]: startDate
            };
        }

        const statistics = await DailyStatistic.findAll({
            where,
            include: [{
                model: Device,
                as: 'dispositivo',
                attributes: ['idDispositivo', 'nombre', 'localizacion']
            }],
            order: [['fechaEstadistica', 'DESC']]
        });

        console.log('[Get Stats] Estadísticas encontradas:', statistics.length, {
            startDate,
            endDate,
            deviceId
        });

        return statistics;
    } catch (error) {
        console.error('Error al obtener estadísticas diarias:', error);
        throw error;
    }
};

/**
 * Obtener estadísticas de todos los dispositivos para una fecha
 */
exports.getAllDevicesStats = async (date) => {
    try {
        const statistics = await DailyStatistic.findAll({
            where: {
                fechaEstadistica: date
            },
            include: [{
                model: Device,
                as: 'dispositivo',
                attributes: ['idDispositivo', 'nombre', 'localizacion']
            }],
            order: [['energiaTotalDia', 'DESC']]
        });

        return statistics;
    } catch (error) {
        console.error('Error al obtener estadísticas de todos los dispositivos:', error);
        throw error;
    }
};

/**
 * Generar estadísticas para todos los dispositivos activos (usar en cron)
 */
exports.generateAllDailyStats = async (date) => {
    try {
        const devices = await Device.findAll({
            where: {
                esActivo: true
            }
        });

        const results = [];

        for (const device of devices) {
            try {
                const result = await exports.generateDailyStats(device.idDispositivo, date);
                results.push({
                    deviceId: device.idDispositivo,
                    success: true,
                    ...result
                });
            } catch (error) {
                results.push({
                    deviceId: device.idDispositivo,
                    success: false,
                    error: error.message
                });
            }
        }

        return {
            date,
            totalDevices: devices.length,
            results
        };
    } catch (error) {
        console.error('Error al generar todas las estadísticas diarias:', error);
        throw error;
    }
};

/**
 * Obtener resumen de estadísticas de un dispositivo (última semana, mes, etc)
 */
exports.getStatsSummary = async (deviceId, period = 'week') => {
    try {
        const device = await Device.findByPk(deviceId);

        if (!device) {
            throw new Error('Dispositivo no encontrado');
        }

        // Calcular fecha de inicio según el período
        const endDate = new Date();
        const startDate = new Date();

        switch (period) {
            case 'week':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case 'year':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
            default:
                startDate.setDate(startDate.getDate() - 7);
        }

        const statistics = await DailyStatistic.findAll({
            where: {
                idDispositivo: deviceId,
                fechaEstadistica: {
                    [Op.between]: [
                        startDate.toISOString().split('T')[0],
                        endDate.toISOString().split('T')[0]
                    ]
                }
            },
            order: [['fechaEstadistica', 'ASC']]
        });

        if (statistics.length === 0) {
            return {
                device,
                period,
                message: 'No hay estadísticas para este período'
            };
        }

        // Calcular totales y promedios
        const totalEnergy = statistics.reduce((sum, s) => sum + parseFloat(s.energiaTotalDia), 0);
        const avgPower = statistics.reduce((sum, s) => sum + parseFloat(s.promPotencia), 0) / statistics.length;
        const avgEfficiency = statistics.reduce((sum, s) => sum + parseFloat(s.panelEficiencia || 0), 0) / statistics.length;
        const maxPower = Math.max(...statistics.map(s => parseFloat(s.picoPotencia)));

        return {
            device,
            period,
            summary: {
                totalEnergy: totalEnergy.toFixed(4),
                avgPower: avgPower.toFixed(3),
                avgEfficiency: avgEfficiency.toFixed(2),
                maxPower: maxPower.toFixed(3),
                daysWithData: statistics.length
            },
            dailyStats: statistics
        };
    } catch (error) {
        console.error('Error al obtener resumen de estadísticas:', error);
        throw error;
    }
};