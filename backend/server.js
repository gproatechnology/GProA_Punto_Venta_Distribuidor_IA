/**
 * GProA - Sistema de Punto de Venta Distribuidor IA
 * server.js - Servidor principal Express
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Importar rutas
const inventoryRoutes = require('./routes/inventoryRoutes');
const salesRoutes = require('./routes/salesRoutes');
const usersRoutes = require('./routes/usersRoutes');
const warehouseRoutes = require('./routes/warehouseRoutes');
const reportsRoutes = require('./routes/reportsRoutes');
const aiAnalyticsRoutes = require('./routes/aiAnalyticsRoutes');

// Inicializar aplicación
const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============ MIDDLEWARE ============
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logger middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

// ============ RUTAS ESTÁTICAS ============
app.use(express.static(path.join(__dirname, '../frontend')));

// ============ RUTAS API ============
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/warehouse', warehouseRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/ai-analytics', aiAnalyticsRoutes);

// ============ RUTA RAÍZ ============
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ============ RUTA HEALTH CHECK ============
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'GProA API está funcionando',
        environment: NODE_ENV,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// ============ RUTA STATUS ============
app.get('/api/status', (req, res) => {
    res.status(200).json({
        status: 'operational',
        version: '1.0.0',
        name: 'GProA Sistema de Punto de Venta Distribuidor IA',
        services: {
            inventory: 'operational',
            sales: 'operational',
            warehouse: 'operational',
            users: 'operational',
            reports: 'operational',
            'ai-analytics': 'operational'
        },
        timestamp: new Date().toISOString()
    });
});

// ============ MANEJO DE ERRORES 404 ============
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Ruta no encontrada',
        path: req.path,
        method: req.method
    });
});

// ============ MANEJO DE ERRORES GLOBAL ============
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Error interno del servidor',
        ...(NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ============ INICIAR SERVIDOR ============
const server = app.listen(PORT, () => {
    console.log('\n========================================');
    console.log('🚀 GProA Sistema de Punto de Venta');
    console.log('📌 Versión 1.0.0 - Modo Demo');
    console.log('========================================');
    console.log(`✅ Servidor corriendo en puerto ${PORT}`);
    console.log(`🔧 Ambiente: ${NODE_ENV}`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
    console.log('========================================\n');
});

// ============ GRACEFUL SHUTDOWN ============
process.on('SIGTERM', () => {
    console.log('SIGTERM señal recibida: cerrando servidor HTTP');
    server.close(() => {
        console.log('Servidor HTTP cerrado');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT señal recibida: cerrando servidor HTTP');
    server.close(() => {
        console.log('Servidor HTTP cerrado');
        process.exit(0);
    });
});

// ============ MANEJO DE EXCEPCIONES NO CAPTURADAS ============
process.on('uncaughtException', (error) => {
    console.error('Excepción no capturada:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Promesa rechazada no manejada:', reason);
});

module.exports = app;
