const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SystemInfo = sequelize.define('SystemInfo', {
    idInfo: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    nombreSistema: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: 'Solargy',
        comment: 'Nombre del sistema'
    },
    versionSistema: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: 'Versión actual del sistema'
    },
    totalDispositivos: {
        type: DataTypes.INTEGER.UNSIGNED,
        defaultValue: 0,
        comment: 'Total de dispositivos registrados'
    },
    dispositivosActivos: {
        type: DataTypes.INTEGER.UNSIGNED,
        defaultValue: 0,
        comment: 'Dispositivos actualmente activos'
    },
    totalLecturas: {
        type: DataTypes.BIGINT.UNSIGNED,
        defaultValue: 0,
        comment: 'Total de lecturas en el sistema'
    },
    eventosNoResueltos: {
        type: DataTypes.INTEGER.UNSIGNED,
        defaultValue: 0,
        comment: 'Eventos pendientes de resolver'
    },
    ultimoEventoCritico: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        comment: 'Último evento crítico'
    },
    estadoGeneral: {
        type: DataTypes.ENUM('OPERATIVO', 'DEGRADADO', 'MANTENIMIENTO', 'ERROR'),
        allowNull: false,
        defaultValue: 'OPERATIVO',
        comment: 'Estado general del sistema'
    },
    versionFirmware: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Versión firmware ESP32'
    },
    versionBackend: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Versión backend'
    },
    versionFrontend: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Versión frontend'
    },
    fechaInicioOperacion: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Fecha de inicio de operaciones'
    },
    ultimaActualizacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        comment: 'Última actualización'
    },
    metadataAdicional: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Datos adicionales del sistema'
    }
}, {
    tableName: 'system_info',
    timestamps: false,
    indexes: [
        { fields: ['estadoGeneral'] },
        { fields: ['ultimaActualizacion'] }
    ]
});

module.exports = SystemInfo;