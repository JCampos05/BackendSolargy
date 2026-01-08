const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DailyStatistic = sequelize.define('DailyStatistic', {
    idEstadistica: {
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
    fechaEstadistica: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Fecha de las estadísticas'
    },
    energiaTotalDia: {
        type: DataTypes.DECIMAL(10, 4),
        allowNull: false,
        comment: 'Energía total del día (Wh)'
    },
    picoPotencia: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
        comment: 'Potencia pico del día (mW)'
    },
    picoPotenciaHora: {
        type: DataTypes.TIME,
        allowNull: true,
        defaultValue: null,
        comment: 'Hora de potencia pico'
    },
    promPotencia: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
        comment: 'Potencia promedio (mW)'
    },
    picoRadiacion: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Radiación pico (lux)'
    },
    promRadiacion: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Radiación promedio (lux)'
    },
    minutosLuzUtil: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'Minutos con luz útil'
    },
    panelEficiencia: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: null,
        comment: 'Eficiencia calculada (%)'
    },
    factorCapacidad: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: null,
        comment: 'Factor de capacidad (%)'
    },
    lecturasTotales: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'Lecturas recibidas en el día'
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
    tableName: 'daily_statistics',
    timestamps: true,
    createdAt: 'fechaCreado',
    updatedAt: 'fechaActualizado',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    indexes: [
        {
            name: 'unique_dispositivo_fecha',
            unique: true,
            fields: ['idDispositivo', 'fechaEstadistica']
        },
        {
            name: 'idx_fecha',
            fields: ['fechaEstadistica']
        },
        {
            name: 'idx_dispositivo_fecha',
            fields: ['idDispositivo', 'fechaEstadistica']
        }
    ]
});

module.exports = DailyStatistic;