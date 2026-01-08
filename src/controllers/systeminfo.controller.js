const { SystemInfo, Device, Reading, Event } = require('../models');
const { Op } = require('sequelize');

const systemInfoController = {
    // Obtener información del sistema
    getSystemInfo: async (req, res) => {
        try {
            let systemInfo = await SystemInfo.findOne({
                order: [['idInfo', 'DESC']]
            });

            if (!systemInfo) {
                // Si no existe, crear registro inicial
                systemInfo = await SystemInfo.create({
                    nombreSistema: 'Solargy',
                    versionSistema: '1.0.0',
                    versionBackend: '1.0.0',
                    versionFrontend: '1.0.0',
                    fechaInicioOperacion: new Date()
                });
            }

            res.json({
                success: true,
                data: systemInfo
            });
        } catch (error) {
            console.error('Error al obtener información del sistema:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener información del sistema',
                error: error.message
            });
        }
    },

    // Actualizar información del sistema
    updateSystemInfo: async (req, res) => {
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
    },

    // Sincronizar estadísticas del sistema
    syncSystemStats: async (req, res) => {
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
    },

    // Actualizar estado general del sistema
    updateSystemStatus: async (req, res) => {
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
    }
};

module.exports = systemInfoController;