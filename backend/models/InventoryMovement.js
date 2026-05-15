/**
 * GProA - Modelo de Movimiento de Inventario (Enterprise - NÚCLEO)
 * backend/models/InventoryMovement.js
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;
const { STATUS, MOVEMENT_TYPES } = require('../utils/validator');

// Schema del movimiento de inventario
const inventoryMovementSchema = new Schema({
    // === MULTIEMPRESA ===
    tenantId: {
        type: Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true,
        index: true
    },
    
    // === IDENTIFICACIÓN ===
    reference: {
        type: String,
        required: [true, 'Referencia es requerida'],
        unique: true,
        uppercase: true,
        trim: true
    },
    
    // === TIPO DE MOVIMIENTO ===
    type: {
        type: String,
        required: [true, 'Tipo de movimiento es requerido'],
        enum: Object.values(MOVEMENT_TYPES),
        index: true
    },
    
    // === PRODUCTO ===
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Producto es requerido']
    },
    quantity: {
        type: Number,
        required: [true, 'Cantidad es requerida'],
        min: [1, 'Cantidad debe ser mayor a 0']
    },
    
    // === BODEGAS ===
    fromWarehouse: {
        type: Schema.Types.ObjectId,
        ref: 'Warehouse',
        default: null
    },
    toWarehouse: {
        type: Schema.Types.ObjectId,
        ref: 'Warehouse',
        default: null
    },
    
    // === PROVEEDOR ===
    supplier: {
        type: String,
        default: ''
    },
    
    // === USUARIO ===
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Usuario es requerido']
    },
    
    // === RAZÓN ===
    reason: {
        type: String,
        enum: ['compra', 'venta', 'transferencia', 'ajuste_inventario', 'devolucion_cliente', 'merma', 'otro'],
        default: 'otro'
    },
    notes: {
        type: String,
        default: ''
    },
    
    // === ESTADO NORMALIZADO ===
    status: {
        type: String,
        enum: Object.values(STATUS),
        default: STATUS.PENDING,
        index: true
    },
    
    // === SOFT DELETE ===
    isDeleted: {
        type: Boolean,
        default: false,
        index: true
    },
    deletedAt: {
        type: Date,
        default: null
    },
    deletedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    
    // === TRAZABILIDAD EXTENDIDA ===
    event: {
        who: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        what: {
            type: String,
            required: true
        },
        when: {
            type: Date,
            default: Date.now
        },
        where: {
            type: String,
            default: ''
        },
        why: {
            type: String,
            default: ''
        }
    },
    
    // === INFORMACIÓN ADICIONAL ===
    unitCost: {
        type: Number,
        default: 0
    },
    totalCost: {
        type: Number,
        default: 0
    },
    externalReference: {
        type: String,
        default: ''
    },
    batchNumber: {
        type: String,
        default: ''
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Query builder para excluir eliminados
inventoryMovementSchema.pre('find', function() {
    this.where({ isDeleted: false });
});

inventoryMovementSchema.pre('findOne', function() {
    this.where({ isDeleted: false });
});

// Virtual para estado completado
inventoryMovementSchema.virtual('isCompleted').get(function() {
    return this.status === STATUS.COMPLETED;
});

// Generar número de referencia automático
inventoryMovementSchema.statics.generateReference = async function(type, tenantId) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const startOfDay = new Date(year, month - 1, day);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59);
    
    const count = await this.countDocuments({
        tenantId,
        createdAt: { $gte: startOfDay, $lte: endOfDay }
    });
    
    const sequence = String(count + 1).padStart(4, '0');
    const typeCode = type.charAt(0).toUpperCase();
    
    return `REF-${year}${month}${day}-${typeCode}${sequence}`;
};

// Static para movimientos por producto
inventoryMovementSchema.statics.findByProduct = function(productId, tenantId) {
    return this.find({ product: productId, tenantId })
        .populate('product', 'sku name')
        .populate('user', 'firstName lastName')
        .sort({ createdAt: -1 });
};

// Static para movimientos recientes
inventoryMovementSchema.statics.findRecent = function(tenantId, limit = 10) {
    return this.find({ tenantId })
        .populate('product', 'sku name')
        .populate('user', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(limit);
};

// Método para completar movimiento
inventoryMovementSchema.methods.complete = async function() {
    this.status = STATUS.COMPLETED;
    return this.save();
};

// Método para cancelar movimiento
inventoryMovementSchema.methods.cancel = async function() {
    this.status = STATUS.CANCELLED;
    return this.save();
};

// Método para revertir movimiento
inventoryMovementSchema.methods.reverse = async function() {
    this.status = STATUS.REVERSED;
    return this.save();
};

// Índice compuesto
inventoryMovementSchema.index({ tenantId: 1, createdAt: -1 });
inventoryMovementSchema.index({ tenantId: 1, type: 1, status: 1 });
inventoryMovementSchema.index({ tenantId: 1, product: 1, createdAt: -1 });

const InventoryMovement = mongoose.model('InventoryMovement', inventoryMovementSchema);

module.exports = InventoryMovement;