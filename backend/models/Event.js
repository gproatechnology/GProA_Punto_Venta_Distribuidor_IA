/**
 * GProA - Modelo de Eventos/Auditoría (Enterprise)
 * backend/models/Event.js
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

// Schema del evento
const eventSchema = new Schema({
    // === MULTIEMPRESA ===
    tenantId: {
        type: Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true,
        index: true
    },
    
    // === ENTIDAD AFECTADA ===
    entity: {
        type: String,
        required: true,
        enum: ['product', 'sale', 'movement', 'user', 'warehouse', 'report', 'system'],
        index: true
    },
    entityId: {
        type: Schema.Types.ObjectId,
        required: true,
        index: true
    },
    
    // === ACCIÓN ===
    action: {
        type: String,
        required: true,
        enum: ['create', 'update', 'delete', 'login', 'logout', 'access', 'export', 'import'],
        index: true
    },
    
    // === USUARIO ===
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // === TIMESTAMP ===
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    
    // === IP ===
    ip: { type: String, default: '' },
    
    // === DETALLES ===
    details: { type: Schema.Types.Mixed, default: {} },
    previousState: { type: Schema.Types.Mixed, default: null },
    newState: { type: Schema.Types.Mixed, default: null },
    description: { type: String, default: '' },
    metadata: {
        userAgent: String,
        endpoint: String,
        method: String,
        statusCode: Number
    }
}, {
    timestamps: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Static para registrar evento
eventSchema.statics.log = async function(data) {
    const event = new this(data);
    return event.save();
};

// Static para eventos por entidad
eventSchema.statics.findByEntity = function(entity, entityId, tenantId) {
    return this.find({ entity, entityId, tenantId })
        .populate('user', 'firstName lastName')
        .sort({ timestamp: -1 });
};

// Static para eventos recientes
eventSchema.statics.findRecent = function(tenantId, limit = 50) {
    return this.find({ tenantId })
        .populate('user', 'firstName lastName')
        .sort({ timestamp: -1 })
        .limit(limit);
};

// Índices
eventSchema.index({ tenantId: 1, entity: 1, entityId: 1, timestamp: -1 });
eventSchema.index({ tenantId: 1, user: 1, timestamp: -1 });
eventSchema.index({ tenantId: 1, timestamp: -1 });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;