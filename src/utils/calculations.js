/**
 * Utilidades para cálculos de panel solar
 */

/**
 * Calcular eficiencia del panel solar
 * @param {number} powerMW - Potencia en mW
 * @param {number} irradiance - Irradiancia en W/m²
 * @param {number} panelAreaM2 - Área del panel en m² (default: 0.01 para panel 5V@160mA)
 * @returns {number} Eficiencia en porcentaje (0-100)
 */
function calculateEfficiency(powerMW, irradiance, panelAreaM2 = 0.01) {
    if (irradiance <= 0 || powerMW <= 0 || panelAreaM2 <= 0) {
        return 0;
    }

    // Potencia incidente = Irradiancia × Área (en Watts)
    const incidentPowerWatts = irradiance * panelAreaM2;

    if (incidentPowerWatts <= 0) {
        return 0;
    }

    // Potencia generada en Watts
    const generatedPowerWatts = powerMW / 1000;

    // Eficiencia = (Potencia generada / Potencia incidente) × 100
    const efficiency = (generatedPowerWatts / incidentPowerWatts) * 100;

    // Limitar eficiencia a valores razonables (0-100%)
    return Math.min(Math.max(efficiency, 0), 100);
}

/**
 * Calcular factor de capacidad
 * @param {number} energyGenerated - Energía generada en Wh
 * @param {number} nominalPower - Potencia nominal en mW
 * @param {number} hours - Período de tiempo en horas
 * @returns {number} Factor de capacidad en porcentaje (0-100)
 */
function calculateCapacityFactor(energyGenerated, nominalPower, hours) {
    if (nominalPower <= 0 || hours <= 0) {
        return 0;
    }

    // Energía teórica máxima = Potencia nominal × tiempo
    const theoreticalMaxEnergy = (nominalPower / 1000) * hours;

    if (theoreticalMaxEnergy <= 0) {
        return 0;
    }

    // Factor de capacidad = (Energía real / Energía teórica) × 100
    const capacityFactor = (energyGenerated / theoreticalMaxEnergy) * 100;

    return Math.min(Math.max(capacityFactor, 0), 100);
}

/**
 * Convertir mW a W
 * @param {number} milliwatts - Potencia en mW
 * @returns {number} Potencia en W
 */
function mWtoW(milliwatts) {
    return milliwatts / 1000;
}

/**
 * Convertir mA a A
 * @param {number} milliamps - Corriente en mA
 * @returns {number} Corriente en A
 */
function mAtoA(milliamps) {
    return milliamps / 1000;
}

/**
 * Formatear tiempo de funcionamiento
 * @param {number} seconds - Segundos
 * @returns {string} Tiempo formateado (ej: "2h 30m 15s")
 */
function formatUptime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours}h ${minutes}m ${secs}s`;
}

/**
 * Determinar si hay "luz útil" para el panel
 * @param {number} irradiance - Irradiancia en W/m²
 * @param {number} threshold - Umbral mínimo (default: 50 W/m²)
 * @returns {boolean} True si hay luz útil
 */
function hasUsefulLight(irradiance, threshold = 50) {
    return irradiance >= threshold;
}

module.exports = {
    calculateEfficiency,
    calculateCapacityFactor,
    mWtoW,
    mAtoA,
    formatUptime,
    hasUsefulLight
};