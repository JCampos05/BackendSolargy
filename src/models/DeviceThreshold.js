const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DeviceThreshold = sequelize.define('DeviceThreshold', {
    idUmbral: {
        type: DataTypes.INTEGER.UNSIGNED,
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
    tipoUmbral: {
        type: DataTypes.ENUM(
            'VOLTAJE_MINIMO',
            'CORRIENTE_MINIMA',
            'POTENCIA_MINIMA',
            'RADIACION_MINIMA',
            'TEMPERATURA_MAXIMA',
            'HUMEDAD_MAXIMA'
        ),
        allowNull: false
    },
    valorUmbral: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
        comment: 'Valor del umbral'
    },
    esActivo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Umbral activo'
    },
    fechaCreado: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'fechaCreado'
    },
    fechaActualizado: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'fechaActualizado'
    }
}, {
    tableName: 'device_thresholds',
    timestamps: true,
    createdAt: 'fechaCreado',
    updatedAt: 'fechaActualizado',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    indexes: [
        {
            name: 'idx_dispositivo_activo',
            fields: ['idDispositivo', 'esActivo']
        },
        {
            name: 'unique_dispositivo_tipo',
            unique: true,
            fields: ['idDispositivo', 'tipoUmbral']
        }
    ]
});

module.exports = DeviceThreshold;