/**
 * GProA - Validador
 * backend/utils/validator.js
 */

const validator = require('validator');

// Estados permitidos
const STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    REVERSED: 'REVERSED'
};

const PRODUCT_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    DISCONTINUED: 'discontinued'
};

const MOVEMENT_TYPES = {
    ENTRADA: 'entrada',
    SALIDA: 'salida',
    TRANSFERENCIA: 'transferencia',
    AJUSTE: 'ajuste',
    DEVOLUCION: 'devolucion'
};

const ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    SELLER: 'seller',
    WAREHOUSE_STAFF: 'warehouse_staff'
};

// Validadores específicos
const validators = {
    // Validar SKU
    isValidSKU: (sku) => {
        if (!sku || typeof sku !== 'string') return false;
        return /^[A-Z]{3}-[\d]{3,6}$/.test(sku.toUpperCase());
    },
    
    // Validar email
    isValidEmail: (email) => {
        return validator.isEmail(email);
    },
    
    // Validar teléfono
    isValidPhone: (phone) => {
        if (!phone) return true; // Opcional
        return validator.isMobilePhone(phone, 'any');
    },
    
    // Validar estado
    isValidStatus: (status) => {
        return Object.values(STATUS).includes(status);
    },
    
    // Validar tipo de movimiento
    isValidMovementType: (type) => {
        return Object.values(MOVEMENT_TYPES).includes(type);
    },
    
    // Validar rol
    isValidRole: (role) => {
        return Object.values(ROLES).includes(role);
    },
    
    // Validar cantidad
    isValidQuantity: (quantity) => {
        return validator.isInt(String(quantity), { min: 1 });
    },
    
    // Validar precio
    isValidPrice: (price) => {
        return validator.isFloat(String(price), { min: 0 });
    },
    
    // Validar ObjectId
    isValidObjectId: (id) => {
        if (!id) return false;
        return validator.isMongoId(String(id));
    }
};

// Sanitizadores
const sanitizers = {
    // Sanitizar SKU
    sanitizeSKU: (sku) => {
        if (!sku) return '';
        return String(sku).toUpperCase().trim();
    },
    
    // Sanitizar email
    sanitizeEmail: (email) => {
        if (!email) return '';
        return validator.normalizeEmail(String(email).toLowerCase().trim());
    },
    
    // Sanitizar texto
    sanitizeText: (text) => {
        if (!text) return '';
        return String(text).trim();
    },
    
    // Sanitizar número
    sanitizeNumber: (num) => {
        return parseFloat(num) || 0;
    }
};

// Middleware de validación
const validate = (schema) => {
    return (req, res, next) => {
        const errors = [];
        
        for (const [field, rules] of Object.entries(schema)) {
            const value = req.body[field];
            
            // Required
            if (rules.required && !value) {
                errors.push({ field, message: `${field} es requerido` });
                continue;
            }
            
            if (!value) continue; // Opcional y vacío
            
            // Type checks
            if (rules.type === 'email' && !validators.isValidEmail(value)) {
                errors.push({ field, message: `${field} debe ser un email válido` });
            }
            
            if (rules.type === 'sku' && !validators.isValidSKU(value)) {
                errors.push({ field, message: `${field} debe tener formato SKU (XXX-000)` });
            }
            
            if (rules.type === 'quantity' && !validators.isValidQuantity(value)) {
                errors.push({ field, message: `${field} debe ser mayor a 0` });
            }
            
            if (rules.type === 'price' && !validators.isValidPrice(value)) {
                errors.push({ field, message: `${field} debe ser un precio válido` });
            }
            
            if (rules.type === 'objectId' && !validators.isValidObjectId(value)) {
                errors.push({ field, message: `${field} debe ser un ID válido` });
            }
            
            // Enum
            if (rules.enum && !rules.enum.includes(value)) {
                errors.push({ field, message: `${field} debe ser uno de: ${rules.enum.join(', ')}` });
            }
            
            // Min/Max
            if (rules.min !== undefined && value < rules.min) {
                errors.push({ field, message: `${field} debe ser mayor a ${rules.min}` });
            }
            
            if (rules.max !== undefined && value > rules.max) {
                errors.push({ field, message: `${field} debe ser menor a ${rules.max}` });
            }
        }
        
        if (errors.length > 0) {
            return res.status(400).json({
                status: 'error',
                code: 'VALIDATION_ERROR',
                errors
            });
        }
        
        next();
    };
};

module.exports = {
    STATUS,
    PRODUCT_STATUS,
    MOVEMENT_TYPES,
    ROLES,
    validators,
    sanitizers,
    validate
};