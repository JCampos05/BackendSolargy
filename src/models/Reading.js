const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Reading = sequelize.define('Reading', {
    idReading: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    idDispositivo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        references: {
            model: 'devices',
            key: 'idDispositivo'
        }
    },
    tiempoLocal: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: 'Milisegundos desde epoch (ESP32)'
    },
    timestampUTC: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'Timestamp convertido a UTC'
    },
    voltage: {
        type: DataTypes.DECIMAL(6, 3),
        allowNull: false,
        comment: 'Voltaje del panel (V)'
    },
    corriente: {
        type: DataTypes.DECIMAL(8, 3),
        allowNull: false,
        comment: 'Corriente del panel (mA)'
    },
    power: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
        comment: 'Potencia instantánea (mW)'
    },
    solarRadiation: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Radiación solar (lux)'
    },
    irradiance: {
        type: DataTypes.DECIMAL(8, 3),
        allowNull: false,
        comment: 'Irradiancia (W/m²)'
    },
    energiaAcumulada: {
        type: DataTypes.DECIMAL(12, 6),
        allowNull: false,
        comment: 'Energía acumulada (Wh)'
    },
    segundosFuncionando: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'Tiempo funcionamiento (s)'
    },
    temperatura: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: null,
        comment: 'Temperatura ambiente (°C)'
    },
    humedad: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: null,
        comment: 'Humedad relativa (%)'
    },
    nivelSenal: {
        type: DataTypes.TINYINT,
        allowNull: true,
        defaultValue: null,
        comment: 'Señal WiFi RSSI (dBm)'
    },
    nivelBateria: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: null,
        comment: 'Nivel batería ESP32 (%)'
    },
    fechaCreacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'fechaCreacion'
    },
    fechaActualizacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'fechaActualizacion'
    }
}, {
    tableName: 'readings',
    timestamps: true,
    createdAt: 'fechaCreacion',
    updatedAt: 'fechaActualizacion',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    indexes: [
        {
            name: 'idx_dispositivo_tiempo',
            fields: ['idDispositivo', 'timestampUTC']
        },
        {
            name: 'idx_fecha_creacion',
            fields: ['fechaCreacion']
        },
        {
            name: 'idx_dispositivo_fecha',
            fields: ['idDispositivo', 'fechaCreacion']
        },
        {
            name: 'idx_timestamp_utc',
            fields: ['timestampUTC']
        }
    ]
});

module.exports = Reading;