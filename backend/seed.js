/**
 * GProA - Seed Data (Enterprise)
 * backend/seed.js
 * 
 * Script para poblar datos de prueba con tenant
 * Ejecutar: node backend/seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, closeDB } = require('./models/db');
const Product = require('./models/Product');
const User = require('./models/User');
const Warehouse = require('./models/Warehouse');
const { PRODUCT_STATUS, ROLES, STATUS } = require('./utils/validator');

// ID de tenant por defecto
const DEFAULT_TENANT_ID = new mongoose.Types.ObjectId();

const seedData = async () => {
    try {
        await connectDB();
        console.log('🌱 Iniciando seed data enterprise...\n');

        // Limpiar colecciones
        await Product.deleteMany({});
        await User.deleteMany({});
        await Warehouse.deleteMany({});
        console.log('✅ Datos anteriores eliminados');

        // Crear usuario admin
        const adminUser = new User({
            tenantId: DEFAULT_TENANT_ID,
            email: 'admin@gproa.com',
            firstName: 'Admin',
            lastName: 'GProA',
            phone: '5551234567',
            role: ROLES.ADMIN,
            department: 'Administración',
            password: 'admin123',
            status: STATUS.COMPLETED,
            permissions: ['*']
        });
        await adminUser.save();
        console.log('✅ Usuario admin creado');

        // Crear vendedor
        const seller = new User({
            tenantId: DEFAULT_TENANT_ID,
            email: 'vendedor@gproa.com',
            firstName: 'Juan',
            lastName: 'Pérez',
            phone: '5551234568',
            role: ROLES.SELLER,
            department: 'Ventas',
            password: 'vendedor123',
            status: STATUS.COMPLETED
        });
        await seller.save();
        console.log('✅ Usuario vendedor creado');

        // Crear bodega
        const warehouse = new Warehouse({
            tenantId: DEFAULT_TENANT_ID,
            name: 'BODEGA CENTRAL',
            location: 'Av. Principal 123',
            capacity: 5000,
            used: 0,
            status: STATUS.COMPLETED,
            description: 'Bodega principal'
        });
        await warehouse.save();
        console.log('✅ Bodega creada');

        // Crear productos
        const products = [
            { sku: 'LAC-001', name: 'Leche Entera 1L', category: 'Lácteos', price: 28, cost: 22, stock: 150, minStock: 50 },
            { sku: 'LAC-002', name: 'Yogurth Natural 500g', category: 'Lácteos', price: 35, cost: 28, stock: 80, minStock: 30 },
            { sku: 'BEB-001', name: 'Agua Mineral 600ml', category: 'Bebidas', price: 15, cost: 10, stock: 200, minStock: 100 },
            { sku: 'BEB-002', name: 'Jugo de Naranja 1L', category: 'Bebidas', price: 32, cost: 25, stock: 45, minStock: 40 },
            { sku: 'SNK-001', name: 'Papas Fritas 150g', category: 'Snacks', price: 25, cost: 18, stock: 100, minStock: 50 },
            { sku: 'SNK-002', name: 'Galletas Chocolate 200g', category: 'Snacks', price: 28, cost: 20, stock: 15, minStock: 30 },
            { sku: 'ALI-001', name: 'Arroz Premium 1kg', category: 'Alimentos', price: 45, cost: 38, stock: 200, minStock: 80 },
            { sku: 'ALI-002', name: 'Frijol Negro 1kg', category: 'Alimentos', price: 38, cost: 30, stock: 60, minStock: 40 },
            { sku: 'LIM-001', name: 'Jabón Líquido 500ml', category: 'Limpieza', price: 42, cost: 35, stock: 75, minStock: 30 },
            { sku: 'LIM-002', name: 'Cloro 1L', category: 'Limpieza', price: 25, cost: 18, stock: 5, minStock: 25 }
        ];

        for (const p of products) {
            const product = new Product({
                tenantId: DEFAULT_TENANT_ID,
                ...p,
                status: PRODUCT_STATUS.ACTIVE,
                createdBy: adminUser._id
            });
            await product.save();
        }
        console.log(`✅ ${products.length} productos creados`);

        console.log('\n========================================');
        console.log('🌱 Seed data enterprise completado');
        console.log('========================================');
        console.log(`📋 Tenant ID: ${DEFAULT_TENANT_ID}`);
        console.log('📧 Credenciales:');
        console.log('   Admin: admin@gproa.com / admin123');
        console.log('   Vendedor: vendedor@gproa.com / vendedor123');
        console.log('========================================\n');

        await closeDB();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error en seed:', error.message);
        await closeDB();
        process.exit(1);
    }
};

seedData();