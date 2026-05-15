/**
 * GProA - Modelo de Venta (Enterprise)
 * backend/models/Sale.js
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;
const { STATUS } = require('../utils/validator');

// Schema del item de venta
const saleItemSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    sku: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Cantidad debe ser mayor a 0']
    },
    unitPrice: {
        type: Number,
        required: true,
        min: 0
    },
    discount: {
        type: Number,
        default: 0,
        min: 0
    },
    subtotal: {
        type: Number,
        required: true,
        min: 0
    }
});

// Schema de la venta
const saleSchema = new Schema({
    // === MULTIEMPRESA ===
    tenantId: {
        type: Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true,
        index: true
    },
    
    // === IDENTIFICACIÓN ===
    ticketNumber: {
        type: String,
        required: [true, 'Número de ticket es requerido'],
        unique: true,
        uppercase: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
        index: true
    },
    
    // === CLIENTE ===
    customer: {
        type: String,
        default: ''
    },
    customerId: {
        type: Schema.Types.ObjectId,
        ref: 'Customer',
        default: null
    },
    
    // === ITEMS ===
    items: {
        type: [saleItemSchema],
        validate: {
            validator: function(v) {
                return v && v.length > 0;
            },
            message: 'La venta debe tener al menos un producto'
        }
    },
    
    // === TOTALES ===
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    tax: {
        type: Number,
        default: 0,
        min: 0
    },
    discount: {
        type: Number,
        default: 0,
        min: 0
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },
    
    // === PAGO ===
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'transfer', 'credit'],
        default: 'cash'
    },
    paymentDetails: {
        amountPaid: Number,
        change: Number,
        reference: String
    },
    
    // === VENDEDOR ===
    seller: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // === ESTADO NORMALIZADO ===
    status: {
        type: String,
        enum: Object.values(STATUS),
        default: STATUS.COMPLETED,
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
    
    // === DESCUENTO ===
    discountType: {
        type: String,
        enum: ['none', 'percentage', 'fixed'],
        default: 'none'
    },
    discountValue: {
        type: Number,
        default: 0
    },
    
    // === TRAZABILIDAD ===
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Query builder para excluir eliminados
saleSchema.pre('find', function() {
    this.where({ isDeleted: false });
});

saleSchema.pre('findOne', function() {
    this.where({ isDeleted: false });
});

// Virtual para cantidad de items
saleSchema.virtual('itemCount').get(function() {
    return this.items ? this.items.length : 0;
});

// Generar número de ticket automático
saleSchema.statics.generateTicketNumber = async function(tenantId) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const startOfDay = new Date(year, month - 1, day);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59);
    
    const count = await this.countDocuments({
        tenantId,
        date: { $gte: startOfDay, $lte: endOfDay }
    });
    
    const sequence = String(count + 1).padStart(5, '0');
    
    return `TKT-${year}${month}${day}-${sequence}`;
};

// Static para ventas del día
saleSchema.statics.findToday = function(tenantId) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    
    return this.find({
        tenantId,
        date: { $gte: startOfDay, $lte: endOfDay },
        status: STATUS.COMPLETED
    });
};

// Static para resumen de ventas
saleSchema.statics.getSalesSummary = async function(tenantId, startDate, endDate) {
    const match = {
        tenantId,
        status: STATUS.COMPLETED,
        date: { $gte: startDate, $lte: endDate }
    };
    
    const result = await this.aggregate([
        { $match: match },
        {
            $group: {
                _id: null,
                totalSales: { $sum: '$total' },
                totalTransactions: { $sum: 1 },
                totalItems: { $sum: { $size: '$items' } },
                averageSale: { $avg: '$total' }
            }
        }
    ]);
    
    return result[0] || { totalSales: 0, totalTransactions: 0, totalItems: 0, averageSale: 0 };
};

// Método para cancelar/anular venta
saleSchema.methods.cancel = async function(userId) {
    this.status = STATUS.CANCELLED;
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.deletedBy = userId;
    return this.save();
};

// Índice compuesto
saleSchema.index({ tenantId: 1, date: -1 });
saleSchema.index({ tenantId: 1, seller: 1, date: -1 });
saleSchema.index({ tenantId: 1, status: 1, date: -1 });

const Sale = mongoose.model('Sale', saleSchema);

module.exports = Sale;