/**
 * GProA - Conexión a MongoDB
 * backend/models/db.js
 */

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gproa_punto_venta';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Configuración de conexión
const connectDB = async () => {
    try {
        const options = {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        // Agregar opciones específicas según el ambiente
        if (NODE_ENV === 'development') {
            options.dbName = 'gproa_punto_venta';
        }

        await mongoose.connect(MONGODB_URI, options);

        console.log('✅ Conexión a MongoDB establecida');
        console.log(`📦 Base de datos: ${mongoose.connection.name}`);
        console.log(`🔌 Host: ${mongoose.connection.host}`);

        // Event listeners para conexión
        mongoose.connection.on('error', (err) => {
            console.error('❌ Error de conexión MongoDB:', err.message);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ Conexión a MongoDB perdida');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('🔄 Reconectado a MongoDB');
        });

        return mongoose.connection;

    } catch (error) {
        console.error('❌ Error al conectar a MongoDB:', error.message);
        console.log('💡 Asegúrate de que MongoDB esté corriendo');
        process.exit(1);
    }
};

// Middleware para cerrar conexión al terminar
const closeDB = async () => {
    try {
        await mongoose.connection.close();
        console.log('📴 Conexión a MongoDB cerrada');
    } catch (error) {
        console.error('Error al cerrar conexión:', error.message);
    }
};

module.exports = { connectDB, closeDB, mongoose };