/**
 * GProA - Tenant Middleware
 * backend/middlewares/tenantMiddleware.js
 */

const logger = require('../utils/logger');
const { TenantError } = require('../utils/errors');

// Middleware para extraer tenant del request
const extractTenant = (req, res, next) => {
    // Buscar tenant en: header, query, body, o default
    const tenantId = 
        req.headers['x-tenant-id'] ||
        req.query.tenantId ||
        req.body.tenantId ||
        process.env.DEFAULT_TENANT_ID;
    
    if (!tenantId) {
        logger.warn('Tenant no proporcionado', { 
            path: req.path,
            ip: req.ip
        });
    }
    
    req.tenantId = tenantId;
    next();
};

// Middleware para validar tenant
const validateTenant = (req, res, next) => {
    if (!req.tenantId) {
        return next(new TenantError('Tenant ID es requerido'));
    }
    
    // Aquí se validaría contra la base de datos
    // Por ahora, aceptamos cualquier tenantId válido
    next();
};

// Middleware para agregar tenant a queries
const addTenantToQuery = (req, res, next) => {
    if (req.tenantId && req.query) {
        req.query.tenantId = req.tenantId;
    }
    next();
};

// Middleware para agregar tenant al body
const addTenantToBody = (req, res, next) => {
    if (req.tenantId && req.body) {
        req.body.tenantId = req.tenantId;
    }
    next();
};

// Middleware completo de tenant
const tenantMiddleware = [
    extractTenant,
    validateTenant,
    addTenantToQuery,
    addTenantToBody
];

module.exports = {
    extractTenant,
    validateTenant,
    addTenantToQuery,
    addTenantToBody,
    tenantMiddleware
};