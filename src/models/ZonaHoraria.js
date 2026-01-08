const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ZonaHoraria = sequelize.define('ZonaHoraria', {
    idZonaHoraria: {
        type: DataTypes.TINYINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: false,
        allowNull: false
    },
    nombreZona: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Ej: America/Mexico_City'
    },
    offsetUTC: {
        type: DataTypes.DECIMAL(3, 1),
        allowNull: false,
        comment: 'Offset en horas desde UTC'
    },
    nombreMostrar: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Nombre para mostrar en UI'
    }
}, {
    tableName: 'zonas_horarias',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
});

module.exports = ZonaHoraria;