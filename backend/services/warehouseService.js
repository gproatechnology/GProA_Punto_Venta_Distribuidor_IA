/**
 * GProA - Warehouse Service (con Transacciones)
 * backend/services/warehouseService.js
 */

const mongoose = require('mongoose');
const InventoryMovement = require('../models/InventoryMovement');
const Product = require('../models/Product');
const Warehouse = require('../models/Warehouse');
const Event = require('../models/Event');
const logger = require('../utils/logger');
const { NotFoundError, TransactionError, InsufficientStockError } = require('../utils/errors');
const { STATUS, MOVEMENT_TYPES } = require('../utils/validator');

class WarehouseService {
    // Obtener movimientos
    async getMovements(tenantId, filters = {}) {
        return InventoryMovement.find({ tenantId, ...filters })
            .populate('product', 'sku name')
            .populate('user', 'firstName lastName')
            .sort({ createdAt: -1 })
            .limit(50);
    }

    // Obtener movimiento por ID
    async getMovementById(tenantId, movementId) {
        const movement = await InventoryMovement.findOne({ _id: movementId, tenantId });
        if (!movement) throw new NotFoundError('Movimiento', movementId);
        return movement;
    }

    // Procesar movimiento con transacción MongoDB
    async processMovement(tenantId, data, session = null) {
        const {
            type, productId, quantity, userId, reason, notes,
            fromWarehouse, toWarehouse, supplier, unitCost, batchNumber
        } = data;

        // Validar producto
        const product = await Product.findOne({ _id: productId, tenantId, isDeleted: false });
        if (!product) throw new NotFoundError('Producto', productId);

        // Validar stock para salidas
        if (type === MOVEMENT_TYPES.SALIDA && product.stock < quantity) {
            throw new InsufficientStockError(product.name, product.stock, quantity);
        }

        // Generar referencia
        const reference = await InventoryMovement.generateReference(type, tenantId);

        // Crear movimiento
        const movement = new InventoryMovement({
            tenantId,
            reference,
            type,
            product: productId,
            quantity,
            user: userId,
            reason: reason || 'otro',
            notes: notes || '',
            fromWarehouse,
            toWarehouse,
            supplier: supplier || '',
            status: STATUS.COMPLETED,
            unitCost: unitCost || product.cost,
            totalCost: (unitCost || product.cost) * quantity,
            batchNumber: batchNumber || '',
            event: {
                who: userId,
                what: `${type}_inventario`,
                when: new Date(),
                why: reason || 'operacion'
            }
        });

        // Actualizar stock del producto
        if (type === MOVEMENT_TYPES.ENTRADA) {
            product.stock += quantity;
        } else if (type === MOVEMENT_TYPES.SALIDA) {
            product.stock -= quantity;
        }
        // Transferencias no modifican stock global (simplificado)

        await product.save();
        await movement.save();

        // Registrar evento
        await Event.log({
            tenantId,
            entity: 'movement',
            entityId: movement._id,
            action: 'create',
            user: userId,
            newState: movement.toObject(),
            description: `${type} de ${quantity} unidades de ${product.sku}`
        });

        logger.inventory(type.toUpperCase(), productId, quantity, { reference });

        return movement;
    }

    // Procesar movimiento con transacción atómica
    async processMovementWithTransaction(tenantId, data) {
        const session = await mongoose.startSession();
        
        try {
            session.startTransaction();
            
            const movement = await this.processMovement(tenantId, data, session);
            
            await session.commitTransaction();
            return movement;
            
        } catch (error) {
            await session.abortTransaction();
            logger.error('Transacción fallida', { error: error.message });
            throw new TransactionError(error.message);
        } finally {
            session.endSession();
        }
    }

    // Entrada de inventario
    async createEntrada(tenantId, data, userId) {
        return this.processMovementWithTransaction(tenantId, {
            ...data,
            type: MOVEMENT_TYPES.ENTRADA,
            userId
        });
    }

    // Salida de inventario
    async createSalida(tenantId, data, userId) {
        return this.processMovementWithTransaction(tenantId, {
            ...data,
            type: MOVEMENT_TYPES.SALIDA,
            userId
        });
    }

    // Transferencia
    async createTransferencia(tenantId, data, userId) {
        return this.processMovementWithTransaction(tenantId, {
            ...data,
            type: MOVEMENT_TYPES.TRANSFERENCIA,
            userId
        });
    }

    // Cancelar movimiento
    async cancelMovement(tenantId, movementId, userId) {
        const movement = await this.getMovementById(tenantId, movementId);
        
        if (movement.status === STATUS.CANCELLED) {
            throw new TransactionError('Movimiento ya cancelado');
        }

        // Revertir stock
        const product = await Product.findOne({ 
            _id: movement.product, 
            tenantId 
        });
        
        if (product && movement.type === MOVEMENT_TYPES.ENTRADA) {
            product.stock -= movement.quantity;
        } else if (product && movement.type === MOVEMENT_TYPES.SALIDA) {
            product.stock += movement.quantity;
        }
        
        await product.save();
        
        // Cancelar movimiento
        movement.status = STATUS.CANCELLED;
        await movement.save();

        await Event.log({
            tenantId,
            entity: 'movement',
            entityId: movement._id,
            action: 'update',
            user: userId,
            description: `Movimiento ${movement.reference} cancelado`
        });

        return movement;
    }

    // Obtener movimientos recientes
    async getRecentMovements(tenantId, limit = 10) {
        return InventoryMovement.findRecent(tenantId, limit);
    }

    // Resumen de movimientos
    async getSummary(tenantId) {
        const movementStats = await InventoryMovement.aggregate([
            { $match: { tenantId } },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            }
        ]);

        return {
            entrada: movementStats.find(m => m._id === MOVEMENT_TYPES.ENTRADA)?.count || 0,
            salida: movementStats.find(m => m._id === MOVEMENT_TYPES.SALIDA)?.count || 0,
            transferencia: movementStats.find(m => m._id === MOVEMENT_TYPES.TRANSFERENCIA)?.count || 0
        };
    }

    // Obtener todas las bodegas
    async getWarehouses(tenantId) {
        return Warehouse.find({ tenantId, isDeleted: false }).sort({ name: 1 });
    }

    // Obtener bodega por ID
    async getWarehouseById(tenantId, warehouseId) {
        const warehouse = await Warehouse.findOne({ _id: warehouseId, tenantId, isDeleted: false });
        if (!warehouse) throw new NotFoundError('Bodega', warehouseId);
        return warehouse;
    }

    // Crear bodega
    async createWarehouse(tenantId, data, userId) {
        const warehouse = new Warehouse({
            ...data,
            tenantId
        });
        await warehouse.save();
        return warehouse;
    }

    // Actualizar bodega
    async updateWarehouse(tenantId, warehouseId, data, userId) {
        const warehouse = await this.getWarehouseById(tenantId, warehouseId);
        Object.assign(warehouse, data);
        await warehouse.save();
        return warehouse;
    }
}

module.exports = new WarehouseService();