/**
 * GProA - Dashboard Service
 * backend/services/dashboardService.js
 */

const Product = require('../models/Product');
const Sale = require('../models/Sale');
const InventoryMovement = require('../models/InventoryMovement');
const Event = require('../models/Event');
const { PRODUCT_STATUS, STATUS } = require('../utils/validator');

class DashboardService {
    // Métricas principales del dashboard
    async getMetrics(tenantId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Ventas de hoy
        const todaySales = await Sale.aggregate([
            { $match: { 
                tenantId,
                status: STATUS.COMPLETED,
                date: { $gte: today, $lt: tomorrow }
            }},
            {
                $group: {
                    _id: null,
                    total: { $sum: '$total' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Stock bajo
        const lowStockProducts = await Product.find({
            tenantId,
            $expr: { $lte: ['$stock', '$minStock'] },
            status: PRODUCT_STATUS.ACTIVE,
            isDeleted: false
        }).limit(10);

        const lowStockAlerts = lowStockProducts.map(p => ({
            sku: p.sku,
            name: p.name,
            stock: p.stock,
            minStock: p.minStock,
            severity: p.stock === 0 ? 'critical' : 'warning'
        }));

        // Movimientos recientes
        const recentMovements = await InventoryMovement.findRecent(tenantId, 10);

        // Resumen de inventario
        const inventorySummary = await Product.aggregate([
            { $match: { tenantId, status: PRODUCT_STATUS.ACTIVE, isDeleted: false } },
            {
                $group: {
                    _id: null,
                    totalSkus: { $sum: 1 },
                    totalValue: { $sum: { $multiply: ['$stock', '$cost'] } },
                    totalStock: { $sum: '$stock' }
                }
            }
        ]);

        // Productos críticos
        const criticalCount = await Product.countDocuments({
            tenantId,
            stock: 0,
            status: PRODUCT_STATUS.ACTIVE,
            isDeleted: false
        });

        // Productos con stock bajo
        const warningCount = await Product.countDocuments({
            tenantId,
            $expr: { $and: [
                { $gt: ['$stock', 0] },
                { $lte: ['$stock', { $multiply: ['$minStock', 1.5] }] }
            ]},
            status: PRODUCT_STATUS.ACTIVE,
            isDeleted: false
        });

        // Actividad reciente
        const recentActivity = await Event.findRecent(tenantId, 10);

        // Ventas por método de pago hoy
        const paymentMethods = await Sale.aggregate([
            { $match: { 
                tenantId,
                status: STATUS.COMPLETED,
                date: { $gte: today, $lt: tomorrow }
            }},
            {
                $group: {
                    _id: '$paymentMethod',
                    count: { $sum: 1 },
                    total: { $sum: '$total' }
                }
            }
        ]);

        return {
            sales: {
                today: {
                    total: todaySales[0]?.total || 0,
                    transactions: todaySales[0]?.count || 0,
                    average: todaySales[0]?.count > 0 
                        ? todaySales[0].total / todaySales[0].count 
                        : 0
                }
            },
            inventory: {
                totalSkus: inventorySummary[0]?.totalSkus || 0,
                totalValue: inventorySummary[0]?.totalValue || 0,
                totalStock: inventorySummary[0]?.totalStock || 0,
                critical: criticalCount,
                warning: warningCount,
                alerts: lowStockAlerts
            },
            movements: recentMovements.map(m => ({
                reference: m.reference,
                type: m.type,
                product: m.product?.name,
                quantity: m.quantity,
                status: m.status,
                createdAt: m.createdAt
            })),
            activity: recentActivity.map(a => ({
                entity: a.entity,
                action: a.action,
                user: a.user?.firstName,
                description: a.description,
                timestamp: a.timestamp
            })),
            paymentMethods: paymentMethods.reduce((acc, pm) => {
                acc[pm._id] = { count: pm.count, total: pm.total };
                return acc;
            }, {})
        };
    }

    // KPIs
    async getKPIs(tenantId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const last7Days = new Date(today);
        last7Days.setDate(last7Days.getDate() - 7);
        
        const last30Days = new Date(today);
        last30Days.setDate(last30Days.getDate() - 30);

        // Ventas últimos 7 días
        const salesLast7 = await Sale.aggregate([
            { $match: { 
                tenantId,
                status: STATUS.COMPLETED,
                date: { $gte: last7Days }
            }},
            {
                $group: {
                    _id: null,
                    total: { $sum: '$total' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Ventas últimos 30 días
        const salesLast30 = await Sale.aggregate([
            { $match: { 
                tenantId,
                status: STATUS.COMPLETED,
                date: { $gte: last30Days }
            }},
            {
                $group: {
                    _id: null,
                    total: { $sum: '$total' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Productos con stock bajo
        const lowStockCount = await Product.countDocuments({
            tenantId,
            $expr: { $lte: ['$stock', '$minStock'] },
            status: PRODUCT_STATUS.ACTIVE,
            isDeleted: false
        });

        // Movimientos últimos 7 días
        const movementsLast7 = await InventoryMovement.countDocuments({
            tenantId,
            createdAt: { $gte: last7Days }
        });

        return {
            salesLast7Days: {
                total: salesLast7[0]?.total || 0,
                transactions: salesLast7[0]?.count || 0
            },
            salesLast30Days: {
                total: salesLast30[0]?.total || 0,
                transactions: salesLast30[0]?.count || 0
            },
            inventory: {
                lowStock: lowStockCount
            },
            operations: {
                movementsLast7Days: movementsLast7
            }
        };
    }

    // Top productos vendidos
    async getTopProducts(tenantId, limit = 10) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const topProducts = await Sale.aggregate([
            { $match: { 
                tenantId,
                status: STATUS.COMPLETED,
                date: { $gte: thirtyDaysAgo }
            }},
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.product',
                    totalSold: { $sum: '$items.quantity' },
                    revenue: { $sum: '$items.subtotal' }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: '$productInfo' },
            {
                $project: {
                    sku: '$productInfo.sku',
                    name: '$productInfo.name',
                    totalSold: 1,
                    revenue: 1
                }
            }
        ]);

        return topProducts;
    }

    // Rotación de inventario
    async getInventoryRotation(tenantId) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const movements = await InventoryMovement.aggregate([
            { $match: { 
                tenantId,
                type: 'salida',
                createdAt: { $gte: thirtyDaysAgo }
            }},
            {
                $group: {
                    _id: '$product',
                    totalOut: { $sum: '$quantity' }
                }
            },
            { $sort: { totalOut: -1 } },
            { $limit: 20 },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: '$productInfo' },
            {
                $project: {
                    sku: '$productInfo.sku',
                    name: '$productInfo.name',
                    stock: '$productInfo.stock',
                    totalOut: 1,
                    rotation: { 
                        $divide: ['$totalOut', 30] 
                    }
                }
            }
        ]);

        return movements;
    }

    // Actividad por usuario
    async getActivityByUser(tenantId, limit = 20) {
        return Event.findRecent(tenantId, limit);
    }
}

module.exports = new DashboardService();