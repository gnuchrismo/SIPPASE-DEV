/*
 * Proyecto: PORTAL SIPPASE - ROBITCMS
 * Autor: Christian Mollo
 * Contacto: gnuchrismo@gmail.com | LinkedIn: https://www.linkedin.com/in/gnuchrismo/?locale=es_ES
 * Patrocinado por: UNWOMEN - Especialista en Desarrollo de Sistemas SIPPASE, Nov - Dic 2025
 *
 * Licencia: PROPIETARIA - Uso exclusivo autorizado para la entidad beneficiaria.
 * Queda prohibida la copia, distribución, modificación o uso no autorizado.
 *
 * Advertencia: Algunas partes de este proyecto utilizan librerías o frameworks
 * de terceros bajo licencias propias (por ejemplo Quasar Framework - MIT License).
 * Se debe cumplir con todas las licencias externas involucradas.
 *
 * © 2025 Desarrollado por Christian Mollo - UNWOMEN - Especialista en Desarrollo de Sistemas SIPPASE, Nov - Dic 2025, Todos los derechos reservados.
 */
/**
 * Professional Logging Utility
 * Provides structured, colorized logging for the application
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  
  // Foreground colors
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  
  // Background colors
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m'
};

// Log levels
const levels = {
  ERROR: { value: 0, color: colors.red, label: 'ERROR', icon: '❌' },
  WARN: { value: 1, color: colors.yellow, label: 'WARN', icon: '⚠️' },
  INFO: { value: 2, color: colors.blue, label: 'INFO', icon: 'ℹ️' },
  SUCCESS: { value: 3, color: colors.green, label: 'SUCCESS', icon: '✅' },
  DEBUG: { value: 4, color: colors.gray, label: 'DEBUG', icon: '🔍' }
};

class Logger {
  constructor(options = {}) {
    this.level = process.env.LOG_LEVEL || 'INFO';
    this.enableColors = options.enableColors !== false;
    this.enableTimestamp = options.enableTimestamp !== false;
    this.enableFileLogging = options.enableFileLogging || false;
    this.logDir = options.logDir || path.join(__dirname, '..', 'logs');
    
    if (this.enableFileLogging) {
      this.ensureLogDirectory();
    }
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  shouldLog(level) {
    const currentLevel = levels[this.level]?.value ?? levels.INFO.value;
    const messageLevel = levels[level]?.value ?? levels.INFO.value;
    return messageLevel <= currentLevel;
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = this.enableTimestamp ? new Date().toISOString() : null;
    const levelInfo = levels[level] || levels.INFO;
    
    let formatted = '';
    
    if (this.enableColors) {
      // Colorized console output
      formatted += `${colors.dim}${timestamp}${colors.reset} `;
      formatted += `${levelInfo.icon} ${levelInfo.color}${colors.bright}${levelInfo.label}${colors.reset} `;
      formatted += `${message}`;
      
      if (Object.keys(meta).length > 0) {
        formatted += `\n${colors.gray}${JSON.stringify(meta, null, 2)}${colors.reset}`;
      }
    } else {
      // Plain text output
      formatted = `${timestamp} [${levelInfo.label}] ${message}`;
      if (Object.keys(meta).length > 0) {
        formatted += ` ${JSON.stringify(meta)}`;
      }
    }
    
    return formatted;
  }

  writeToFile(level, message, meta = {}) {
    if (!this.enableFileLogging) return;
    
    const timestamp = new Date().toISOString();
    const date = timestamp.split('T')[0];
    const logFile = path.join(this.logDir, `${date}.log`);
    
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta
    };
    
    const logLine = JSON.stringify(logEntry) + '\n';
    
    fs.appendFile(logFile, logLine, (err) => {
      if (err) console.error('Failed to write to log file:', err);
    });
  }

  log(level, message, meta = {}) {
    if (!this.shouldLog(level)) return;
    
    const formatted = this.formatMessage(level, message, meta);
    console.log(formatted);
    this.writeToFile(level, message, meta);
  }

  error(message, error = null) {
    const meta = {};
    if (error) {
      meta.error = {
        message: error.message,
        stack: error.stack,
        ...(error.statusCode && { statusCode: error.statusCode }),
        ...(error.details && { details: error.details })
      };
    }
    this.log('ERROR', message, meta);
  }

  warn(message, meta = {}) {
    this.log('WARN', message, meta);
  }

  info(message, meta = {}) {
    this.log('INFO', message, meta);
  }

  success(message, meta = {}) {
    this.log('SUCCESS', message, meta);
  }

  debug(message, meta = {}) {
    this.log('DEBUG', message, meta);
  }

  // HTTP request logging
  http(req, res, duration) {
    const statusCode = res.statusCode;
    let level = 'INFO';
    
    if (statusCode >= 500) level = 'ERROR';
    else if (statusCode >= 400) level = 'WARN';
    else if (statusCode >= 300) level = 'INFO';
    else if (statusCode >= 200) level = 'SUCCESS';
    
    const message = `${req.method} ${req.originalUrl} - ${statusCode}`;
    const meta = {
      method: req.method,
      url: req.originalUrl,
      statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    };
    
    this.log(level, message, meta);
  }
}

// Create and export singleton instance
const logger = new Logger({
  enableColors: true,
  enableTimestamp: true,
  enableFileLogging: process.env.ENABLE_FILE_LOGGING === 'true'
});

module.exports = logger;
