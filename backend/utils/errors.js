/**
 * GProA - Errores Personalizados
 * backend/utils/errors.js
 */

class AppError extends Error {
    constructor(message, statusCode, code = 'ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message, errors = []) {
        super(message, 400, 'VALIDATION_ERROR');
        this.errors = errors;
    }
}

class NotFoundError extends AppError {
    constructor(resource, id) {
        super(`${resource} con ID ${id} no encontrado`, 404, 'NOT_FOUND');
        this.resource = resource;
        this.id = id;
    }
}

class UnauthorizedError extends AppError {
    constructor(message = 'No autorizado') {
        super(message, 401, 'UNAUTHORIZED');
    }
}

class ForbiddenError extends AppError {
    constructor(message = 'Acceso denegado') {
        super(message, 403, 'FORBIDDEN');
    }
}

class ConflictError extends AppError {
    constructor(message) {
        super(message, 409, 'CONFLICT');
    }
}

class InsufficientStockError extends AppError {
    constructor(productName, available, requested) {
        super(
            `Stock insuficiente para ${productName}. Disponible: ${available}, Solicitado: ${requested}`,
            400,
            'INSUFFICIENT_STOCK'
        );
        this.available = available;
        this.requested = requested;
    }
}

class TenantError extends AppError {
    constructor(message = 'Tenant no válido') {
        super(message, 403, 'TENANT_ERROR');
    }
}

class TransactionError extends AppError {
    constructor(message = 'Error en transacción') {
        super(message, 500, 'TRANSACTION_ERROR');
    }
}

// Manejador de errores para Express
const errorHandler = (err, req, res, next) => {
    const logger = require('./logger');
    
    // Errores operacionales conocidos
    if (err.isOperational) {
        logger.warn(err.message, { 
            statusCode: err.statusCode,
            path: req.path 
        });
        
        return res.status(err.statusCode).json({
            status: 'error',
            code: err.code,
            message: err.message,
            ...(err.errors && { errors: err.errors })
        });
    }
    
    // Errores unknown - no exponer en producción
    logger.error(err.message, {
        path: req.path,
        method: req.method,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
    
    const message = process.env.NODE_ENV === 'development' 
        ? err.message 
        : 'Error interno del servidor';
    
    res.status(500).json({
        status: 'error',
        code: 'INTERNAL_ERROR',
        message
    });
};

// Wrap async para rutas
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    AppError,
    ValidationError,
    NotFoundError,
    UnauthorizedError,
    ForbiddenError,
    ConflictError,
    InsufficientStockError,
    TenantError,
    TransactionError,
    errorHandler,
    asyncHandler
};