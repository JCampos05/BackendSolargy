const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Event = sequelize.define('Event', {
    idEvento: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    idDispositivo: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: null,
        references: {
            model: 'devices',
            key: 'idDispositivo'
        }
    },
    tipoEvento: {
        type: DataTypes.ENUM(
            'DISPOSITIVO_REGISTRADO',
            'DISPOSITIVO_ONLINE',
            'DISPOSITIVO_OFFLINE',
            'BAJA_GENERACION',
            'TEMPERATURA_ALTA',
            'ERROR_SENSOR',
            'BATERIA_BAJA',
            'BATERIA_LLENA',
            'ERROR_SISTEMA',
            'MANTENIMIENTO',
            'UMBRAL_SUPERADO',
            'OTRO'
        ),
        allowNull: false
    },
    severidad: {
        type: DataTypes.ENUM('INFO', 'WARNING', 'ERROR', 'CRITICAL'),
        allowNull: false,
        defaultValue: 'INFO'
    },
    titulo: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Título del evento'
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
        comment: 'Descripción detallada'
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null,
        comment: 'Datos adicionales del evento'
    },
    esResuelto: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Evento resuelto'
    },
    fechaResuelto: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    },
    fechaCreado: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'fechaCreado'
    }
}, {
    tableName: 'events',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    indexes: [
        {
            name: 'idx_dispositivo_tipo',
            fields: ['idDispositivo', 'tipoEvento']
        },
        {
            name: 'idx_severidad',
            fields: ['severidad']
        },
        {
            name: 'idx_fecha_creado',
            fields: ['fechaCreado']
        },
        {
            name: 'idx_no_resueltos',
            fields: ['esResuelto', 'fechaCreado']
        },
        {
            name: 'idx_dispositivo_fecha',
            fields: ['idDispositivo', 'fechaCreado']
        }
    ]
});

module.exports = Event;