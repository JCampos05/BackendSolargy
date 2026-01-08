const statisticsService = require('../services/statistics.service');

// Generar estadísticas diarias para un dispositivo
exports.generateDailyStats = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { date } = req.body;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Fecha requerida (formato: YYYY-MM-DD)'
            });
        }

        const result = await statisticsService.generateDailyStats(deviceId, date);

        res.status(200).json({
            success: true,
            message: result.message,
            data: result
        });
    } catch (error) {
        console.error('Error en generateDailyStats:', error);
        res.status(500).json({
            success: false,
            message: error.message,
            error: error.message
        });
    }
};

// Obtener estadísticas diarias de un dispositivo
exports.getDailyStats = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { startDate, endDate } = req.query;

        const statistics = await statisticsService.getDailyStats(deviceId, startDate, endDate);

        res.status(200).json({
            success: true,
            message: 'Estadísticas obtenidas correctamente',
            count: statistics.length,
            filters: {
                deviceId,
                startDate: startDate || 'sin filtro',
                endDate: endDate || 'sin filtro'
            },
            data: statistics
        });
    } catch (error) {
        console.error('Error en getDailyStats:', error);
        res.status(500).json({
            success: false,
            message: error.message,
            error: error.message
        });
    }
};

// Obtener estadísticas de todos los dispositivos para una fecha
exports.getAllDevicesStats = async (req, res) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Fecha requerida (query param: ?date=YYYY-MM-DD)'
            });
        }

        const statistics = await statisticsService.getAllDevicesStats(date);

        res.status(200).json({
            success: true,
            message: 'Estadísticas de todos los dispositivos',
            date,
            count: statistics.length,
            data: statistics
        });
    } catch (error) {
        console.error('Error en getAllDevicesStats:', error);
        res.status(500).json({
            success: false,
            message: error.message,
            error: error.message
        });
    }
};

// Generar estadísticas para todos los dispositivos (para cron job)
exports.generateAllDailyStats = async (req, res) => {
    try {
        const { date } = req.body;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Fecha requerida (formato: YYYY-MM-DD)'
            });
        }

        const result = await statisticsService.generateAllDailyStats(date);

        res.status(200).json({
            success: true,
            message: 'Estadísticas generadas para todos los dispositivos',
            data: result
        });
    } catch (error) {
        console.error('Error en generateAllDailyStats:', error);
        res.status(500).json({
            success: false,
            message: error.message,
            error: error.message
        });
    }
};

// Obtener resumen de estadísticas
exports.getStatsSummary = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { period } = req.query; // week, month, year

        const summary = await statisticsService.getStatsSummary(deviceId, period);

        res.status(200).json({
            success: true,
            message: 'Resumen de estadísticas obtenido',
            data: summary
        });
    } catch (error) {
        console.error('Error en getStatsSummary:', error);
        res.status(500).json({
            success: false,
            message: error.message,
            error: error.message
        });
    }
};