/**
 * GProA - Logger Utilitario
 * backend/utils/logger.js
 * 
 * Logger estructurado para producción
 */

const NODE_ENV = process.env.NODE_ENV || 'development';

const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m'
};

const levels = {
    error: { color: colors.red, prefix: '❌' },
    warn: { color: colors.yellow, prefix: '⚠️' },
    info: { color: colors.green, prefix: 'ℹ️' },
    debug: { color: colors.blue, prefix: '🔍' },
    http: { color: colors.cyan, prefix: '🌐' }
};

const formatMessage = (level, message, meta = {}) => {
    const timestamp = new Date().toISOString();
    const levelInfo = levels[level];
    
    if (NODE_ENV === 'production') {
        // JSON estructurado para producción
        return JSON.stringify({
            timestamp,
            level: level.toUpperCase(),
            message,
            ...meta
        });
    }
    
    // Formato legible para desarrollo
    const metaString = Object.keys(meta).length > 0 
        ? ` ${JSON.stringify(meta)}` 
        : '';
    
    return `${levelInfo.color}${levelInfo.prefix} [${timestamp}] ${message}${metaString}${colors.reset}`;
};

const logger = {
    error: (message, meta) => {
        console.error(formatMessage('error', message, meta));
    },
    
    warn: (message, meta) => {
        console.warn(formatMessage('warn', message, meta));
    },
    
    info: (message, meta) => {
        console.info(formatMessage('info', message, meta));
    },
    
    debug: (message, meta) => {
        if (NODE_ENV === 'development') {
            console.log(formatMessage('debug', message, meta));
        }
    },
    
    http: (message, meta) => {
        console.log(formatMessage('http', message, meta));
    },
    
    // Logger de auditoría
    audit: (action, entity, entityId, userId, details) => {
        console.log(formatMessage('info', `[AUDIT] ${action} ${entity}`, {
            entityId,
            userId,
            ...details
        }));
    },
    
    // Logger de inventario
    inventory: (action, productId, quantity, details) => {
        console.log(formatMessage('info', `[INVENTORY] ${action}`, {
            productId,
            quantity,
            ...details
        }));
    }
};

module.exports = logger;