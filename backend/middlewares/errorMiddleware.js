/**
 * GProA - Error Middleware
 * backend/middlewares/errorMiddleware.js
 */

const logger = require('../utils/logger');
const { errorHandler } = require('../utils/errors');

// Middleware de manejo de errores
const handleError = (err, req, res, next) => {
    errorHandler(err, req, res, next);
};

// Middleware para rutas no encontradas
const notFound = (req, res) => {
    logger.warn('Ruta no encontrada', { path: req.path, method: req.method });
    
    res.status(404).json({
        status: 'error',
        code: 'NOT_FOUND',
        message: `Ruta ${req.path} no encontrada`,
        method: req.method
    });
};

// Middleware para logging de requests
const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        const log = {
            method: req.method,
            path: req.path,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip
        };
        
        if (res.statusCode >= 500) {
            logger.error('Request error', log);
        } else if (res.statusCode >= 400) {
            logger.warn('Request warning', log);
        } else {
            logger.http('Request', log);
        }
    });
    
    next();
};

// Middleware para sanitizar inputs
const sanitizeInput = (req, res, next) => {
    // Basic sanitization - trim strings
    if (req.body && typeof req.body === 'object') {
        for (const [key, value] of Object.entries(req.body)) {
            if (typeof value === 'string') {
                req.body[key] = value.trim();
            }
        }
    }
    next();
};

// Middleware para CORS
const corsMiddleware = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Tenant-ID');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
};

// Rate limiting simple (en memoria)
const rateLimit = new Map();

const rateLimitMiddleware = (options = {}) => {
    const { windowMs = 60000, maxRequests = 100 } = options;
    
    return (req, res, next) => {
        const key = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        
        if (!rateLimit.has(key)) {
            rateLimit.set(key, { count: 1, reset: now + windowMs });
            return next();
        }
        
        const record = rateLimit.get(key);
        
        if (now > record.reset) {
            record.count = 1;
            record.reset = now + windowMs;
            return next();
        }
        
        if (record.count >= maxRequests) {
            logger.warn('Rate limit excedido', { ip: key });
            return res.status(429).json({
                status: 'error',
                code: 'RATE_LIMIT',
                message: 'Demasiadas solicitudes. Intenta más tarde.'
            });
        }
        
        record.count++;
        next();
    };
};

// Cleanup de rate limit cada 5 minutos
setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimit.entries()) {
        if (now > record.reset) {
            rateLimit.delete(key);
        }
    }
}, 300000);

module.exports = {
    handleError,
    notFound,
    requestLogger,
    sanitizeInput,
    corsMiddleware,
    rateLimitMiddleware
};