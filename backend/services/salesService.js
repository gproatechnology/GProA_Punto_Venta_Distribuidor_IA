/**
 * GProA - Sales Service (con Transacciones)
 * backend/services/salesService.js
 */

const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const InventoryMovement = require('../models/InventoryMovement');
const Event = require('../models/Event');
const logger = require('../utils/logger');
const { NotFoundError, TransactionError, InsufficientStockError } = require('../utils/errors');
const { STATUS } = require('../utils/validator');

class SalesService {
    // Obtener ventas
    async getSales(tenantId, filters = {}) {
        return Sale.find({ tenantId, ...filters })
            .populate('seller', 'firstName lastName')
            .sort({ date: -1 })
            .limit(50);
    }

    // Obtener venta por ID
    async getSaleById(tenantId, saleId) {
        const sale = await Sale.findOne({ _id: saleId, tenantId })
            .populate('seller', 'firstName lastName')
            .populate('items.product', 'sku name');
        
        if (!sale) throw new NotFoundError('Venta', saleId);
        return sale;
    }

    // Crear venta con transacción atómica
    async createSale(tenantId, data, userId) {
        const session = await mongoose.startSession();
        
        try {
            session.startTransaction();
            
            const result = await this._createSale(tenantId, data, userId, session);
            
            await session.commitTransaction();
            return result;
            
        } catch (error) {
            await session.abortTransaction();
            logger.error('Transacción de venta fallida', { error: error.message });
            throw new TransactionError(error.message);
        } finally {
            session.endSession();
        }
    }

    // Lógica interna de creación de venta
    async _createSale(tenantId, data, userId, session) {
        const { items, customer, paymentMethod, paymentDetails, discount, discountType, discountValue, notes } = data;

        if (!items || items.length === 0) {
            throw new TransactionError('La venta debe tener al menos un producto');
        }

        // Validar stock y calcular totales
        let saleItems = [];
        let subtotal = 0;

        for (const item of items) {
            const product = await Product.findOne({ 
                _id: item.product, 
                tenantId,
                isDeleted: false 
            }).session(session);

            if (!product) {
                throw new NotFoundError('Producto', item.product);
            }

            if (product.stock < item.quantity) {
                throw new InsufficientStockError(product.name, product.stock, item.quantity);
            }

            const itemSubtotal = product.price * item.quantity;
            saleItems.push({
                product: product._id,
                sku: product.sku,
                name: product.name,
                quantity: item.quantity,
                unitPrice: product.price,
                discount: item.discount || 0,
                subtotal: itemSubtotal - (item.discount || 0)
            });

            subtotal += itemSubtotal - (item.discount || 0);

            // Decrementar stock
            product.stock -= item.quantity;
            await product.save({ session });
        }

        // Calcular descuento
        let totalDiscount = discount || 0;
        if (discountType === 'percentage') {
            totalDiscount = subtotal * (discountValue || 0) / 100;
        } else if (discountType === 'fixed') {
            totalDiscount = discountValue || 0;
        }

        const total = subtotal - totalDiscount;

        // Generar ticket
        const ticketNumber = await Sale.generateTicketNumber(tenantId);

        // Crear venta
        const sale = new Sale({
            tenantId,
            ticketNumber,
            date: new Date(),
            customer: customer || '',
            items: saleItems,
            subtotal,
            tax: 0,
            discount: totalDiscount,
            total,
            paymentMethod: paymentMethod || 'cash',
            paymentDetails,
            seller: userId,
            status: STATUS.COMPLETED,
            notes: notes || '',
            discountType: discountType || 'none',
            discountValue: discountValue || 0,
            createdBy: userId
        });

        await sale.save({ session });

        // Crear movimientos de inventario
        for (const item of saleItems) {
            const reference = await InventoryMovement.generateReference('salida', tenantId);
            
            const movement = new InventoryMovement({
                tenantId,
                reference,
                type: 'salida',
                product: item.product,
                quantity: item.quantity,
                user: userId,
                reason: 'venta',
                notes: `Venta ${ticketNumber}`,
                status: STATUS.COMPLETED,
                unitCost: 0,
                totalCost: 0,
                event: {
                    who: userId,
                    what: 'venta',
                    when: new Date(),
                    why: 'venta_pos'
                }
            });

            await movement.save({ session });
        }

        // Registrar evento
        await Event.log({
            tenantId,
            entity: 'sale',
            entityId: sale._id,
            action: 'create',
            user: userId,
            newState: sale.toObject(),
            description: `Venta ${ticketNumber} por ${total}`
        });

        logger.info('Venta creada', { ticketNumber, total, items: saleItems.length });

        return sale;
    }

    // Cancelar venta
    async cancelSale(tenantId, saleId, userId) {
        const session = await mongoose.startSession();
        
        try {
            session.startTransaction();
            
            const sale = await Sale.findOne({ _id: saleId, tenantId }).session(session);
            
            if (!sale) {
                throw new NotFoundError('Venta', saleId);
            }

            if (sale.status === STATUS.CANCELLED) {
                throw new TransactionError('Venta ya cancelada');
            }

            // Revertir stock
            for (const item of sale.items) {
                const product = await Product.findOne({ 
                    _id: item.product, 
                    tenantId 
                }).session(session);
                
                if (product) {
                    product.stock += item.quantity;
                    await product.save({ session });
                }
            }

            // Cancelar venta
            sale.status = STATUS.CANCELLED;
            sale.isDeleted = true;
            sale.deletedAt = new Date();
            sale.deletedBy = userId;
            await sale.save({ session });

            await Event.log({
                tenantId,
                entity: 'sale',
                entityId: sale._id,
                action: 'delete',
                user: userId,
                description: `Venta ${sale.ticketNumber} cancelada`
            });

            await session.commitTransaction();
            return sale;
            
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    // Obtener ventas del día
    async getTodaySales(tenantId) {
        return Sale.findToday(tenantId);
    }

    // Resumen de ventas
    async getSalesSummary(tenantId, startDate, endDate) {
        return Sale.getSalesSummary(tenantId, startDate, endDate);
    }

    // Ventas por período
    async getSalesByPeriod(tenantId, startDate, endDate) {
        return Sale.find({ tenantId })
            .where('date').gte(startDate).lte(endDate)
            .where('status', STATUS.COMPLETED)
            .populate('seller', 'firstName lastName')
            .sort({ date: -1 });
    }

    // Ventas por vendedor
    async getSalesBySeller(tenantId, sellerId) {
        return Sale.find({ tenantId, seller: sellerId })
            .sort({ date: -1 });
    }
}

module.exports = new SalesService();