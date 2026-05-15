/**
 * GProA - Alert Routes
 * backend/routes/alertRoutes.js
 */

const express = require('express');
const router = express.Router();
const alertService = require('../services/alertService');

// GET /api/alerts - Listar alertas
router.get('/', async (req, res, next) => {
    try {
        const { type, severity, unread, limit } = req.query;
        
        const filters = {
            type,
            severity,
            unread: unread === 'true',
            limit: limit ? parseInt(limit) : 50
        };
        
        const alerts = alertService.getAlerts(filters);
        const unreadCount = alertService.getUnreadCount();
        
        res.json({
            success: true,
            data: alerts,
            total: alerts.length,
            unreadCount
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/alerts/:id - Obtener alerta específica
router.get('/:id', async (req, res, next) => {
    try {
        const alerts = alertService.getAlerts({ limit: 1000 });
        const alert = alerts.find(a => a.id === req.params.id);
        
        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Alerta no encontrada'
            });
        }
        
        res.json({
            success: true,
            data: alert
        });
    } catch (error) {
        next(error);
    }
});

// PUT /api/alerts/:id/read - Marcar como leída
router.put('/:id/read', async (req, res, next) => {
    try {
        const success = alertService.markAsRead(req.params.id);
        
        res.json({
            success,
            message: success ? 'Alerta marcada como leída' : 'Alerta no encontrada'
        });
    } catch (error) {
        next(error);
    }
});

// PUT /api/alerts/read-all - Marcar todas como leídas
router.put('/read-all', async (req, res, next) => {
    try {
        const count = alertService.markAllAsRead();
        
        res.json({
            success: true,
            message: `${count} alertas marcadas como leídas`
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/alerts/count - Contador de alertas
router.get('/count', async (req, res, next) => {
    try {
        const count = alertService.getUnreadCount();
        const alerts = alertService.getAlerts({ limit: 1000 });
        
        res.json({
            success: true,
            unreadCount: count,
            bySeverity: {
                critical: alerts.filter(a => a.severity === 'critical').length,
                warning: alerts.filter(a => a.severity === 'warning').length,
                info: alerts.filter(a => a.severity === 'info').length
            },
            byType: {
                lowStock: alerts.filter(a => a.type === 'low_stock').length,
                suspiciousMovement: alerts.filter(a => a.type === 'suspicious_movement').length,
                abnormalSale: alerts.filter(a => a.type === 'abnormal_sale').length,
                criticalError: alerts.filter(a => a.type === 'critical_error').length
            }
        });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/alerts - Limpiar alertas
router.delete('/', async (req, res, next) => {
    try {
        const count = alertService.clearAlerts();
        
        res.json({
            success: true,
            message: `${count} alertas eliminadas`
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;