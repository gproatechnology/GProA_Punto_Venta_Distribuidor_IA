/**
 * GProA - Alert Service
 * backend/services/alertService.js
 * 
 * Sistema de alertas operacionales
 */

const logger = require('../utils/logger');

// Tipos de alertas
const ALERT_TYPES = {
    LOW_STOCK: 'low_stock',
    SUSPICIOUS_MOVEMENT: 'suspicious_movement',
    ABNORMAL_SALE: 'abnormal_sale',
    CRITICAL_ERROR: 'critical_error',
    SYSTEM_ALERT: 'system_alert'
};

// Niveles de severidad
const SEVERITY = {
    INFO: 'info',
    WARNING: 'warning',
    CRITICAL: 'critical'
};

// Alertas en memoria (en producción usar Redis o DB)
const alerts = [];
const alertListeners = [];

// Configuración de umbrales
const config = {
    lowStockThreshold: 10,
    suspiciousMovementThreshold: 1000, // Movimientos > $1000
    abnormalSaleThreshold: 5000, // Ventas > $5000
    maxAlerts: 100
};

// Registrar alerta
const registerAlert = (type, severity, message, data = {}) => {
    const alert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        severity,
        message,
        data,
        timestamp: new Date().toISOString(),
        read: false
    };

    alerts.unshift(alert);
    
    // Limitar número de alertas
    if (alerts.length > config.maxAlerts) {
        alerts.pop();
    }

    logger.warn(`ALERTA: ${type} - ${message}`, data);

    // Notificar listeners
    alertListeners.forEach(listener => {
        try {
            listener(alert);
        } catch (e) {
            logger.error('Error en listener de alerta', e);
        }
    });

    return alert;
};

// Verificar stock bajo
const checkLowStock = async (product) => {
    if (product.stock <= config.lowStockThreshold) {
        return registerAlert(
            ALERT_TYPES.LOW_STOCK,
            product.stock <= 5 ? SEVERITY.CRITICAL : SEVERITY.WARNING,
            `Stock bajo: ${product.name}`,
            {
                productId: product._id,
                productName: product.name,
                currentStock: product.stock,
                minStock: product.minStock
            }
        );
    }
    return null;
};

// Verificar movimiento sospechoso
const checkSuspiciousMovement = (movement) => {
    const value = movement.quantity * (movement.unitPrice || 0);
    
    if (value > config.suspiciousMovementThreshold) {
        return registerAlert(
            ALERT_TYPES.SUSPICIOUS_MOVEMENT,
            SEVERITY.WARNING,
            `Movimiento sospechoso detectado`,
            {
                movementId: movement._id,
                type: movement.type,
                quantity: movement.quantity,
                value: value
            }
        );
    }
    return null;
};

// Verificar venta anormal
const checkAbnormalSale = (sale) => {
    const total = sale.total || 0;
    
    if (total > config.abnormalSaleThreshold) {
        return registerAlert(
            ALERT_TYPES.ABNORMAL_SALE,
            SEVERITY.WARNING,
            `Venta anormal detectada: ${total}`,
            {
                saleId: sale._id,
                total: total,
                items: sale.items?.length
            }
        );
    }
    return null;
};

// Obtener alertas
const getAlerts = (filters = {}) => {
    let result = [...alerts];
    
    if (filters.type) {
        result = result.filter(a => a.type === filters.type);
    }
    
    if (filters.severity) {
        result = result.filter(a => a.severity === filters.severity);
    }
    
    if (filters.unread) {
        result = result.filter(a => !a.read);
    }
    
    if (filters.limit) {
        result = result.slice(0, filters.limit);
    }
    
    return result;
};

// Marcar alerta como leída
const markAsRead = (alertId) => {
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
        alert.read = true;
        return true;
    }
    return false;
};

// Marcar todas como leídas
const markAllAsRead = () => {
    alerts.forEach(a => a.read = true);
    return alerts.length;
};

// Obtener conteo de alertas no leídas
const getUnreadCount = () => {
    return alerts.filter(a => !a.read).length;
};

// Agregar listener
const addListener = (callback) => {
    alertListeners.push(callback);
    return () => {
        const index = alertListeners.indexOf(callback);
        if (index > -1) {
            alertListeners.splice(index, 1);
        }
    };
};

// Configurar umbrales
const configure = (newConfig) => {
    Object.assign(config, newConfig);
    logger.info('Configuración de alertas actualizada', config);
};

// Obtener configuración
const getConfig = () => ({ ...config });

// Limpiar alertas
const clearAlerts = () => {
    const count = alerts.length;
    alerts.length = 0;
    return count;
};

module.exports = {
    ALERT_TYPES,
    SEVERITY,
    registerAlert,
    checkLowStock,
    checkSuspiciousMovement,
    checkAbnormalSale,
    getAlerts,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    addListener,
    configure,
    getConfig,
    clearAlerts
};