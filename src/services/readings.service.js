const { Device, Reading, Event, ZonaHoraria } = require('../models');
const statisticsService = require('./statistics.service');
const { millisToUTC } = require('../utils/timezone');
const { calculateEfficiency, mWtoW, mAtoA, formatUptime } = require('../utils/calculations');

class ReadingsService {
    constructor() {
        this.totalReadingsReceived = 0;
    }

    /**
     * Procesar y guardar lectura del ESP32
     */
    async processReading(data) {
        try {
            // 1. Validar datos
            this.validateReading(data);

            // 2. Buscar o crear dispositivo
            const device = await this.getOrCreateDevice(data.deviceId);

            // 3. Convertir timestamp a UTC
            const timestampUTC = millisToUTC(data.timestamp);

            // 4. Calcular eficiencia
            const efficiency = calculateEfficiency(
                parseFloat(data.power),
                parseFloat(data.irradiance),
                0.01 // Área del panel en m²
            );

            // 5. Crear lectura en BD
            const reading = await Reading.create({
                idDispositivo: data.deviceId,
                tiempoLocal: data.timestamp, // Guardamos el millis() del ESP32 para referencia
                timestampUTC: timestampUTC,   // Usamos la hora real del servidor
                voltage: parseFloat(data.voltage) || 0,
                corriente: parseFloat(data.current) || 0,
                power: parseFloat(data.power) || 0,
                solarRadiation: parseFloat(data.solarRadiation) || 0,
                irradiance: parseFloat(data.irradiance) || 0,
                energiaAcumulada: parseFloat(data.energyAccumulated) || 0,
                segundosFuncionando: parseInt(data.uptimeSeconds) || 0,
                temperatura: data.temperature ? parseFloat(data.temperature) : null,
                humedad: data.humidity ? parseFloat(data.humidity) : null,
                nivelSenal: data.signalStrength ? parseInt(data.signalStrength) : null,
                nivelBateria: data.batteryLevel ? parseFloat(data.batteryLevel) : null
            });

            // 6. Actualizar información del dispositivo
            await device.update({
                ultimaLectura: new Date(),
                lecturasTotales: device.lecturasTotales + 1
            });

            // 7. Incrementar contador local
            this.totalReadingsReceived++;

            // 8. Preparar respuesta procesada
            const processedReading = {
                id: reading.idReading,
                deviceId: data.deviceId,
                receivedAt: new Date(),
                espTimestamp: data.timestamp,
                timestampUTC: timestampUTC,
                measurements: {
                    voltage: reading.voltage,
                    current: reading.corriente,
                    power: reading.power,
                    solarRadiation: reading.solarRadiation,
                    irradiance: reading.irradiance,
                    energyAccumulated: reading.energiaAcumulada,
                    temperature: reading.temperatura,
                    humidity: reading.humedad
                },
                system: {
                    uptimeSeconds: reading.segundosFuncionando,
                    uptimeFormatted: formatUptime(reading.segundosFuncionando),
                    signalStrength: reading.nivelSenal,
                    batteryLevel: reading.nivelBateria
                },
                calculated: {
                    efficiency: efficiency.toFixed(2),
                    powerWatts: mWtoW(reading.power).toFixed(3),
                    currentAmps: mAtoA(reading.corriente).toFixed(3),
                    voltageVolts: reading.voltage.toFixed(2)
                }
            };

            // 9. Log de estadísticas
            this.logStatistics(processedReading);

            // 10. Verificar si el dispositivo estaba offline y crear evento
            await this.checkDeviceOnline(device);

            // 11. Actualizar estadísticas diarias en tiempo real
            try {
                await statisticsService.updateDailyStatsRealTime(device.idDispositivo, reading, device);
                console.log('📊 Estadísticas diarias actualizadas');
            } catch (statsError) {
                console.error('⚠️ Error actualizando estadísticas (no crítico):', statsError.message);
                // No lanzar error, solo registrar - las estadísticas no deben bloquear las lecturas
            }

            return processedReading;

        } catch (error) {
            console.error('❌ Error en processReading:', error.message);
            throw error;
        }
    }

    /**
     * Buscar o crear dispositivo
     */
    async getOrCreateDevice(deviceId) {
        let device = await Device.findByPk(deviceId, {
            include: [{
                model: ZonaHoraria,
                as: 'zonaHoraria'
            }]
        });

        if (!device) {
            // Crear nuevo dispositivo con valores por defecto
            device = await Device.create({
                idDispositivo: deviceId,
                nombre: `Panel Solar ${deviceId}`,
                localizacion: 'Sin especificar',
                idZonaHoraria: 13, // UTC por defecto
                panelVoltageNominal: 5.0,
                panelCorrienteMax: 160.0,
                panelPotenciaNominal: 800.0,
                esActivo: true
            });

            // Crear evento de registro
            await Event.create({
                idDispositivo: deviceId,
                tipoEvento: 'DISPOSITIVO_REGISTRADO',
                severidad: 'INFO',
                titulo: 'Nuevo dispositivo registrado',
                descripcion: `El dispositivo ${deviceId} se ha registrado automáticamente en el sistema`,
                metadata: JSON.stringify({ deviceId, timestamp: new Date() })
            });

            console.log(`✅ Nuevo dispositivo creado: ${deviceId}`);
        }

        return device;
    }

    /**
     * Verificar si dispositivo vuelve a estar online
     */
    async checkDeviceOnline(device) {
        // Si han pasado más de 5 minutos desde la última lectura, crear evento ONLINE
        if (device.ultimaLectura) {
            const minutesSinceLastReading = (Date.now() - device.ultimaLectura.getTime()) / (1000 * 60);

            if (minutesSinceLastReading > 5) {
                await Event.create({
                    idDispositivo: device.idDispositivo,
                    tipoEvento: 'DISPOSITIVO_ONLINE',
                    severidad: 'INFO',
                    titulo: 'Dispositivo reconectado',
                    descripcion: `El dispositivo ${device.idDispositivo} ha vuelto a enviar datos después de ${Math.floor(minutesSinceLastReading)} minutos`,
                    metadata: JSON.stringify({
                        minutesOffline: minutesSinceLastReading,
                        timestamp: new Date()
                    })
                });
            }
        }
    }

    /**
     * Validar campos requeridos
     */
    validateReading(data) {
        const requiredFields = [
            'deviceId', 'timestamp', 'voltage', 'current',
            'power', 'solarRadiation', 'irradiance',
            'energyAccumulated', 'uptimeSeconds'
        ];

        const missingFields = requiredFields.filter(field =>
            data[field] === undefined || data[field] === null
        );

        if (missingFields.length > 0) {
            throw new Error(`⚠️ Campos faltantes: ${missingFields.join(', ')}`);
        }

        if (typeof data.deviceId !== 'string') {
            throw new Error('⚠️ deviceId debe ser string');
        }

        const numericFields = ['voltage', 'current', 'power', 'solarRadiation', 'irradiance', 'energyAccumulated', 'uptimeSeconds'];
        numericFields.forEach(field => {
            if (isNaN(parseFloat(data[field]))) {
                throw new Error(`⚠️ ${field} debe ser un número válido`);
            }
        });
    }

    /**
     * Obtener última lectura de un dispositivo
     */
    async getLatestReading(deviceId) {
        try {
            const reading = await Reading.findOne({
                where: deviceId ? { idDispositivo: deviceId } : {},
                order: [['fechaCreacion', 'DESC']],
                include: [{
                    model: Device,
                    as: 'dispositivo',
                    include: [{
                        model: ZonaHoraria,
                        as: 'zonaHoraria'
                    }]
                }]
            });

            return reading;
        } catch (error) {
            console.error('Error al obtener última lectura:', error);
            throw error;
        }
    }

    /**
     * Obtener historial de lecturas
     */
    async getHistory(deviceId, limit = 100) {
        try {
            const where = deviceId ? { idDispositivo: deviceId } : {};

            const readings = await Reading.findAll({
                where,
                order: [['fechaCreacion', 'DESC']],
                limit,
                include: [{
                    model: Device,
                    as: 'dispositivo'
                }]
            });

            return readings;
        } catch (error) {
            console.error('Error al obtener historial:', error);
            throw error;
        }
    }

    /**
     * Mostrar estadísticas en consola
     */
    logStatistics(reading) {
        console.log('\n┌─────────────────────────────────────────┐');
        console.log('│       📊 ESTADÍSTICAS CALCULADAS       │');
        console.log('├─────────────────────────────────────────┤');
        console.log(`│ 🔋 Voltaje:         ${reading.measurements.voltage.toFixed(2).padStart(8)} V        │`);
        console.log(`│ ⚡ Corriente:       ${reading.calculated.currentAmps.padStart(8)} A        │`);
        console.log(`│ 💡 Potencia:        ${reading.calculated.powerWatts.padStart(8)} W        │`);
        console.log(`│ ☀️  Irradiancia:    ${reading.measurements.irradiance.toFixed(2).padStart(8)} W/m²     │`);
        console.log(`│ 📈 Eficiencia:      ${reading.calculated.efficiency.padStart(8)} %       │`);
        console.log(`│ 🔄 Energía Total:   ${reading.measurements.energyAccumulated.toFixed(4).padStart(8)} Wh       │`);
        console.log(`│ ⏱️  Uptime:          ${reading.system.uptimeFormatted.padEnd(15)}│`);
        console.log(`│ 📡 Lecturas:        ${this.totalReadingsReceived.toString().padStart(8)}          │`);
        console.log('└─────────────────────────────────────────┘');
    }
}

module.exports = new ReadingsService();