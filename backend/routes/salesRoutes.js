/**
 * GProA - Rutas de Ventas
 * backend/routes/salesRoutes.js
 * 
 * Rutas delgadas - toda lógica en services/
 */

const express = require('express');
const router = express.Router();
const salesService = require('../services/salesService');
const { asyncHandler } = require('../utils/errors');

// GET - Obtener todas las ventas
router.get('/', asyncHandler(async (req, res) => {
    const tenantId = req.tenantId || req.headers['x-tenant-id'];
    const { startDate, endDate, seller, status } = req.query;
    
    const filters = {};
    if (startDate || endDate) {
        filters.date = {};
        if (startDate) filters.date.$gte = new Date(startDate);
        if (endDate) filters.date.$lte = new Date(endDate);
    }
    if (seller) filters.seller = seller;
    if (status) filters.status = status;
    
    const sales = await salesService.getSales(tenantId, filters);
    
    res.json({
        status: 'success',
        message: 'Ventas obtenidas',
        count: sales.length,
        data: sales
    });
}));

// GET - Obtener venta por ID
router.get('/:id', asyncHandler(async (req, res) => {
    const tenantId = req.tenantId || req.headers['x-tenant-id'];
    const sale = await salesService.getSaleById(tenantId, req.params.id);
    
    res.json({
        status: 'success',
        message: `Venta ${req.params.id} obtenida`,
        data: sale
    });
}));

// POST - Crear nueva venta
router.post('/', asyncHandler(async (req, res) => {
    const tenantId = req.tenantId || req.headers['x-tenant-id'];
    const userId = req.user?.id || req.body.userId;
    
    const sale = await salesService.createSale(tenantId, req.body, userId);
    
    res.status(201).json({
        status: 'success',
        message: 'Venta registrada exitosamente',
        data: sale
    });
}));

// PUT - Actualizar venta
router.put('/:id', asyncHandler(async (req, res) => {
    // Por ahora no permitimos actualización de ventas completadas
    res.status(400).json({
        status: 'error',
        message: 'No se pueden modificar ventas completadas'
    });
}));

// DELETE - Cancelar venta
router.delete('/:id', asyncHandler(async (req, res) => {
    const tenantId = req.tenantId || req.headers['x-tenant-id'];
    const userId = req.user?.id || req.body.userId;
    
    const sale = await salesService.cancelSale(tenantId, req.params.id, userId);
    
    res.json({
        status: 'success',
        message: `Venta ${req.params.id} cancelada`,
        data: sale
    });
}));

// GET - Resumen de ventas
router.get('/report/summary', asyncHandler(async (req, res) => {
    const tenantId = req.tenantId || req.headers['x-tenant-id'];
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);
    
    const summary = await salesService.getSalesSummary(tenantId, start, end);
    
    res.json({
        status: 'success',
        data: summary
    });
}));

// GET - Ventas por período
router.get('/report/period', asyncHandler(async (req, res) => {
    const tenantId = req.tenantId || req.headers['x-tenant-id'];
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
        return res.status(400).json({
            status: 'error',
            message: 'Se requieren startDate y endDate'
        });
    }
    
    const sales = await salesService.getSalesByPeriod(
        tenantId,
        new Date(startDate),
        new Date(endDate)
    );
    
    res.json({
        status: 'success',
        period: { start: startDate, end: endDate },
        count: sales.length,
        data: sales
    });
}));

module.exports = router;