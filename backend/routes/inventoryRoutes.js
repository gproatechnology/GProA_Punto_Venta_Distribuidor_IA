const express = require('express');
const router = express.Router();

/**
 * Rutas de Inventario
 */

// GET - Obtener todos los productos
router.get('/products', (req, res) => {
    res.json({
        status: 'success',
        message: 'Productos obtenidos',
        data: [
            {
                id: 'SKU-001',
                name: 'Leche Integral 1L',
                category: 'Lácteos',
                stock: 145,
                minimum: 50,
                price: 2.50,
                status: 'Normal'
            },
            {
                id: 'SKU-002',
                name: 'Cereal Premium 500g',
                category: 'Alimentos',
                stock: 5,
                minimum: 30,
                price: 4.99,
                status: 'Crítico'
            },
            {
                id: 'SKU-003',
                name: 'Pan Integral 600g',
                category: 'Alimentos',
                stock: 28,
                minimum: 40,
                price: 2.99,
                status: 'Bajo'
            }
        ]
    });
});

// GET - Obtener producto por SKU
router.get('/products/:sku', (req, res) => {
    res.json({
        status: 'success',
        message: `Producto ${req.params.sku} obtenido`,
        data: {
            id: req.params.sku,
            name: 'Producto ejemplo',
            stock: 100,
            price: 10.00
        }
    });
});

// POST - Crear nuevo producto
router.post('/products', (req, res) => {
    res.status(201).json({
        status: 'success',
        message: 'Producto creado exitosamente',
        data: {
            id: 'SKU-' + Date.now(),
            ...req.body
        }
    });
});

// PUT - Actualizar producto
router.put('/products/:sku', (req, res) => {
    res.json({
        status: 'success',
        message: `Producto ${req.params.sku} actualizado`,
        data: req.body
    });
});

// DELETE - Eliminar producto
router.delete('/products/:sku', (req, res) => {
    res.json({
        status: 'success',
        message: `Producto ${req.params.sku} eliminado`
    });
});

// GET - Obtener resumen de inventario
router.get('/summary', (req, res) => {
    res.json({
        status: 'success',
        data: {
            totalSkus: 892,
            totalValue: 485320,
            lowStock: 12,
            rotation: 4.2
        }
    });
});

// GET - Obtener alertas de stock
router.get('/alerts', (req, res) => {
    res.json({
        status: 'success',
        data: [
            {
                sku: 'SKU-002',
                product: 'Cereal Premium 500g',
                current: 5,
                minimum: 30,
                severity: 'critical'
            },
            {
                sku: 'SKU-003',
                product: 'Pan Integral 600g',
                current: 28,
                minimum: 40,
                severity: 'warning'
            }
        ]
    });
});

module.exports = router;
