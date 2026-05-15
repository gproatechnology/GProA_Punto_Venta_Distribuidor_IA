/**
 * GProA - Modelo de Bodega (Enterprise)
 * backend/models/Warehouse.js
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;
const { STATUS } = require('../utils/validator');

// Schema de ubicación dentro de bodega
const locationSchema = new Schema({
    zone: { type: String, required: true },
    aisle: { type: String, required: true },
    shelf: { type: String, required: true },
    position: { type: String, default: '' },
    capacity: { type: Number, default: 100 },
    current: { type: Number, default: 0 }
});

// Schema de la bodega
const warehouseSchema = new Schema({
    // === MULTIEMPRESA ===
    tenantId: {
        type: Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true,
        index: true
    },
    
    // === IDENTIFICACIÓN ===
    name: {
        type: String,
        required: [true, 'Nombre es requerido'],
        unique: true,
        uppercase: true,
        trim: true
    },
    location: { type: String, default: '' },
    
    // === CAPACIDAD ===
    capacity: {
        type: Number,
        required: [true, 'Capacidad es requerida'],
        min: [0, 'Capacidad no puede ser negativa']
    },
    used: {
        type: Number,
        default: 0,
        min: [0, 'Usado no puede ser negativo']
    },
    
    // === CONDICIONES ===
    temperature: { type: Number, default: null },
    humidity: { type: Number, default: null },
    
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
    deletedAt: { type: Date, default: null },
    deletedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    
    // === GESTIÓN ===
    manager: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    locations: { type: [locationSchema], default: [] },
    description: { type: String, default: '' },
    contact: {
        phone: String,
        email: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Query builder para excluir eliminados
warehouseSchema.pre('find', function() {
    this.where({ isDeleted: false });
});

// Virtual para utilización
warehouseSchema.virtual('utilization').get(function() {
    if (this.capacity === 0) return 0;
    return Math.round((this.used / this.capacity) * 100);
});

// Virtual para capacidad disponible
warehouseSchema.virtual('available').get(function() {
    return this.capacity - this.used;
});

// Índice compuesto
warehouseSchema.index({ tenantId: 1, name: 1 }, { unique: true });

const Warehouse = mongoose.model('Warehouse', warehouseSchema);

module.exports = Warehouse;