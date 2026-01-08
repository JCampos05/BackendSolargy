const { sequelize } = require('../config/database');

// Importar modelos
const ZonaHoraria = require('./ZonaHoraria');
const Device = require('./Device');
const Reading = require('./Reading');
const DailyStatistic = require('./DailyStatistic');
const DeviceThreshold = require('./DeviceThreshold');
const Event = require('./Event');
const SystemInfo = require('./SystemInfo');

// ========== DEFINIR RELACIONES ==========

// ZonaHoraria -> Device (1:N)
ZonaHoraria.hasMany(Device, {
    foreignKey: 'idZonaHoraria',
    as: 'dispositivos'
});
Device.belongsTo(ZonaHoraria, {
    foreignKey: 'idZonaHoraria',
    as: 'zonaHoraria'
});

// Device -> Reading (1:N)
Device.hasMany(Reading, {
    foreignKey: 'idDispositivo',
    as: 'lecturas',
    onDelete: 'CASCADE'
});
Reading.belongsTo(Device, {
    foreignKey: 'idDispositivo',
    as: 'dispositivo'
});

// Device -> DailyStatistic (1:N)
Device.hasMany(DailyStatistic, {
    foreignKey: 'idDispositivo',
    as: 'estadisticas',
    onDelete: 'CASCADE'
});
DailyStatistic.belongsTo(Device, {
    foreignKey: 'idDispositivo',
    as: 'dispositivo'
});

// Device -> DeviceThreshold (1:N)
Device.hasMany(DeviceThreshold, {
    foreignKey: 'idDispositivo',
    as: 'umbrales',
    onDelete: 'CASCADE'
});
DeviceThreshold.belongsTo(Device, {
    foreignKey: 'idDispositivo',
    as: 'dispositivo'
});

// Device -> Event (1:N)
Device.hasMany(Event, {
    foreignKey: 'idDispositivo',
    as: 'eventos',
    onDelete: 'SET NULL'
});
Event.belongsTo(Device, {
    foreignKey: 'idDispositivo',
    as: 'dispositivo'
});

// ========== EXPORTAR MODELOS Y SEQUELIZE ==========

module.exports = {
    sequelize,
    ZonaHoraria,
    Device,
    Reading,
    DailyStatistic,
    DeviceThreshold,
    Event,
    SystemInfo
};