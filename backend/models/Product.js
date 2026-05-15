/**
 * GProA - Modelo de Producto (Enterprise)
 * backend/models/Product.js
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;
const { STATUS, PRODUCT_STATUS } = require('../utils/validator');

// Schema del producto
const productSchema = new Schema({
    // === MULTIEMPRESA ===
    tenantId: {
        type: Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true,
        index: true
    },
    
    // === IDENTIFICACIÓN ===
    sku: {
        type: String,
        required: [true, 'SKU es requerido'],
        unique: true,
        uppercase: true,
        trim: true,
        index: true
    },
    name: {
        type: String,
        required: [true, 'Nombre es requerido'],
        trim: true,
        index: true
    },
    category: {
        type: String,
        required: [true, 'Categoría es requerida'],
        enum: ['Lácteos', 'Alimentos', 'Bebidas', 'Snacks', 'Congelados', 'Papeleria', 'Limpieza', 'Otros'],
        index: true
    },
    description: {
        type: String,
        default: ''
    },
    
    // === PRECIOS ===
    price: {
        type: Number,
        required: [true, 'Precio es requerido'],
        min: [0, 'Precio no puede ser negativo']
    },
    cost: {
        type: Number,
        required: [true, 'Costo es requerido'],
        min: [0, 'Costo no puede ser negativo']
    },
    
    // === INVENTARIO ===
    stock: {
        type: Number,
        default: 0,
        min: [0, 'Stock no puede ser negativo']
    },
    minStock: {
        type: Number,
        required: [true, 'Stock mínimo es requerido'],
        min: [0, 'Stock mínimo no puede ser negativo']
    },
    maxStock: {
        type: Number,
        default: null
    },
    
    // === PROVEEDOR ===
    supplier: {
        type: String,
        default: ''
    },
    barcode: {
        type: String,
        unique: true,
        sparse: true,
        default: null
    },
    
    // === ESTADO NORMALIZADO ===
    status: {
        type: String,
        enum: Object.values(PRODUCT_STATUS),
        default: PRODUCT_STATUS.ACTIVE,
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
    
    // === TRAZABILIDAD ===
    location: {
        type: String,
        default: ''
    },
    unit: {
        type: String,
        default: 'pieza'
    },
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
productSchema.pre('find', function() {
    this.where({ isDeleted: false });
});

productSchema.pre('findOne', function() {
    this.where({ isDeleted: false });
});

// Virtual para estado de stock
productSchema.virtual('stockStatus').get(function() {
    if (this.stock === 0) return 'out';
    if (this.stock <= this.minStock) return 'critical';
    if (this.stock <= this.minStock * 1.5) return 'low';
    return 'normal';
});

// Virtual para valor en inventario
productSchema.virtual('inventoryValue').get(function() {
    return this.stock * this.cost;
});

// Índice para búsqueda
productSchema.index({ name: 'text', sku: 'text', category: 'text' });

// Índice compuesto tenant + sku único
productSchema.index({ tenantId: 1, sku: 1 }, { unique: true });

// Método para soft delete
productSchema.methods.softDelete = async function(userId) {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.deletedBy = userId;
    this.status = PRODUCT_STATUS.INACTIVE;
    return this.save();
};

// Método para restaurar
productSchema.methods.restore = async function(userId) {
    this.isDeleted = false;
    this.deletedAt = null;
    this.deletedBy = null;
    this.status = PRODUCT_STATUS.ACTIVE;
    return this.save();
};

// Static para obtener productos con stock bajo
productSchema.statics.findLowStock = function(tenantId) {
    return this.find({
        tenantId,
        $expr: { $lte: ['$stock', '$minStock'] },
        status: PRODUCT_STATUS.ACTIVE,
        isDeleted: false
    });
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;