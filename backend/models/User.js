/**
 * GProA - Modelo de Usuario (Enterprise)
 * backend/models/User.js
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');
const { STATUS, ROLES } = require('../utils/validator');

// Schema del usuario
const userSchema = new Schema({
    // === MULTIEMPRESA ===
    tenantId: {
        type: Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true,
        index: true
    },
    
    // === IDENTIFICACIÓN ===
    email: {
        type: String,
        required: [true, 'Email es requerido'],
        unique: true,
        lowercase: true,
        trim: true
    },
    firstName: {
        type: String,
        required: [true, 'Nombre es requerido'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Apellido es requerido'],
        trim: true
    },
    phone: { type: String, default: '' },
    
    // === ROL Y PERMISOS ===
    role: {
        type: String,
        required: [true, 'Rol es requerido'],
        enum: Object.values(ROLES),
        default: ROLES.SELLER,
        index: true
    },
    department: { type: String, default: '' },
    permissions: { type: [String], default: [] },
    
    // === SEGURIDAD ===
    password: {
        type: String,
        required: [true, 'Contraseña es requerida'],
        minlength: [6, 'Mínimo 6 caracteres']
    },
    
    // === ESTADO ===
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
    deletedAt: { type: Date, default: null },
    deletedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    
    // === SESIÓN ===
    lastLogin: { type: Date, default: null },
    avatar: { type: String, default: '' },
    address: {
        street: String,
        city: String,
        state: String,
        zip: String
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Query builder para excluir eliminados
userSchema.pre('find', function() {
    this.where({ isDeleted: false });
});

userSchema.pre('findOne', function() {
    this.where({ isDeleted: false });
});

// Virtual para nombre completo
userSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Hash de contraseña
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Comparar contraseña
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Índice compuesto
userSchema.index({ tenantId: 1, email: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);

module.exports = User;