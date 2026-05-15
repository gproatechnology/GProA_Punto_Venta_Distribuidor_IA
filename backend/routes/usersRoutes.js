const express = require('express');
const router = express.Router();

/**
 * Rutas de Usuarios y Empleados
 */

// GET - Obtener todos los usuarios
router.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'Usuarios obtenidos',
        data: [
            {
                id: 1,
                name: 'Juan García',
                email: 'juan@gproa.com',
                role: 'Administrador',
                status: 'Activo',
                sales: 12450
            },
            {
                id: 2,
                name: 'María López',
                email: 'maria@gproa.com',
                role: 'Vendedor',
                status: 'Activo',
                sales: 8945
            },
            {
                id: 3,
                name: 'Carlos Fernández',
                email: 'carlos@gproa.com',
                role: 'Bodeguero',
                status: 'Activo',
                movements: 45
            }
        ]
    });
});

// GET - Obtener usuario por ID
router.get('/:id', (req, res) => {
    res.json({
        status: 'success',
        message: `Usuario ${req.params.id} obtenido`,
        data: {
            id: req.params.id,
            name: 'Usuario ejemplo',
            email: 'user@gproa.com',
            role: 'Vendedor',
            status: 'Activo'
        }
    });
});

// POST - Crear nuevo usuario
router.post('/', (req, res) => {
    res.status(201).json({
        status: 'success',
        message: 'Usuario creado exitosamente',
        data: {
            id: Date.now(),
            ...req.body,
            createdAt: new Date().toISOString()
        }
    });
});

// PUT - Actualizar usuario
router.put('/:id', (req, res) => {
    res.json({
        status: 'success',
        message: `Usuario ${req.params.id} actualizado`,
        data: req.body
    });
});

// DELETE - Eliminar usuario
router.delete('/:id', (req, res) => {
    res.json({
        status: 'success',
        message: `Usuario ${req.params.id} eliminado`
    });
});

// GET - Obtener roles disponibles
router.get('/roles/list', (req, res) => {
    res.json({
        status: 'success',
        data: [
            {
                id: 1,
                name: 'Administrador',
                users: 2,
                permissions: ['all']
            },
            {
                id: 2,
                name: 'Vendedor',
                users: 4,
                permissions: ['sales', 'inventory-view']
            },
            {
                id: 3,
                name: 'Bodeguero',
                users: 2,
                permissions: ['warehouse', 'inventory-view']
            }
        ]
    });
});

// GET - Obtener permisos
router.get('/permissions/list', (req, res) => {
    res.json({
        status: 'success',
        data: [
            'inventory-view',
            'inventory-edit',
            'sales-create',
            'sales-view',
            'sales-edit',
            'warehouse-view',
            'warehouse-edit',
            'users-manage',
            'reports-view',
            'reports-export',
            'settings'
        ]
    });
});

// POST - Crear nuevo rol
router.post('/roles', (req, res) => {
    res.status(201).json({
        status: 'success',
        message: 'Rol creado exitosamente',
        data: {
            id: Date.now(),
            ...req.body
        }
    });
});

// GET - Obtener actividad de usuario
router.get('/:id/activity', (req, res) => {
    res.json({
        status: 'success',
        data: [
            {
                action: 'Venta registrada',
                description: 'Ticket #2847',
                timestamp: new Date().toISOString()
            },
            {
                action: 'Inventario actualizado',
                description: '50 unidades agregadas',
                timestamp: new Date(Date.now() - 3600000).toISOString()
            }
        ]
    });
});

module.exports = router;
