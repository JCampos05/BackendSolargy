const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

// Importar desde models/index.js que incluye sequelize
const { testConnection } = require('./config/database');
const { sequelize } = require('./models');
const routes = require('./routes/index.routes');
const { getLocalIP, getAllIPs } = require('./utils/network');

const app = express();
const PORT = process.env.PORT || 3000;

// ========== MIDDLEWARES ==========
app.use(cors()); // Habilitar CORS
app.use(express.json()); // Parser JSON
app.use(express.urlencoded({ extended: true })); // Parser URL-encoded
app.use(morgan('dev')); // Logger de requests

// ========== RUTAS ==========
app.use('/api', routes);

// Ruta de health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// Ruta raíz
app.get('/', (req, res) => {
    const localIP = getLocalIP();
    res.json({
        success: true,
        message: '🌞 API Sistema de Monitoreo Solar',
        version: '1.0.0',
        server: {
            localIP: localIP,
            port: PORT,
            apiUrl: `http://${localIP}:${PORT}/api/readings`
        },
        endpoints: {
            health: '/health',
            readings: '/api/readings',
            latest: '/api/readings/latest'
        }
    });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Ruta no encontrada'
    });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        details: err.message
    });
});

// ========== INICIAR SERVIDOR ==========
const startServer = async () => {
    try {
        // Probar conexión a la base de datos
        await testConnection();
        
        // Sincronizar modelos con la base de datos
        // NOTA: usar { alter: true } solo en desarrollo, en producción usar migraciones
        await sequelize.sync({ alter: false });
        console.log('✅ Modelos sincronizados con MySQL\n');

        // Obtener IP local
        const localIP = getLocalIP();
        const allIPs = getAllIPs();

        // IMPORTANTE: Escuchar en '0.0.0.0' para aceptar conexiones externas
        app.listen(PORT, '0.0.0.0', () => {
            console.log('\n');
            console.log('╔═══════════════════════════════════════════════════════════╗');
            console.log('║         🌞 SERVIDOR DE MONITOREO SOLAR - INICIADO         ║');
            console.log('╚═══════════════════════════════════════════════════════════╝');
            console.log('\n📡 INFORMACIÓN DE RED:');
            console.log('┌────────────────────────────────────────────────────────────┐');
            console.log(`│ 🌐 IP Local Principal: ${localIP.padEnd(38)} │`);
            console.log(`│ 🔌 Puerto: ${PORT.toString().padEnd(47)} │`);
            console.log('└────────────────────────────────────────────────────────────┘');
            
            // Mostrar todas las IPs disponibles si hay más de una
            if (allIPs.length > 1) {
                console.log('\n📶 Otras interfaces de red disponibles:');
                allIPs.forEach(({ interface: name, ip }) => {
                    if (ip !== localIP) {
                        console.log(`   • ${name}: ${ip}`);
                    }
                });
            }

            console.log('\n🔗 URLs DE ACCESO:');
            console.log('┌────────────────────────────────────────────────────────────┐');
            console.log(`│ Local:    http://localhost:${PORT.toString().padEnd(38)} │`);
            console.log(`│ Red:      http://${localIP}:${PORT.toString().padEnd(35)} │`);
            console.log('└────────────────────────────────────────────────────────────┘');

            console.log('\n⚙️  CONFIGURACIÓN PARA ESP32 (config.h):');
            console.log('┌────────────────────────────────────────────────────────────┐');
            console.log(`│ const char* API_URL =                                      │`);
            console.log(`│   "http://${localIP}:${PORT}/api/readings";${' '.repeat(Math.max(0, 18 - localIP.length))} │`);
            console.log('└────────────────────────────────────────────────────────────┘');

            console.log('\n📋 ENDPOINTS DISPONIBLES:');
            console.log('┌────────────────────────────────────────────────────────────┐');
            console.log('│ GET  /                    - Información del API            │');
            console.log('│ GET  /health              - Health check                   │');
            console.log('│ POST /api/readings        - Recibir datos del ESP32       │');
            console.log('│ GET  /api/readings/latest - Última lectura recibida       │');
            console.log('│ GET  /api/readings        - Historial completo            │');
            console.log('└────────────────────────────────────────────────────────────┘');

            console.log('\n✅ Servidor listo para recibir datos del ESP32');
            console.log('💾 Datos guardándose en MySQL\n');
        });
    } catch (error) {
        console.error('\n╔═══════════════════════════════════════════════════════════╗');
        console.error('║                    ❌ ERROR CRÍTICO                        ║');
        console.error('╚═══════════════════════════════════════════════════════════╝');
        console.error('\n', error);
        console.error('\n💡 Posibles soluciones:');
        console.error('   • Verifica que MySQL esté corriendo');
        console.error('   • Revisa las credenciales en el archivo .env');
        console.error('   • Asegúrate de que el puerto 3000 esté disponible');
        console.error('   • Verifica que la base de datos exista y el esquema esté creado\n');
        process.exit(1);
    }
};

startServer();