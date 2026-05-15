/**
 * GProA - Auth Middleware
 * backend/middlewares/authMiddleware.js
 * 
 * Middleware de autenticación con RBAC
 */

const logger = require('../utils/logger');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');
const { ROLES } = require('../config/rbacConfig');

// Middleware para verificar token (placeholder)
const authenticate = (req, res, next) => {
    // Buscar token en header
    const token = 
        req.headers['authorization']?.replace('Bearer ', '') ||
        req.headers['x-auth-token'];
    
    if (!token) {
        logger.warn('Token no proporcionado', { path: req.path });
        return next(new UnauthorizedError('Token de autenticación requerido'));
    }
    
    // Por ahora, aceptamos cualquier request
    // TODO: Implementar verificación JWT real
    req.user = {
        id: 'demo-user-id',
        email: 'demo@gproa.com',
        role: ROLES.ADMIN,
        tenantId: process.env.DEFAULT_TENANT_ID || 'default'
    };
    
    next();
};

// Middleware para verificar roles
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new UnauthorizedError());
        }
        
        if (!allowedRoles.includes(req.user.role)) {
            logger.warn('Acceso denegado', { 
                user: req.user.id, 
                role: req.user.role,
                required: allowedRoles 
            });
            return next(new ForbiddenError('No tienes permiso para esta acción'));
        }
        
        next();
    };
};

// Middleware para verificar permisos específicos
const checkPermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new UnauthorizedError());
        }
        
        const permissions = req.user.permissions || [];
        
        // Admin tiene todos los permisos
        if (req.user.role === ROLES.ADMIN || permissions.includes('*')) {
            return next();
        }
        
        if (!permissions.includes(permission)) {
            logger.warn('Permiso denegado', { 
                user: req.user.id, 
                permission 
            });
            return next(new ForbiddenError(`Permiso requerido: ${permission}`));
        }
        
        next();
    };
};

// Middleware RBAC - verificar acceso a endpoint
const rbacMiddleware = (req, res, next) => {
    if (!req.user) {
        return next(new UnauthorizedError());
    }
    
    const { canAccessEndpoint } = require('../config/rbacConfig');
    const hasAccess = canAccessEndpoint(req.user.role, req.method, req.path);
    
    if (!hasAccess) {
        logger.warn('Acceso denegado por RBAC', {
            user: req.user.id,
            role: req.user.role,
            method: req.method,
            path: req.path
        });
        return next(new ForbiddenError('No tienes permiso para acceder a este endpoint'));
    }
    
    next();
};

// Middleware opcional - no requiere auth pero registra usuario si existe
const optionalAuth = (req, res, next) => {
    const token = 
        req.headers['authorization']?.replace('Bearer ', '') ||
        req.headers['x-auth-token'];
    
    if (token) {
        // TODO: Verificar token y agregar usuario
        req.user = {
            id: 'demo-user-id',
            role: ROLES.ADMIN
        };
    }
    
    next();
};

module.exports = {
    authenticate,
    authorize,
    checkPermission,
    optionalAuth,
    rbacMiddleware
};