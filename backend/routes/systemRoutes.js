/**
 * GProA - System Routes (Observabilidad)
 * backend/routes/systemRoutes.js
 */

const express = require('express');
const router = express.Router();
const os = require('os');
const mongoose = require('mongoose');

// Métricas en memoria
const metrics = {
    requests: 0,
    errors: 0,
    startTime: Date.now(),
    endpoints: {},
    responseTimes: []
};

// Middleware para tracking
router.use((req, res, next) => {
    metrics.requests++;
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        
        // Track por endpoint
        const key = `${req.method} ${req.path}`;
        metrics.endpoints[key] = (metrics.endpoints[key] || 0) + 1;
        
        // Track response time
        metrics.responseTimes.push(duration);
        if (metrics.responseTimes.length > 100) {
            metrics.responseTimes.shift();
        }
        
        if (res.statusCode >= 500) {
            metrics.errors++;
        }
    });
    
    next();
});

// GET /health - Health check detallado
router.get('/health', async (req, res) => {
    let dbStatus = 'disconnected';
    let dbLatency = 0;
    
    if (mongoose.connection.readyState === 1) {
        const start = Date.now();
        try {
            await mongoose.connection.db.admin().ping();
            dbLatency = Date.now() - start;
            dbStatus = 'connected';
        } catch (e) {
            dbStatus = 'error';
        }
    }
    
    const uptime = Date.now() - metrics.startTime;
    const avgResponseTime = metrics.responseTimes.length > 0
        ? metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length
        : 0;
    
    res.json({
        status: dbStatus === 'connected' ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(uptime / 1000),
        services: {
            api: 'ok',
            database: dbStatus,
            databaseLatency: `${dbLatency}ms`
        },
        metrics: {
            totalRequests: metrics.requests,
            totalErrors: metrics.errors,
            errorRate: metrics.requests > 0 
                ? ((metrics.errors / metrics.requests) * 100).toFixed(2) + '%' 
                : '0%',
            avgResponseTime: `${avgResponseTime.toFixed(0)}ms`
        }
    });
});

// GET /metrics - Métricas completas
router.get('/metrics', (req, res) => {
    const uptime = Date.now() - metrics.startTime;
    const avgResponseTime = metrics.responseTimes.length > 0
        ? metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length
        : 0;
    
    // Top endpoints
    const topEndpoints = Object.entries(metrics.endpoints)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([endpoint, count]) => ({ endpoint, requests: count }));
    
    // Percentiles de response time
    const sorted = [...metrics.responseTimes].sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)] || 0;
    const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
    const p99 = sorted[Math.floor(sorted.length * 0.99)] || 0;
    
    res.json({
        timestamp: new Date().toISOString(),
        system: {
            uptime: Math.floor(uptime / 1000),
            memory: process.memoryUsage(),
            cpu: os.cpus().length,
            platform: os.platform(),
            nodeVersion: process.version
        },
        requests: {
            total: metrics.requests,
            errors: metrics.errors,
            errorRate: (metrics.errors / metrics.requests * 100).toFixed(2) + '%'
        },
        performance: {
            avgResponseTime: Math.round(avgResponseTime),
            p50: Math.round(p50),
            p95: Math.round(p95),
            p99: Math.round(p99)
        },
        endpoints: topEndpoints
    });
});

// GET /system/status - Estado del sistema
router.get('/status', (req, res) => {
    const memory = process.memoryUsage();
    
    res.json({
        status: 'operational',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        system: {
            platform: os.platform(),
            arch: os.arch(),
            nodeVersion: process.version,
            cpuCores: os.cpus().length,
            totalMemory: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
            freeMemory: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
            loadAverage: os.loadavg()
        },
        process: {
            pid: process.pid,
            uptime: process.uptime(),
            memory: {
                rss: `${(memory.rss / 1024 / 1024).toFixed(2)} MB`,
                heapTotal: `${(memory.heapTotal / 1024 / 1024).toFixed(2)} MB`,
                heapUsed: `${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
                external: `${(memory.external / 1024 / 1024).toFixed(2)} MB`
            }
        }
    });
});

// GET /ping - Ping simple
router.get('/ping', (req, res) => {
    res.json({ 
        status: 'pong', 
        timestamp: new Date().toISOString() 
    });
});

module.exports = router;