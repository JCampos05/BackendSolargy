const { Sequelize } = require('sequelize');
require('dotenv').config();

// Determinar qué configuración usar según DB_MODE
const isProduction = process.env.DB_MODE === 'production';

const dbConfig = {
    host: isProduction ? process.env.DB_HOST_PROD : process.env.DB_HOST_LOCAL,
    port: isProduction ? process.env.DB_PORT_PROD : process.env.DB_PORT_LOCAL,
    name: isProduction ? process.env.DB_NAME_PROD : process.env.DB_NAME_LOCAL,
    user: isProduction ? process.env.DB_USER_PROD : process.env.DB_USER_LOCAL,
    password: isProduction ? process.env.DB_PASSWORD_PROD : process.env.DB_PASSWORD_LOCAL
};

const sequelize = new Sequelize(
    dbConfig.name,
    dbConfig.user,
    dbConfig.password,
    {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: 'mysql',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a MySQL establecida correctamente');
        console.log(`📍 Modo BD: ${isProduction ? 'PRODUCCIÓN' : 'LOCAL'} (${dbConfig.host}:${dbConfig.port}/${dbConfig.name})`);
    } catch (error) {
        console.error('❌ Error al conectar con la base de datos:', error);
        process.exit(1);
    }
};

module.exports = { sequelize, testConnection };