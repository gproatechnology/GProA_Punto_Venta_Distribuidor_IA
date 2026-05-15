/**
 * GProA - Swagger Configuration
 * backend/config/swaggerConfig.js
 */

const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'GProA - Punto de Venta Distribuidor IA',
            description: 'API REST para sistema de punto de venta, inventario y gestión de bodega',
            version: '1.0.0',
            contact: {
                name: 'GProA Technology',
                email: 'support@gproa.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Servidor de desarrollo'
            }
        ],
        tags: [
            { name: 'Inventory', description: 'Gestión de productos e inventario' },
            { name: 'Sales', description: 'Punto de venta y transacciones' },
            { name: 'Warehouse', description: 'Control de bodega y movimientos' },
            { name: 'Dashboard', description: 'Métricas y KPIs' },
            { name: 'System', description: 'Salud y monitoreo del sistema' }
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                Product: {
                    type: 'object',
                    required: ['sku', 'name', 'category', 'price', 'cost', 'minStock'],
                    properties: {
                        sku: { type: 'string', example: 'LAC-001' },
                        name: { type: 'string', example: 'Leche Entera 1L' },
                        category: { type: 'string', example: 'Lácteos' },
                        price: { type: 'number', example: 28.00 },
                        cost: { type: 'number', example: 22.00 },
                        stock: { type: 'number', example: 150 },
                        minStock: { type: 'number', example: 50 }
                    }
                },
                Sale: {
                    type: 'object',
                    required: ['items'],
                    properties: {
                        items: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    product: { type: 'string' },
                                    quantity: { type: 'number' }
                                }
                            }
                        },
                        paymentMethod: {
                            type: 'string',
                            enum: ['cash', 'card', 'transfer']
                        }
                    }
                },
                Movement: {
                    type: 'object',
                    required: ['productId', 'type', 'quantity'],
                    properties: {
                        productId: { type: 'string' },
                        type: { type: 'string', enum: ['entrada', 'salida', 'ajuste'] },
                        quantity: { type: 'number' },
                        reason: { type: 'string' }
                    }
                }
            }
        }
    },
    apis: [
        path.join(__dirname, '../routes/*.js'),
        path.join(__dirname, '../docs/swagger.yaml')
    ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerSpec, options };