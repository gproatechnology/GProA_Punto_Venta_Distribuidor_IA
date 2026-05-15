/**
 * GProA - Rutas de Bodega
 * backend/routes/warehouseRoutes.js
 * 
 * Rutas delgadas - toda lógica en services/
 */

const express = require('express');
const router = express.Router();
const warehouseService = require('../services/warehouseService');
const { asyncHandler } = require('../utils/errors');

// GET - Obtener todas las bodegas
router.get('/', asyncHandler(async (req, res) => {
    const tenantId = req.tenantId || req.headers['x-tenant-id'];
    const warehouses = await warehouseService.getWarehouses(tenantId);
    
    res.json({
        status: 'success',
        message: 'Bodegas obtenidas',
        count: warehouses.length,
        data: warehouses
    });
}));

// GET - Obtener bodega por ID
router.get('/:id', asyncHandler(async (req, res) => {
    const tenantId = req.tenantId || req.headers['x-tenant-id'];
    const warehouse = await warehouseService.getWarehouseById(tenantId, req.params.id);
    
    res.json({
        status: 'success',
        message: `Bodega ${req.params.id} obtenida`,
        data: warehouse
    });
}));

// POST - Crear bodega
router.post('/', asyncHandler(async (req, res) => {
    const tenantId = req.tenantId || req.headers['x-tenant-id'];
    const userId = req.user?.id || req.body.userId;
    
    const warehouse = await warehouseService.createWarehouse(tenantId, req.body, userId);
    
    res.status(201).json({
        status: 'success',
        message: 'Bodega creada exitosamente',
        data: warehouse
    });
}));

// PUT - Actualizar bodega
router.put('/:id', asyncHandler(async (req, res) => {
    const tenantId = req.tenantId || req.headers['x-tenant-id'];
    const userId = req.user?.id || req.body.userId;
    
    const warehouse = await warehouseService.updateWarehouse(tenantId, req.params.id, req.body, userId);
    
    res.json({
        status: 'success',
        message: `Bodega ${req.params.id} actualizada`,
        data: warehouse
    });
}));

// GET - Obtener movimientos de inventario
router.get('/movements/list', asyncHandler(async (req, res) => {
    const tenantId = req.tenantId || req.headers['x-tenant-id'];
    const { type, product, startDate, endDate, limit } = req.query;
    
    const filters = {};
    if (type) filters.type = type;
    if (product) filters.product = product;
    if (startDate || endDate) {
        filters.createdAt = {};
        if (startDate) filters.createdAt.$gte = new Date(startDate);
        if (endDate) filters.createdAt.$lte = new Date(endDate);
    }
    
    const movements = await warehouseService.getMovements(tenantId, filters);
    
    res.json({
        status: 'success',
        message: 'Movimientos obtenidos',
        count: movements.length,
        data: movements
    });
}));

// GET - Obtener movimientos por tipo
router.get('/movements/:type', asyncHandler(async (req, res) => {
    const tenantId = req.tenantId || req.headers['x-tenant-id'];
    const movements = await warehouseService.getMovements(tenantId, { type: req.params.type });
    
    res.json({
        status: 'success',
        type: req.params.type,
        count: movements.length,
        data: movements
    });
}));

// POST - Registrar entrada de inventario
router.post('/movements/entrada', asyncHandler(async (req, res) => {
    const tenantId = req.tenantId || req.headers['x-tenant-id'];
    const userId = req.user?.id || req.body.userId;
    
    const movement = await warehouseService.createEntrada(tenantId, req.body, userId);
    
    res.status(201).json({
        status: 'success',
        message: 'Entrada registrada exitosamente',
        data: movement
    });
}));

// POST - Registrar salida de inventario
router.post('/movements/salida', asyncHandler(async (req, res) => {
    const tenantId = req.tenantId || req.headers['x-tenant-id'];
    const userId = req.user?.id || req.body.userId;
    
    const movement = await warehouseService.createSalida(tenantId, req.body, userId);
    
    res.status(201).json({
        status: 'success',
        message: 'Salida registrada exitosamente',
        data: movement
    });
}));

// POST - Registrar transferencia
router.post('/movements/transfer', asyncHandler(async (req, res) => {
    const tenantId = req.tenantId || req.headers['x-tenant-id'];
    const userId = req.user?.id || req.body.userId;
    
    const movement = await warehouseService.createTransferencia(tenantId, req.body, userId);
    
    res.status(201).json({
        status: 'success',
        message: 'Transferencia registrada exitosamente',
        data: movement
    });
}));

// GET - Resumen de bodega
router.get('/report/summary', asyncHandler(async (req, res) => {
    const tenantId = req.tenantId || req.headers['x-tenant-id'];
    const warehouseStats = await warehouseService.getWarehouses(tenantId);
    const movementStats = await warehouseService.getSummary(tenantId);
    
    res.json({
        status: 'success',
        data: {
            warehouses: warehouseStats.length,
            ...movementStats
        }
    });
}));

// GET - Ubicaciones en bodega
router.get('/:id/locations', asyncHandler(async (req, res) => {
    const tenantId = req.tenantId || req.headers['x-tenant-id'];
    const warehouse = await warehouseService.getWarehouseById(tenantId, req.params.id);
    
    res.json({
        status: 'success',
        data: warehouse.locations || []
    });
}));

module.exports = router;