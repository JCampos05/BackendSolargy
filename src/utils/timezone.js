/**
 * Utilidades para manejo de zonas horarias
 */

/**
 * Convertir timestamp de milisegundos (ESP32) a Date UTC
 * @param {number} milliseconds - Milisegundos desde epoch
 * @returns {Date} Fecha en UTC
 */
function millisToUTC(milliseconds) {
    return new Date(milliseconds);
}

/**
 * Convertir timestamp UTC a zona horaria específica
 * @param {Date} utcDate - Fecha en UTC
 * @param {number} offsetHours - Offset en horas (ej: -6 para CST)
 * @returns {Date} Fecha ajustada
 */
function utcToTimezone(utcDate, offsetHours) {
    const date = new Date(utcDate);
    date.setHours(date.getHours() + offsetHours);
    return date;
}

/**
 * Obtener timestamp actual en milisegundos
 * @returns {number} Milisegundos desde epoch
 */
function getCurrentTimestamp() {
    return Date.now();
}

/**
 * Formatear fecha para mostrar con zona horaria
 * @param {Date} date - Fecha a formatear
 * @param {string} locale - Locale (default: 'es-MX')
 * @returns {string} Fecha formateada
 */
function formatDateWithTimezone(date, locale = 'es-MX') {
    return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).format(date);
}

/**
 * Obtener la fecha de hoy en formato YYYY-MM-DD para la zona horaria del dispositivo
 * @param {number} offsetHours - Offset en horas
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
function getTodayDateString(offsetHours = 0) {
    const now = new Date();
    const localDate = utcToTimezone(now, offsetHours);

    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

module.exports = {
    millisToUTC,
    utcToTimezone,
    getCurrentTimestamp,
    formatDateWithTimezone,
    getTodayDateString
};