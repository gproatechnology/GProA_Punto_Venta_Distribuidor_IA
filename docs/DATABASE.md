# 🗄️ Documentación de Base de Datos

## MongoDB Schema

### Collections Principales

#### 1. **products** - Catálogo de Productos
```javascript
{
  _id: ObjectId,
  sku: String (unique),
  name: String,
  category: String,
  description: String,
  price: Number,
  cost: Number,
  stock: Number,
  minStock: Number,
  maxStock: Number,
  supplier: String,
  barcode: String (unique),
  status: String (active|inactive|discontinued),
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. **sales** - Transacciones de Venta
```javascript
{
  _id: ObjectId,
  ticketNumber: String (unique),
  date: Date,
  customer: String,
  items: [{
    sku: String,
    quantity: Number,
    price: Number,
    subtotal: Number
  }],
  subtotal: Number,
  tax: Number,
  total: Number,
  paymentMethod: String (cash|card|transfer),
  seller: String,
  status: String (completed|pending|cancelled),
  notes: String,
  createdAt: Date
}
```

#### 3. **warehouse_movements** - Movimientos de Bodega
```javascript
{
  _id: ObjectId,
  reference: String (unique),
  type: String (entrada|salida|transferencia),
  date: Date,
  product: String,
  quantity: Number,
  fromWarehouse: String,
  toWarehouse: String,
  supplier: String,
  user: String,
  status: String (pending|completed|cancelled),
  notes: String,
  createdAt: Date
}
```

#### 4. **warehouses** - Información de Bodegas
```javascript
{
  _id: ObjectId,
  name: String (unique),
  location: String,
  capacity: Number,
  used: Number,
  temperature: Number,
  humidity: Number,
  status: String (operational|maintenance|closed),
  manager: String,
  createdAt: Date
}
```

#### 5. **users** - Registro de Usuarios/Empleados
```javascript
{
  _id: ObjectId,
  email: String (unique),
  firstName: String,
  lastName: String,
  phone: String,
  role: String (admin|seller|warehouse_staff|manager),
  department: String,
  password: String (hash),
  status: String (active|inactive|suspended),
  permissions: [String],
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### 6. **roles** - Definición de Roles
```javascript
{
  _id: ObjectId,
  name: String (unique),
  description: String,
  permissions: [String],
  createdAt: Date
}
```

#### 7. **traceability** - Trazabilidad de Productos
```javascript
{
  _id: ObjectId,
  batchNumber: String (unique),
  product: String,
  supplier: String,
  quantity: Number,
  manufacturingDate: Date,
  expiryDate: Date,
  qcStatus: String (passed|failed|pending),
  storageLocation: String,
  movements: [{
    date: Date,
    type: String,
    from: String,
    to: String
  }],
  createdAt: Date
}
```

#### 8. **ai_predictions** - Predicciones IA
```javascript
{
  _id: ObjectId,
  type: String,
  target: String,
  prediction: Number,
  confidence: Number,
  model: String,
  generatedAt: Date,
  validity: Date
}
```

#### 9. **reports** - Reportes Generados
```javascript
{
  _id: ObjectId,
  type: String,
  title: String,
  data: Object,
  generatedBy: String,
  generatedAt: Date,
  periodStart: Date,
  periodEnd: Date
}
```

---

## Índices Recomendados

```javascript
// Products
db.products.createIndex({ sku: 1 })
db.products.createIndex({ category: 1 })
db.products.createIndex({ status: 1 })

// Sales
db.sales.createIndex({ date: -1 })
db.sales.createIndex({ seller: 1 })
db.sales.createIndex({ status: 1 })

// Warehouse Movements
db.warehouse_movements.createIndex({ type: 1 })
db.warehouse_movements.createIndex({ date: -1 })
db.warehouse_movements.createIndex({ product: 1 })

// Users
db.users.createIndex({ email: 1 })
db.users.createIndex({ role: 1 })
db.users.createIndex({ status: 1 })

// Traceability
db.traceability.createIndex({ batchNumber: 1 })
db.traceability.createIndex({ product: 1 })
db.traceability.createIndex({ expiryDate: 1 })
```

---

## Operaciones Comunes

### Insertar Producto
```javascript
db.products.insertOne({
  sku: 'SKU-001',
  name: 'Leche Integral 1L',
  category: 'Lácteos',
  price: 2.50,
  cost: 1.20,
  stock: 100,
  minStock: 20,
  maxStock: 500,
  status: 'active'
})
```

### Actualizar Stock
```javascript
db.products.updateOne(
  { sku: 'SKU-001' },
  { $inc: { stock: -10 } }
)
```

### Búsqueda de Productos
```javascript
db.products.find({
  category: 'Lácteos',
  stock: { $lt: 30 }
})
```

### Ventas por Período
```javascript
db.sales.aggregate([
  {
    $match: {
      date: {
        $gte: new Date('2024-05-01'),
        $lte: new Date('2024-05-31')
      }
    }
  },
  {
    $group: {
      _id: '$seller',
      totalSales: { $sum: '$total' },
      transactionCount: { $sum: 1 }
    }
  }
])
```

---

## Respaldos y Mantenimiento

### Respaldar Base de Datos
```bash
mongodump --db gproa --out ./backup

# O con MongoDB Atlas
# Descargar snapshot automático desde el dashboard
```

### Restaurar Base de Datos
```bash
mongorestore --db gproa ./backup/gproa
```

---

## Consideraciones de Performance

1. **Tamaño de Documentos**: Mantener documentos < 16MB
2. **Índices**: Indexar campos frecuentemente buscados
3. **Sharding**: Considerar para escalabilidad futura
4. **Replicación**: Para high availability
5. **Backup**: Hacer backup diario en producción

---

## Seguridad

1. **Autenticación**: Habilitar autenticación en MongoDB
2. **Encriptación**: Encriptar conexión (SSL/TLS)
3. **Validación**: Validar todos los datos antes de insertar
4. **Acceso**: Usar roles de MongoDB para control de acceso
5. **Logs**: Registrar todas las operaciones críticas

---

## Migraciones Futuras

### MongoDB → PostgreSQL (v2.0+)
- Análisis relacional más profundo
- Mejor para reportes complejos
- Mejor transaccionalidad

### Polyglot Persistence
- MongoDB para documentos
- Redis para caché
- Elasticsearch para búsquedas

---

*Última actualización: Mayo 14, 2024*
