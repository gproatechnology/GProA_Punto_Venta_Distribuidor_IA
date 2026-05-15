/**
 * GProA - Sistema de Punto de Venta Distribuidor IA
 * server.js - Servidor principal Express (Enterprise)
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Importar conexión a MongoDB
const { connectDB, closeDB } = require('./models/db');

// Importar middlewares
const { 
    handleError, 
    notFound, 
    requestLogger, 
    sanitizeInput,
    corsMiddleware,
    rateLimitMiddleware 
} = require('./middlewares/errorMiddleware');
const { extractTenant } = require('./middlewares/tenantMiddleware');
const { auditMiddleware } = require('./middlewares/auditMiddleware');

// Importar rutas
const inventoryRoutes = require('./routes/inventoryRoutes');
const salesRoutes = require('./routes/salesRoutes');
const usersRoutes = require('./routes/usersRoutes');
const warehouseRoutes = require('./routes/warehouseRoutes');
const reportsRoutes = require('./routes/reportsRoutes');
const aiAnalyticsRoutes = require('./routes/aiAnalyticsRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const systemRoutes = require('./routes/systemRoutes');
const alertRoutes = require('./routes/alertRoutes');
const exportRoutes = require('./routes/exportRoutes');

// Swagger
const swaggerUi = require('swagger-ui-express');
const { swaggerSpec } = require('./config/swaggerConfig');

// Inicializar aplicación
const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============ MIDDLEWARE ============
app.use(corsMiddleware);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(sanitizeInput);
app.use(rateLimitMiddleware({ windowMs: 60000, maxRequests: 100 }));
app.use(auditMiddleware);

// Logger
app.use(requestLogger);

// ============ TENANT ============
app.use(extractTenant);

// ============ RUTAS ESTÁTICAS ============
app.use(express.static(path.join(__dirname, '../frontend')));

// ============ RUTAS API ============
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/warehouse', warehouseRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/ai-analytics', aiAnalyticsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', systemRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/export', exportRoutes);

// ============ SWAGGER ============
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/swagger.json', (req, res) => {
    res.json(swaggerSpec);
});

// ============ RUTA RAÍZ ============
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ============ HEALTH CHECK ============
app.get('/api/health', async (req, res) => {
    const mongoose = require('mongoose');
    let dbStatus = 'disconnected';
    
    if (mongoose.connection.readyState === 1) {
        dbStatus = 'connected';
    }
    
    res.status(200).json({
        status: 'ok',
        message: 'GProA API está funcionando',
        environment: NODE_ENV,
        database: dbStatus,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// ============ STATUS ============
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
            'ai-analytics': 'operational',
            dashboard: 'operational'
        },
        timestamp: new Date().toISOString()
    });
});

// ============ MANEJO DE ERRORES ============
app.use(notFound);
app.use(handleError);

// ============ INICIAR SERVIDOR ============
const startServer = async () => {
    try {
        await connectDB();
        
        const server = app.listen(PORT, () => {
            console.log('\n========================================');
            console.log('🚀 GProA Sistema de Punto de Venta');
            console.log('📌 Versión 1.0.0 - Enterprise');
            console.log('========================================');
            console.log(`✅ Servidor corriendo en puerto ${PORT}`);
            console.log(`🔧 Ambiente: ${NODE_ENV}`);
            console.log(`📍 URL: http://localhost:${PORT}`);
            console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
            console.log(`📊 Dashboard: http://localhost:${PORT}/api/dashboard/metrics`);
            console.log('========================================\n');
        });
        
        return server;
    } catch (error) {
        console.error('Error al iniciar servidor:', error);
        process.exit(1);
    }
};

startServer();

// ============ GRACEFUL SHUTDOWN ============
process.on('SIGTERM', async () => {
    console.log('SIGTERM: Cerrando servidor...');
    await closeDB();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT: Cerrando servidor...');
    await closeDB();
    process.exit(0);
});

// ============ EXCEPCIONES ============
process.on('uncaughtException', (error) => {
    console.error('Excepción no capturada:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Promesa rechazada:', reason);
});

module.exports = app;