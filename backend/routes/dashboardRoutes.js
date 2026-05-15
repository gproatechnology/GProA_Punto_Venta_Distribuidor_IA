/**
 * GProA - Rutas de Dashboard
 * backend/routes/dashboardRoutes.js
 */

const express = require('express');
const router = express.Router();
const dashboardService = require('../services/dashboardService');
const { asyncHandler } = require('../utils/errors');

// GET - Métricas del dashboard
router.get('/metrics', asyncHandler(async (req, res) => {
    const tenantId = req.tenantId || req.headers['x-tenant-id'];
    const metrics = await dashboardService.getMetrics(tenantId);
    
    res.json({
        status: 'success',
        timestamp: new Date().toISOString(),
        data: metrics
    });
}));

// GET - KPIs
router.get('/kpis', asyncHandler(async (req, res) => {
    const tenantId = req.tenantId || req.headers['x-tenant-id'];
    const kpis = await dashboardService.getKPIs(tenantId);
    
    res.json({
        status: 'success',
        data: kpis
    });
}));

// GET - Top productos
router.get('/top-products', asyncHandler(async (req, res) => {
    const tenantId = req.tenantId || req.headers['x-tenant-id'];
    const { limit } = req.query;
    const topProducts = await dashboardService.getTopProducts(tenantId, parseInt(limit) || 10);
    
    res.json({
        status: 'success',
        count: topProducts.length,
        data: topProducts
    });
}));

// GET - Rotación de inventario
router.get('/inventory-rotation', asyncHandler(async (req, res) => {
    const tenantId = req.tenantId || req.headers['x-tenant-id'];
    const rotation = await dashboardService.getInventoryRotation(tenantId);
    
    res.json({
        status: 'success',
        count: rotation.length,
        data: rotation
    });
}));

// GET - Actividad reciente
router.get('/activity', asyncHandler(async (req, res) => {
    const tenantId = req.tenantId || req.headers['x-tenant-id'];
    const { limit } = req.query;
    const activity = await dashboardService.getActivityByUser(tenantId, parseInt(limit) || 20);
    
    res.json({
        status: 'success',
        count: activity.length,
        data: activity
    });
}));

module.exports = router;