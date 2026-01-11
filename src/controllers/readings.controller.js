const readingsService = require('../services/readings.service');

// Recibir lectura del ESP32
exports.receiveReading = async (req, res) => {
    try {
        console.log('\n========================================');
        console.log('📡 NUEVA LECTURA RECIBIDA DEL ESP32');
        console.log('========================================');
        console.log('⏰ Timestamp:', new Date().toLocaleString('es-MX'));
        console.log('🌐 IP Cliente:', req.ip);
        console.log('\n--- 📥 DATOS RECIBIDOS (RAW) ---');
        console.log(JSON.stringify(req.body, null, 2));

        // Procesar los datos en el servicio (ahora guarda en BD)
        const processedData = await readingsService.processReading(req.body);

        console.log('\n--- ✅ DATOS PROCESADOS Y GUARDADOS EN BD ---');
        console.log(JSON.stringify(processedData, null, 2));
        console.log('========================================\n');

        // Responder al ESP32
        res.status(200).json({
            success: true,
            message: 'Datos recibidos, procesados y guardados correctamente',
            timestamp: new Date().toISOString(),
            data: processedData
        });

    } catch (error) {
        console.error('\n❌ ERROR AL PROCESAR LECTURA');
        console.error('Mensaje:', error.message);
        console.error('Stack:', error.stack);
        console.error('========================================\n');

        res.status(500).json({
            success: false,
            message: 'Error al procesar los datos',
            error: error.message
        });
    }
};

// Obtener última lectura
exports.getLatestReading = async (req, res) => {
    try {
        const { deviceId } = req.query;
        const latestReading = await readingsService.getLatestReading(deviceId);

        if (!latestReading) {
            return res.status(200).json({
                success: false,
                message: 'No hay lecturas recientes disponibles. El dispositivo puede estar desconectado.',
                data: null
            });
        }

        res.status(200).json({
            success: true,
            message: 'Última lectura obtenida',
            data: latestReading
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener la última lectura',
            error: error.message,
            data: null
        });
    }
};

// Obtener historial de lecturas
exports.getAllReadings = async (req, res) => {
    try {
        const { deviceId, limit } = req.query;
        const history = await readingsService.getHistory(
            deviceId, 
            limit ? parseInt(limit) : 100
        );

        res.status(200).json({
            success: true,
            message: 'Historial de lecturas',
            count: history.length,
            filters: {
                deviceId: deviceId || 'todos',
                limit: limit ? parseInt(limit) : 100
            },
            data: history
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el historial',
            error: error.message
        });
    }
};