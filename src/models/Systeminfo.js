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
    localizacion: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Ubicación física del sistema'
    },
    latitud: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
        comment: 'Latitud de la instalación'
    },
    longitud: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
        comment: 'Longitud de la instalación'
    },
    idZonaHoraria: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: true,
        defaultValue: 7,
        comment: 'Zona horaria del sistema'
    },
    ciudad: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Ciudad'
    },
    estado: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Estado/Provincia'
    },
    pais: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'País'
    },
    codigoPostal: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Código postal'
    },
    altitud: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true,
        comment: 'Altitud sobre el nivel del mar (m)'
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
        { fields: ['ultimaActualizacion'] },
        { fields: ['latitud', 'longitud'] },
        { fields: ['idZonaHoraria'] }
    ]
});

module.exports = SystemInfo;