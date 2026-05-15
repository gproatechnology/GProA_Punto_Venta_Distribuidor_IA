/**
 * GProA - Inventory Service
 * backend/services/inventoryService.js
 */

const Product = require('../models/Product');
const Event = require('../models/Event');
const logger = require('../utils/logger');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { PRODUCT_STATUS } = require('../utils/validator');

class InventoryService {
    // Obtener todos los productos
    async getProducts(tenantId, filters = {}) {
        const query = { tenantId, isDeleted: false, ...filters };
        return Product.find(query).sort({ name: 1 }).limit(100);
    }

    // Obtener producto por ID
    async getProductById(tenantId, productId) {
        const product = await Product.findOne({ _id: productId, tenantId, isDeleted: false });
        if (!product) throw new NotFoundError('Producto', productId);
        return product;
    }

    // Obtener producto por SKU
    async getProductBySku(tenantId, sku) {
        const product = await Product.findOne({ sku: sku.toUpperCase(), tenantId, isDeleted: false });
        if (!product) throw new NotFoundError('Producto', sku);
        return product;
    }

    // Crear producto
    async createProduct(tenantId, data, userId) {
        const product = new Product({
            ...data,
            tenantId,
            createdBy: userId
        });
        await product.save();

        await Event.log({
            tenantId,
            entity: 'product',
            entityId: product._id,
            action: 'create',
            user: userId,
            newState: product.toObject(),
            description: `Producto ${product.sku} creado`
        });

        logger.inventory('CREATE', product._id, product.stock, { sku: product.sku });
        return product;
    }

    // Actualizar producto
    async updateProduct(tenantId, productId, data, userId) {
        const product = await this.getProductById(tenantId, productId);
        const previousState = product.toObject();

        Object.assign(product, data, { updatedBy: userId });
        await product.save();

        await Event.log({
            tenantId,
            entity: 'product',
            entityId: product._id,
            action: 'update',
            user: userId,
            previousState,
            newState: product.toObject(),
            description: `Producto ${product.sku} actualizado`
        });

        return product;
    }

    // Soft delete producto
    async deleteProduct(tenantId, productId, userId) {
        const product = await this.getProductById(tenantId, productId);
        await product.softDelete(userId);

        await Event.log({
            tenantId,
            entity: 'product',
            entityId: product._id,
            action: 'delete',
            user: userId,
            description: `Producto ${product.sku} eliminado`
        });

        return product;
    }

    // Validar stock disponible
    async validateStock(tenantId, productId, quantity) {
        const product = await this.getProductById(tenantId, productId);
        
        if (product.stock < quantity) {
            throw new ValidationError(
                `Stock insuficiente para ${product.name}. Disponible: ${product.stock}, Solicitado: ${quantity}`
            );
        }
        
        return product;
    }

    // Actualizar stock (usado por movimientos)
    async updateStock(tenantId, productId, quantity, operation, userId) {
        const product = await this.getProductById(tenantId, productId);
        const previousStock = product.stock;

        if (operation === 'add') {
            product.stock += quantity;
        } else if (operation === 'subtract') {
            if (product.stock < quantity) {
                throw new ValidationError(
                    `Stock insuficiente para ${product.name}`
                );
            }
            product.stock -= quantity;
        }

        await product.save();

        logger.inventory(operation.toUpperCase(), product._id, quantity, {
            previous: previousStock,
            current: product.stock
        });

        return product;
    }

    // Obtener resumen de inventario
    async getSummary(tenantId) {
        const result = await Product.aggregate([
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

        const lowStockCount = await Product.countDocuments({
            tenantId,
            $expr: { $lte: ['$stock', '$minStock'] },
            status: PRODUCT_STATUS.ACTIVE,
            isDeleted: false
        });

        return {
            totalSkus: result[0]?.totalSkus || 0,
            totalValue: result[0]?.totalValue || 0,
            totalStock: result[0]?.totalStock || 0,
            lowStock: lowStockCount
        };
    }

    // Obtener alertas de stock bajo
    async getAlerts(tenantId) {
        const products = await Product.find({
            tenantId,
            $expr: { $lte: ['$stock', '$minStock'] },
            status: PRODUCT_STATUS.ACTIVE,
            isDeleted: false
        }).sort({ stock: 1 });

        return products.map(p => ({
            sku: p.sku,
            name: p.name,
            current: p.stock,
            minimum: p.minStock,
            severity: p.stock === 0 ? 'critical' : 'warning'
        }));
    }

    // Obtener categorías
    async getCategories(tenantId) {
        return Product.distinct('category', { tenantId, isDeleted: false });
    }
}

module.exports = new InventoryService();