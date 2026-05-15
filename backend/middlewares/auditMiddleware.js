/**
 * GProA - Audit Middleware
 * backend/middlewares/auditMiddleware.js
 */

const logger = require('../utils/logger');

// Middleware para logging automático de requests
const auditMiddleware = (req, res, next) => {
    const start = Date.now();
    const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Agregar requestId al request
    req.requestId = requestId;
    req.startTime = start;
    
    // Log de request entrante
    logger.http('Request entrante', {
        requestId,
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.headers['user-agent']
    });
    
    // Log de response al finalizar
    res.on('finish', () => {
        const duration = Date.now() - start;
        
        logger.http('Request completado', {
            requestId,
            method: req.method,
            path: req.path,
            status: res.statusCode,
            duration: `${duration}ms`
        });
    });
    
    next();
};

// Middleware para auditar acceso a datos sensibles
const sensitiveAccess = (entity) => {
    return (req, res, next) => {
        logger.audit('ACCESS', entity, req.params.id, req.user?.id, {
            method: req.method,
            path: req.path,
            ip: req.ip
        });
        next();
    };
};

// Middleware para auditar modificaciones
const auditWrite = (entity) => {
    return (req, res, next) => {
        // Guardar estado original del body para logging
        req.auditData = {
            entity,
            action: req.method,
            userId: req.user?.id,
            timestamp: new Date(),
            ip: req.ip
        };
        next();
    };
};

module.exports = {
    auditMiddleware,
    sensitiveAccess,
    auditWrite
};