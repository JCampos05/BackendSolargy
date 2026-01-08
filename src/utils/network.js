const os = require('os');

/**
 * Obtener la IP local de la máquina
 * @returns {string} IP local
 */
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    
    // Buscar en todas las interfaces de red
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Filtrar:
            // - IPv4 (no IPv6)
            // - No loopback (127.0.0.1)
            // - Debe estar activo
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    
    return 'No se pudo determinar la IP';
}

/**
 * Obtener todas las IPs disponibles
 * @returns {Array} Array de objetos con nombre de interfaz e IP
 */
function getAllIPs() {
    const interfaces = os.networkInterfaces();
    const ips = [];
    
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                ips.push({
                    interface: name,
                    ip: iface.address
                });
            }
        }
    }
    
    return ips;
}

/**
 * Obtener información del sistema
 * @returns {Object} Información del sistema
 */
function getSystemInfo() {
    return {
        hostname: os.hostname(),
        platform: os.platform(),
        architecture: os.arch(),
        cpus: os.cpus().length,
        totalMemory: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
        freeMemory: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
        uptime: `${Math.floor(os.uptime() / 3600)} horas`
    };
}

module.exports = {
    getLocalIP,
    getAllIPs,
    getSystemInfo
};