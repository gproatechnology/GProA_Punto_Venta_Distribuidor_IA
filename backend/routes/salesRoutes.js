const express = require('express');
const router = express.Router();

/**
 * Rutas de Ventas
 */

// GET - Obtener todas las ventas
router.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'Ventas obtenidas',
        data: {
            total: 45230.50,
            transactions: 28,
            average: 1616.09,
            sales: [
                {
                    id: '#2847',
                    customer: 'Juan García',
                    products: 12,
                    amount: 2450.00,
                    method: 'Efectivo',
                    time: '14:35',
                    status: 'Completado'
                },
                {
                    id: '#2846',
                    customer: 'María López',
                    products: 8,
                    amount: 1880.50,
                    method: 'Tarjeta',
                    time: '14:15',
                    status: 'Completado'
                }
            ]
        }
    });
});

// GET - Obtener venta por ID
router.get('/:id', (req, res) => {
    res.json({
        status: 'success',
        message: `Venta ${req.params.id} obtenida`,
        data: {
            id: req.params.id,
            customer: 'Cliente ejemplo',
            products: [],
            total: 0,
            paymentMethod: 'Efectivo',
            date: new Date().toISOString()
        }
    });
});

// POST - Crear nueva venta
router.post('/', (req, res) => {
    res.status(201).json({
        status: 'success',
        message: 'Venta registrada exitosamente',
        data: {
            id: '#' + Date.now(),
            ...req.body,
            timestamp: new Date().toISOString()
        }
    });
});

// PUT - Actualizar venta
router.put('/:id', (req, res) => {
    res.json({
        status: 'success',
        message: `Venta ${req.params.id} actualizada`,
        data: req.body
    });
});

// DELETE - Anular venta
router.delete('/:id', (req, res) => {
    res.json({
        status: 'success',
        message: `Venta ${req.params.id} anulada`
    });
});

// GET - Obtener resumen de ventas
router.get('/report/summary', (req, res) => {
    res.json({
        status: 'success',
        data: {
            totalSales: 318250,
            transactions: 156,
            averageSale: 2039.42,
            paymentMethods: {
                cash: 45,
                card: 35,
                transfer: 20
            }
        }
    });
});

// GET - Obtener ventas por período
router.get('/report/period', (req, res) => {
    const { startDate, endDate } = req.query;
    res.json({
        status: 'success',
        period: {
            start: startDate,
            end: endDate
        },
        data: {
            total: 45230.50,
            count: 28
        }
    });
});

module.exports = router;
