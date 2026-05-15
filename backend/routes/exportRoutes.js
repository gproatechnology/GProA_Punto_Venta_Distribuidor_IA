/**
 * GProA - Export Routes
 * backend/routes/exportRoutes.js
 */

const express = require('express');
const router = express.Router();
const exporter = require('../utils/exporter');
const ExcelJS = require('exceljs');

// GET /api/export/:type - Exportar datos
router.get('/:type', async (req, res, next) => {
    try {
        const { type } = req.params;
        const { format = 'csv', ...filters } = req.query;

        let data = [];
        let filename = type;

        // Obtener datos según tipo
        switch (type) {
            case 'inventory':
                const inventoryService = require('../services/inventoryService');
                const products = await inventoryService.getAllProducts(filters);
                data = products.map(p => ({
                    SKU: p.sku,
                    Nombre: p.name,
                    Categoría: p.category,
                    Precio: p.price,
                    Costo: p.cost,
                    Stock: p.stock,
                    Stock_Mínimo: p.minStock,
                    Estado: p.isActive ? 'Activo' : 'Inactivo'
                }));
                filename = 'inventario';
                break;

            case 'sales':
                const salesService = require('../services/salesService');
                const sales = await salesService.getAllSales(filters);
                data = sales.map(s => ({
                    ID: s._id,
                    Fecha: s.createdAt,
                    Total: s.total,
                    Método_Pago: s.paymentMethod,
                    Estado: s.status,
                    Cliente: s.clientName || 'N/A'
                }));
                filename = 'ventas';
                break;

            case 'movements':
                const warehouseService = require('../services/warehouseService');
                const movements = await warehouseService.getAllMovements(filters);
                data = movements.map(m => ({
                    ID: m._id,
                    Producto: m.productId?.name || m.productId,
                    Tipo: m.type,
                    Cantidad: m.quantity,
                    Razón: m.reason,
                    Fecha: m.createdAt
                }));
                filename = 'movimientos';
                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: `Tipo de exportación no válido: ${type}`
                });
        }

        // Exportar según formato
        if (format === 'xlsx') {
            // Usar ExcelJS para mejor formato
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet(filename);

            // Headers
            if (data.length > 0) {
                const headers = Object.keys(data[0]);
                worksheet.addRow(headers);

                // Estilar headers
                worksheet.getRow(1).font = { bold: true };
                worksheet.getRow(1).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFE0E0E0' }
                };
            }

            // Datos
            data.forEach(row => {
                worksheet.addRow(Object.values(row));
            });

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=${filename}_${Date.now()}.xlsx`);

            await workbook.xlsx.write(res);
            res.end();
        } else {
            const exported = exporter.exportData(data, format, { filename });
            
            res.setHeader('Content-Type', exported.mimeType);
            res.setHeader('Content-Disposition', `attachment; filename=${exported.filename}`);
            
            res.send(exported.content);
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;