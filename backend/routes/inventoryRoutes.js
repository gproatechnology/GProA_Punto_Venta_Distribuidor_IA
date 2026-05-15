/**
 * GProA - Rutas de Inventario
 * backend/routes/inventoryRoutes.js
 * 
 * Rutas delgadas - toda lógica en services/
 */

const express = require('express');
const router = express.Router();
const inventoryService = require('../services/inventoryService');
const { asyncHandler } = require('../utils/errors');
const { validate } = require('../utils/validator');

// GET - Obtener todos los productos
router.get('/products', asyncHandler(async (req, res) => {
    const tenantId = req.tenantId || req.headers['x-tenant-id'];
    const { category, status, search, lowStock } = req.query;
    
    const filters = {};
    if (category) filters.category = category;
    if (status) filters.status = status;
    if (lowStock === 'true') {
        filters.$expr = { $lte: ['$stock', '$minStock'] };
    }
    if (search) {
        filters.$or = [
            { name: { $regex: search, $options: 'i' } },
            { sku: { $regex: search, $options: 'i' } }
        ];
    }
    
    const products = await inventoryService.getProducts(tenantId, filters);
    
    res.json({
        status: 'success',
        message: 'Productos obtenidos',
        count: products.length,
        data: products
    });
}));

// GET - Obtener producto por SKU
router.get('/products/:sku', asyncHandler(async (req, res) => {
    const tenantId = req.tenantId || req.headers['x-tenant-id'];
    const product = await inventoryService.getProductBySku(tenantId, req.params.sku);
    
    res.json({
        status: 'success',
        message: `Producto ${req.params.sku} obtenido`,
        data: product
    });
}));

// POST - Crear nuevo producto
router.post('/products', asyncHandler(async (req, res) => {
    const tenantId = req.tenantId || req.headers['x-tenant-id'];
    const userId = req.user?.id || req.body.userId;
    
    const product = await inventoryService.createProduct(tenantId, req.body, userId);
    
    res.status(201).json({
        status: 'success',
        message: 'Producto creado exitosamente',
        data: product
    });
}));

// PUT - Actualizar producto
router.put('/products/:sku', asyncHandler(async (req, res) => {
    const tenantId = req.tenantId || req.headers['x-tenant-id'];
    const userId = req.user?.id || req.body.userId;
    
    const product = await inventoryService.getProductBySku(tenantId, req.params.sku);
    const updated = await inventoryService.updateProduct(tenantId, product._id, req.body, userId);
    
    res.json({
        status: 'success',
        message: `Producto ${req.params.sku} actualizado`,
        data: updated
    });
}));

// DELETE - Soft delete producto
router.delete('/products/:sku', asyncHandler(async (req, res) => {
    const tenantId = req.tenantId || req.headers['x-tenant-id'];
    const userId = req.user?.id || req.body.userId;
    
    const product = await inventoryService.getProductBySku(tenantId, req.params.sku);
    await inventoryService.deleteProduct(tenantId, product._id, userId);
    
    res.json({
        status: 'success',
        message: `Producto ${req.params.sku} eliminado`
    });
}));

// GET - Resumen de inventario
router.get('/summary', asyncHandler(async (req, res) => {
    const tenantId = req.tenantId || req.headers['x-tenant-id'];
    const summary = await inventoryService.getSummary(tenantId);
    
    res.json({
        status: 'success',
        data: summary
    });
}));

// GET - Alertas de stock
router.get('/alerts', asyncHandler(async (req, res) => {
    const tenantId = req.tenantId || req.headers['x-tenant-id'];
    const alerts = await inventoryService.getAlerts(tenantId);
    
    res.json({
        status: 'success',
        count: alerts.length,
        data: alerts
    });
}));

// GET - Categorías
router.get('/categories', asyncHandler(async (req, res) => {
    const tenantId = req.tenantId || req.headers['x-tenant-id'];
    const categories = await inventoryService.getCategories(tenantId);
    
    res.json({
        status: 'success',
        data: categories
    });
}));

module.exports = router;