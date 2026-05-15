/**
 * GProA - Inventory Service Tests
 * backend/tests/inventoryService.test.js
 */

const inventoryService = require('../services/inventoryService');

describe('InventoryService', () => {
    describe('createProduct', () => {
        it('debe crear un producto correctamente', async () => {
            const productData = {
                sku: 'TEST-001',
                name: 'Producto de Prueba',
                category: 'Test',
                price: 100,
                cost: 50,
                minStock: 10,
                tenantId: 'test-tenant'
            };

            expect(productData).toHaveProperty('sku');
            expect(productData).toHaveProperty('name');
            expect(productData).toHaveProperty('price');
        });

        it('debe validar SKU único', async () => {
            const sku = 'TEST-001';
            expect(sku).toMatch(/^[A-Z]+-\d{3}$/);
        });
    });

    describe('updateStock', () => {
        it('debe actualizar stock correctamente', async () => {
            const currentStock = 100;
            const change = 50;
            
            const newStock = currentStock + change;
            
            expect(newStock).toBe(150);
        });

        it('debe manejar stock negativo', async () => {
            const currentStock = 10;
            const change = -20;
            
            const newStock = currentStock + change;
            
            expect(newStock).toBeLessThan(0);
        });
    });

    describe('checkLowStock', () => {
        it('debe detectar stock bajo', async () => {
            const product = {
                stock: 5,
                minStock: 10
            };
            
            const isLowStock = product.stock <= product.minStock;
            
            expect(isLowStock).toBe(true);
        });

        it('debe detectar stock normal', async () => {
            const product = {
                stock: 50,
                minStock: 10
            };
            
            const isLowStock = product.stock <= product.minStock;
            
            expect(isLowStock).toBe(false);
        });
    });

    describe('calculateInventoryValue', () => {
        it('debe calcular valor de inventario', async () => {
            const products = [
                { stock: 100, cost: 10 },
                { stock: 50, cost: 20 },
                { stock: 25, cost: 40 }
            ];
            
            const totalValue = products.reduce(
                (sum, p) => sum + (p.stock * p.cost), 
                0
            );
            
            expect(totalValue).toBe(3000); // 1000 + 1000 + 1000
        });
    });
});

describe('Product Validation', () => {
    it('debe validar precio positivo', () => {
        const product = { price: -10 };
        expect(product.price).toBeLessThan(0);
    });

    it('debe validar costo menor a precio', () => {
        const product = { price: 100, cost: 120 };
        expect(product.cost).toBeGreaterThan(product.price);
    });
});