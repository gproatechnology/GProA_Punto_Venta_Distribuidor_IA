const express = require('express');
const router = express.Router();

/**
 * Rutas de Reportes
 */

// GET - Obtener todos los reportes disponibles
router.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'Reportes disponibles',
        data: [
            {
                id: 1,
                name: 'Reporte de Ventas',
                description: 'Análisis detallado de ventas',
                category: 'sales'
            },
            {
                id: 2,
                name: 'Reporte de Inventario',
                description: 'Estado de productos y stock',
                category: 'inventory'
            },
            {
                id: 3,
                name: 'Reporte de Bodega',
                description: 'Movimientos y utilización',
                category: 'warehouse'
            },
            {
                id: 4,
                name: 'Reporte de Empleados',
                description: 'Productividad y asistencia',
                category: 'employees'
            },
            {
                id: 5,
                name: 'Análisis de Rentabilidad',
                description: 'Margen y ROI',
                category: 'analytics'
            }
        ]
    });
});

// GET - Reporte de ventas
router.get('/sales', (req, res) => {
    const { period } = req.query || 'week';
    res.json({
        status: 'success',
        report: 'sales',
        period: period,
        data: {
            totalSales: 318250,
            transactions: 156,
            averageSale: 2039.42,
            topProducts: [
                { name: 'Leche Integral 1L', units: 500, revenue: 1250 },
                { name: 'Pan Integral 600g', units: 450, revenue: 1345.50 },
                { name: 'Cereal Premium 500g', units: 320, revenue: 1596.80 }
            ],
            paymentMethods: {
                cash: 45,
                card: 35,
                transfer: 20
            }
        }
    });
});

// GET - Reporte de inventario
router.get('/inventory', (req, res) => {
    res.json({
        status: 'success',
        report: 'inventory',
        data: {
            totalSkus: 892,
            totalValue: 485320,
            lowStock: 12,
            rotation: 4.2,
            categories: [
                { name: 'Alimentos', count: 250, value: 185320 },
                { name: 'Bebidas', count: 180, value: 125000 },
                { name: 'Lácteos', count: 200, value: 135000 },
                { name: 'Otros', count: 262, value: 40000 }
            ]
        }
    });
});

// GET - Reporte de bodega
router.get('/warehouse', (req, res) => {
    res.json({
        status: 'success',
        report: 'warehouse',
        data: {
            totalBodegas: 3,
            totalCapacity: 4900,
            totalUsed: 3396,
            utilization: 69,
            entries: 23,
            exits: 45,
            transfers: 18,
            efficiency: 87
        }
    });
});

// GET - Reporte de empleados
router.get('/employees', (req, res) => {
    res.json({
        status: 'success',
        report: 'employees',
        data: {
            total: 12,
            active: 8,
            inactive: 4,
            topPerformers: [
                { name: 'Juan García', sales: 12450, rank: 1 },
                { name: 'María López', sales: 8945, rank: 2 },
                { name: 'Carlos Fernández', movements: 45, rank: 3 }
            ],
            departmentMetrics: [
                { department: 'Ventas', employees: 4, productivity: 92 },
                { department: 'Bodega', employees: 3, productivity: 85 },
                { department: 'Administración', employees: 2, productivity: 95 }
            ]
        }
    });
});

// GET - Reporte de rentabilidad
router.get('/profitability', (req, res) => {
    res.json({
        status: 'success',
        report: 'profitability',
        data: {
            totalRevenue: 318250,
            totalCost: 217575,
            grossProfit: 100675,
            marginPercentage: 31.66,
            roi: 145,
            operatingExpenses: 50000,
            netProfit: 50675,
            profitMargin: 15.92,
            byProduct: [
                { name: 'Alimentos', margin: 28 },
                { name: 'Bebidas', margin: 35 },
                { name: 'Lácteos', margin: 25 }
            ]
        }
    });
});

// GET - Reporte de trazabilidad
router.get('/traceability', (req, res) => {
    res.json({
        status: 'success',
        report: 'traceability',
        data: {
            trackedBatches: 127,
            coverage: 100,
            completeBatches: 127,
            incompleteBatches: 0,
            averageTraceTime: '2.3 hours',
            traceAccuracy: 99.8
        }
    });
});

// GET - Reporte personalizado
router.get('/custom', (req, res) => {
    const { type, startDate, endDate } = req.query;
    res.json({
        status: 'success',
        report: 'custom',
        type: type,
        period: {
            start: startDate,
            end: endDate
        },
        data: {
            generated: new Date().toISOString(),
            available: true
        }
    });
});

// POST - Generar reporte personalizado
router.post('/generate', (req, res) => {
    res.status(201).json({
        status: 'success',
        message: 'Reporte generado exitosamente',
        data: {
            reportId: 'RPT-' + Date.now(),
            ...req.body,
            generatedAt: new Date().toISOString()
        }
    });
});

// GET - Descargar reporte
router.get('/download/:id', (req, res) => {
    res.json({
        status: 'success',
        message: 'Reporte disponible para descargar',
        file: `reporte_${req.params.id}.pdf`,
        url: `/downloads/reporte_${req.params.id}.pdf`
    });
});

// POST - Exportar a Excel
router.post('/export/excel', (req, res) => {
    res.json({
        status: 'success',
        message: 'Reporte exportado a Excel',
        file: 'reporte_' + Date.now() + '.xlsx'
    });
});

// POST - Exportar a PDF
router.post('/export/pdf', (req, res) => {
    res.json({
        status: 'success',
        message: 'Reporte exportado a PDF',
        file: 'reporte_' + Date.now() + '.pdf'
    });
});

// POST - Enviar reporte por email
router.post('/email', (req, res) => {
    const { email, reportType } = req.body;
    res.json({
        status: 'success',
        message: `Reporte enviado a ${email}`,
        report: reportType,
        sentAt: new Date().toISOString()
    });
});

module.exports = router;
