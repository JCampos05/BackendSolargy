const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Device = sequelize.define('Device', {
    idDispositivo: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Nombre descriptivo'
    },
    localizacion: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Nombre de la ubicación (ej: Los Mochis, Sinaloa)'
    },
    latitud: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
        comment: 'Latitud del dispositivo'
    },
    longitud: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
        comment: 'Longitud del dispositivo'
    },
    idZonaHoraria: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: false,
        defaultValue: 6,
        comment: 'Zona horaria del dispositivo',
        references: {
            model: 'zonas_horarias',
            key: 'idZonaHoraria'
        }
    },
    panelVoltageNominal: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Voltaje nominal panel (V)'
    },
    panelCorrienteMax: {
        type: DataTypes.DECIMAL(7, 2),
        allowNull: true,
        comment: 'Corriente máxima panel (mA)'
    },
    panelPotenciaNominal: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true,
        comment: 'Potencia nominal panel (mW)'
    },
    esActivo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Dispositivo activo'
    },
    ultimaLectura: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Última comunicación'
    },
    lecturasTotales: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        comment: 'Total de lecturas recibidas'
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
    tableName: 'devices',
    timestamps: true,
    createdAt: 'fechaCreado',
    updatedAt: 'fechaActualizado',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    indexes: [
        {
            name: 'idx_activo',
            fields: ['esActivo']
        },
        {
            name: 'idx_ultima_lectura',
            fields: ['ultimaLectura']
        },
        {
            name: 'idx_zona_horaria',
            fields: ['idZonaHoraria']
        },
        {
            name: 'idx_coordenadas',
            fields: ['latitud', 'longitud']
        }
    ]
});

module.exports = Device;