const express = require('express');
const router = express.Router();

/**
 * Rutas de Bodega
 */

// GET - Obtener todas las bodegas
router.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'Bodegas obtenidas',
        data: [
            {
                id: 1,
                name: 'Bodega Central',
                capacity: 2500,
                used: 1800,
                utilization: 72,
                status: 'Operativo'
            },
            {
                id: 2,
                name: 'Bodega Sucursal Norte',
                capacity: 1200,
                used: 540,
                utilization: 45,
                status: 'Operativo'
            },
            {
                id: 3,
                name: 'Bodega Sucursal Sur',
                capacity: 1200,
                used: 1056,
                utilization: 88,
                status: 'Crítico'
            }
        ]
    });
});

// GET - Obtener bodega por ID
router.get('/:id', (req, res) => {
    res.json({
        status: 'success',
        message: `Bodega ${req.params.id} obtenida`,
        data: {
            id: req.params.id,
            name: 'Bodega ejemplo',
            capacity: 2000,
            used: 1500,
            utilization: 75
        }
    });
});

// GET - Obtener movimientos de bodega
router.get('/movements/list', (req, res) => {
    res.json({
        status: 'success',
        message: 'Movimientos obtenidos',
        data: [
            {
                id: 'REF-2847',
                type: 'Entrada',
                product: 'Leche Integral 1L',
                quantity: 500,
                from: 'Distribuidor X',
                to: 'Bodega Central',
                date: '2024-05-14',
                status: 'Completado'
            },
            {
                id: 'REF-2846',
                type: 'Salida',
                product: 'Cereal Premium 500g',
                quantity: 200,
                from: 'Bodega Central',
                to: 'Punto Venta',
                date: '2024-05-14',
                status: 'Completado'
            },
            {
                id: 'REF-2845',
                type: 'Transferencia',
                product: 'Pan Integral 600g',
                quantity: 150,
                from: 'Bodega Central',
                to: 'Sucursal Norte',
                date: '2024-05-14',
                status: 'Completado'
            }
        ]
    });
});

// GET - Obtener movimientos por tipo
router.get('/movements/:type', (req, res) => {
    const type = req.params.type;
    res.json({
        status: 'success',
        type: type,
        data: {
            total: type === 'entrada' ? 23 : type === 'salida' ? 45 : 18,
            lastUpdate: new Date().toISOString()
        }
    });
});

// POST - Registrar entrada
router.post('/movements/entrada', (req, res) => {
    res.status(201).json({
        status: 'success',
        message: 'Entrada registrada exitosamente',
        data: {
            id: 'REF-' + Date.now(),
            type: 'Entrada',
            ...req.body,
            timestamp: new Date().toISOString()
        }
    });
});

// POST - Registrar salida
router.post('/movements/salida', (req, res) => {
    res.status(201).json({
        status: 'success',
        message: 'Salida registrada exitosamente',
        data: {
            id: 'REF-' + Date.now(),
            type: 'Salida',
            ...req.body,
            timestamp: new Date().toISOString()
        }
    });
});

// POST - Registrar transferencia
router.post('/movements/transfer', (req, res) => {
    res.status(201).json({
        status: 'success',
        message: 'Transferencia registrada exitosamente',
        data: {
            id: 'REF-' + Date.now(),
            type: 'Transferencia',
            ...req.body,
            timestamp: new Date().toISOString()
        }
    });
});

// GET - Obtener resumen de bodega
router.get('/report/summary', (req, res) => {
    res.json({
        status: 'success',
        data: {
            totalBodegas: 3,
            totalCapacity: 4900,
            totalUsed: 3396,
            averageUtilization: 69,
            entries: 23,
            exits: 45,
            transfers: 18
        }
    });
});

// GET - Obtener ubicaciones en bodega
router.get('/:id/locations', (req, res) => {
    res.json({
        status: 'success',
        data: [
            {
                location: 'Pasillo A, Estante 5',
                product: 'Leche Integral 1L',
                quantity: 145,
                temperature: '4°C'
            },
            {
                location: 'Pasillo B, Estante 3',
                product: 'Cereal Premium 500g',
                quantity: 5,
                temperature: '20°C'
            }
        ]
    });
});

module.exports = router;
