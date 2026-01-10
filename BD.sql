-- ============================================
-- ESQUEMA DE BASE DE DATOS - MONITOREO SOLAR
-- ============================================

-- Tabla de Zonas Horarias (24 zonas principales)
CREATE TABLE zonas_horarias (
  idZonaHoraria TINYINT UNSIGNED PRIMARY KEY,
  nombreZona VARCHAR(50) NOT NULL UNIQUE COMMENT 'Ej: America/Mexico_City',
  offsetUTC DECIMAL(3,1) NOT NULL COMMENT 'Offset en horas desde UTC',
  nombreMostrar VARCHAR(100) NOT NULL COMMENT 'Nombre para mostrar en UI'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Dispositivos
CREATE TABLE devices (
  -- Identificador
  idDispositivo VARCHAR(50) PRIMARY KEY,
  
  -- Información del dispositivo
  nombre VARCHAR(100) NOT NULL COMMENT 'Nombre descriptivo',
  localizacion VARCHAR(255) DEFAULT NULL COMMENT 'Ubicación física',
  latitud DECIMAL (10,8) DEFAULT NULL,
  longitud DECIMAL (11,8) DEFAULT NULL,
  -- Zona horaria
  idZonaHoraria TINYINT UNSIGNED DEFAULT 1 COMMENT 'Zona horaria del dispositivo',
  
  -- Especificaciones del panel
  panelVoltageNominal DECIMAL(5,2) DEFAULT NULL COMMENT 'Voltaje nominal panel (V)',
  panelCorrienteMax DECIMAL(7,2) DEFAULT NULL COMMENT 'Corriente máxima panel (mA)',
  panelPotenciaNominal DECIMAL(8,2) DEFAULT NULL COMMENT 'Potencia nominal panel (mW)',
  
  -- Estado
  esActivo BOOLEAN DEFAULT TRUE COMMENT 'Dispositivo activo',
  ultimaLectura TIMESTAMP NULL DEFAULT NULL COMMENT 'Última comunicación',
  
  -- Estadísticas
  lecturasTotales INT UNSIGNED DEFAULT 0 COMMENT 'Total de lecturas recibidas',
  
  -- Metadatos
  fechaCreado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fechaActualizado TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Índices
  INDEX idx_activo (esActivo),
  INDEX idx_ultima_lectura (ultimaLectura),
  INDEX idx_zona_horaria (idZonaHoraria),
  
  -- Relación con zona horaria
  FOREIGN KEY (idZonaHoraria) REFERENCES zonas_horarias(idZonaHoraria)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Lecturas
CREATE TABLE readings (
  -- Identificadores
  idReading BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  idDispositivo VARCHAR(50) NOT NULL,
  
  -- Timestamp
  tiempoLocal BIGINT NOT NULL COMMENT 'Milisegundos desde epoch (ESP32)',
  timestampUTC TIMESTAMP NOT NULL COMMENT 'Timestamp convertido a UTC',
  
  -- Mediciones del panel solar
  voltage DECIMAL(6,3) NOT NULL COMMENT 'Voltaje del panel (V)',
  corriente DECIMAL(8,3) NOT NULL COMMENT 'Corriente del panel (mA)',
  power DECIMAL(10,3) NOT NULL COMMENT 'Potencia instantánea (mW)',
  
  -- Mediciones de radiación
  solarRadiation DECIMAL(10,2) NOT NULL COMMENT 'Radiación solar (lux)',
  irradiance DECIMAL(8,3) NOT NULL COMMENT 'Irradiancia (W/m²)',
  
  -- Energía y estado
  energiaAcumulada DECIMAL(12,6) NOT NULL COMMENT 'Energía acumulada (Wh)',
  segundosFuncionando INT UNSIGNED NOT NULL COMMENT 'Tiempo funcionamiento (s)',
  
  -- Datos ambientales opcionales
  temperatura DECIMAL(5,2) DEFAULT NULL COMMENT 'Temperatura ambiente (°C)',
  humedad DECIMAL(5,2) DEFAULT NULL COMMENT 'Humedad relativa (%)',
  
  -- Calidad de conexión
  nivelSenal TINYINT DEFAULT NULL COMMENT 'Señal WiFi RSSI (dBm)',
  nivelBateria DECIMAL(5,2) DEFAULT NULL COMMENT 'Nivel batería ESP32 (%)',
  
  -- Metadatos
  fechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fechaActualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Índices
  INDEX idx_dispositivo_tiempo (idDispositivo, timestampUTC),
  INDEX idx_fecha_creacion (fechaCreacion),
  INDEX idx_dispositivo_fecha (idDispositivo, fechaCreacion),
  INDEX idx_timestamp_utc (timestampUTC),
  
  -- Relación
  FOREIGN KEY (idDispositivo) REFERENCES devices(idDispositivo) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Estadísticas Diarias
CREATE TABLE daily_statistics (
  -- Identificadores
  idEstadistica INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  idDispositivo VARCHAR(50) NOT NULL,
  fechaEstadistica DATE NOT NULL COMMENT 'Fecha de las estadísticas',
  
  -- Energía
  energiaTotalDia DECIMAL(10,4) NOT NULL COMMENT 'Energía total del día (Wh)',
  
  -- Potencia
  picoPotencia DECIMAL(10,3) NOT NULL COMMENT 'Potencia pico del día (mW)',
  picoPotenciaHora TIME DEFAULT NULL COMMENT 'Hora de potencia pico',
  promPotencia DECIMAL(10,3) NOT NULL COMMENT 'Potencia promedio (mW)',
  
  -- Radiación
  picoRadiacion DECIMAL(10,2) NOT NULL COMMENT 'Radiación pico (lux)',
  promRadiacion DECIMAL(10,2) NOT NULL COMMENT 'Radiación promedio (lux)',
  minutosLuzUtil INT UNSIGNED NOT NULL COMMENT 'Minutos con luz útil',
  
  -- Eficiencia
  panelEficiencia DECIMAL(5,2) DEFAULT NULL COMMENT 'Eficiencia calculada (%)',
  factorCapacidad DECIMAL(5,2) DEFAULT NULL COMMENT 'Factor de capacidad (%)',
  
  -- Contadores
  lecturasTotales INT UNSIGNED NOT NULL COMMENT 'Lecturas recibidas en el día',
  
  -- Metadatos
  fechaCreado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fechaActualizado TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Índices
  UNIQUE KEY unique_dispositivo_fecha (idDispositivo, fechaEstadistica),
  INDEX idx_fecha (fechaEstadistica),
  INDEX idx_dispositivo_fecha (idDispositivo, fechaEstadistica),
  
  -- Relación
  FOREIGN KEY (idDispositivo) REFERENCES devices(idDispositivo) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Umbrales de Alertas
CREATE TABLE device_thresholds (
  idUmbral INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  idDispositivo VARCHAR(50) NOT NULL,
  tipoUmbral ENUM(
    'VOLTAJE_MINIMO',
    'CORRIENTE_MINIMA',
    'POTENCIA_MINIMA',
    'RADIACION_MINIMA',
    'TEMPERATURA_MAXIMA',
    'HUMEDAD_MAXIMA'
  ) NOT NULL,
  valorUmbral DECIMAL(10,3) NOT NULL COMMENT 'Valor del umbral',
  esActivo BOOLEAN DEFAULT TRUE COMMENT 'Umbral activo',
  
  -- Metadatos
  fechaCreado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fechaActualizado TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Índices
  INDEX idx_dispositivo_activo (idDispositivo, esActivo),
  UNIQUE KEY unique_dispositivo_tipo (idDispositivo, tipoUmbral),
  
  -- Relación
  FOREIGN KEY (idDispositivo) REFERENCES devices(idDispositivo)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Eventos
CREATE TABLE events (
  -- Identificador
  idEvento BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  idDispositivo VARCHAR(50) DEFAULT NULL,
  
  -- Tipo de evento
  tipoEvento ENUM(
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
  ) NOT NULL,
  
  -- Severidad
  severidad ENUM('INFO', 'WARNING', 'ERROR', 'CRITICAL') NOT NULL DEFAULT 'INFO',
  
  -- Detalles
  titulo VARCHAR(255) NOT NULL COMMENT 'Título del evento',
  descripcion TEXT DEFAULT NULL COMMENT 'Descripción detallada',
  metadata JSON DEFAULT NULL COMMENT 'Datos adicionales del evento',
  
  -- Estado
  esResuelto BOOLEAN DEFAULT FALSE COMMENT 'Evento resuelto',
  fechaResuelto TIMESTAMP NULL DEFAULT NULL,
  
  -- Metadatos
  fechaCreado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Índices
  INDEX idx_dispositivo_tipo (idDispositivo, tipoEvento),
  INDEX idx_severidad (severidad),
  INDEX idx_fecha_creado (fechaCreado),
  INDEX idx_no_resueltos (esResuelto, fechaCreado),
  INDEX idx_dispositivo_fecha (idDispositivo, fechaCreado),
  
  -- Relación
  FOREIGN KEY (idDispositivo) REFERENCES devices(idDispositivo) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE system_info (
  -- Identificador
  idInfo INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  
  -- Información del sistema
  nombreSistema VARCHAR(100) NOT NULL DEFAULT 'Solargy' COMMENT 'Nombre del sistema',
  versionSistema VARCHAR(20) NOT NULL COMMENT 'Versión actual del sistema',
  
  -- Estadísticas generales
  totalDispositivos INT UNSIGNED DEFAULT 0 COMMENT 'Total de dispositivos registrados',
  dispositivosActivos INT UNSIGNED DEFAULT 0 COMMENT 'Dispositivos actualmente activos',
  totalLecturas BIGINT UNSIGNED DEFAULT 0 COMMENT 'Total de lecturas en el sistema',
  
  -- Eventos y alertas
  eventosNoResueltos INT UNSIGNED DEFAULT 0 COMMENT 'Eventos pendientes de resolver',
  ultimoEventoCritico TIMESTAMP NULL DEFAULT NULL COMMENT 'Último evento crítico',
  
  -- Estado del sistema
  estadoGeneral ENUM('OPERATIVO', 'DEGRADADO', 'MANTENIMIENTO', 'ERROR') 
    NOT NULL DEFAULT 'OPERATIVO' COMMENT 'Estado general del sistema',
  
  -- Información de versiones
  versionFirmware VARCHAR(20) DEFAULT NULL COMMENT 'Versión firmware ESP32',
  versionBackend VARCHAR(20) DEFAULT NULL COMMENT 'Versión backend',
  versionFrontend VARCHAR(20) DEFAULT NULL COMMENT 'Versión frontend',
  
  -- Metadatos
  fechaInicioOperacion DATE DEFAULT NULL COMMENT 'Fecha de inicio de operaciones',
  ultimaActualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  metadataAdicional JSON DEFAULT NULL COMMENT 'Datos adicionales del sistema',
  idZonaHoraria TINYINT UNSIGNED DEFAULT 7 COMMENT 'Zona horaria del sistema',

  -- Índices
  INDEX idx_estado (estadoGeneral),
  INDEX idx_actualizacion (ultimaActualizacion),
  ADD INDEX idx_zona_horaria (idZonaHoraria),
  ADD FOREIGN KEY (idZonaHoraria) REFERENCES zonas_horarias(idZonaHoraria)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;
) ;


-- ============================================
-- DATOS INICIALES - 24 ZONAS HORARIAS
-- ============================================

INSERT INTO zonas_horarias (idZonaHoraria, nombreZona, offsetUTC, nombreMostrar) VALUES
-- UTC y zonas negativas (oeste)
(1, 'Etc/GMT+12', -12.0, 'UTC-12:00 (Baker Island)'),
(2, 'Pacific/Midway', -11.0, 'UTC-11:00 (Samoa)'),
(3, 'Pacific/Honolulu', -10.0, 'UTC-10:00 (Hawaii)'),
(4, 'America/Anchorage', -9.0, 'UTC-09:00 (Alaska)'),
(5, 'America/Los_Angeles', -8.0, 'UTC-08:00 (PST - Pacífico)'),
(6, 'America/Denver', -7.0, 'UTC-07:00 (MST - Montaña)'),
(7, 'America/Chicago', -6.0, 'UTC-06:00 (CST - Central)'),
(8, 'America/New_York', -5.0, 'UTC-05:00 (EST - Este)'),
(9, 'America/Caracas', -4.0, 'UTC-04:00 (AST - Atlántico)'),
(10, 'America/Sao_Paulo', -3.0, 'UTC-03:00 (BRT - Brasil)'),
(11, 'Atlantic/South_Georgia', -2.0, 'UTC-02:00 (Georgia del Sur)'),
(12, 'Atlantic/Azores', -1.0, 'UTC-01:00 (Azores)'),
-- UTC
(13, 'UTC', 0.0, 'UTC±00:00 (Greenwich)'),
-- Zonas positivas (este)
(14, 'Europe/Paris', 1.0, 'UTC+01:00 (CET - Europa Central)'),
(15, 'Europe/Athens', 2.0, 'UTC+02:00 (EET - Europa Este)'),
(16, 'Europe/Moscow', 3.0, 'UTC+03:00 (MSK - Moscú)'),
(17, 'Asia/Dubai', 4.0, 'UTC+04:00 (GST - Golfo)'),
(18, 'Asia/Karachi', 5.0, 'UTC+05:00 (PKT - Pakistán)'),
(19, 'Asia/Dhaka', 6.0, 'UTC+06:00 (BST - Bangladesh)'),
(20, 'Asia/Bangkok', 7.0, 'UTC+07:00 (ICT - Indochina)'),
(21, 'Asia/Shanghai', 8.0, 'UTC+08:00 (CST - China)'),
(22, 'Asia/Tokyo', 9.0, 'UTC+09:00 (JST - Japón)'),
(23, 'Australia/Sydney', 10.0, 'UTC+10:00 (AEST - Australia Este)'),
(24, 'Pacific/Auckland', 12.0, 'UTC+12:00 (NZST - Nueva Zelanda)');

-- Registro inicial
INSERT INTO system_info (
  nombreSistema, 
  versionSistema, 
  versionBackend, 
  versionFrontend,
  fechaInicioOperacion
) VALUES (
  'Solargy',
  '1.0.0',
  '1.0.0',
  '1.0.0',
  CURDATE()
);