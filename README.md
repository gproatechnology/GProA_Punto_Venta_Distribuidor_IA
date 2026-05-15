# 🚀 GProA - Sistema de Punto de Venta Distribuidor IA

**Solución empresarial moderna para distribuidores, bodegas y comercios** con gestión completa de inventario, punto de venta, trazabilidad e inteligencia artificial.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-Active%20Development-brightgreen)
![Node](https://img.shields.io/badge/node-18.0+-brightgreen)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Uso](#-uso)
- [API Endpoints](#-api-endpoints)
- [Roadmap](#-roadmap)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

---

## ✨ Características

### 📊 Dashboard Administrativo
- Métricas en tiempo real de ventas
- KPIs de inventario y desempeño
- Gráficos interactivos y análisis visual
- Últimos movimientos y actividades
- Alertas de stock y anomalías

### 🛒 Punto de Venta (POS)
- Interfaz moderna y responsive
- Gestión rápida de transacciones
- Múltiples métodos de pago
- Historial de ventas completo
- Integración con inventario en tiempo real

### 📦 Gestión de Inventario
- Control completo de productos
- Alertas de stock bajo
- Categorización automática
- Códigos de barras y SKU
- Rotación de inventario

### 🏢 Control de Bodega
- Movimientos de entrada/salida
- Transferencias entre ubicaciones
- Capacidad y utilización
- Control de temperatura
- Gestión de ubicaciones

### 👥 Gestión de Trabajadores
- Perfiles de empleados
- Sistema de roles y permisos
- Seguimiento de productividad
- Historial de actividades
- Control de asistencia

### 🔍 Trazabilidad Completa
- Rastreo de productos por lote
- Línea de tiempo de movimientos
- Documentos asociados
- Historial completo de trazabilidad
- Conformidad normativa

### 📈 Reportes Avanzados
- Reporte de ventas
- Análisis de inventario
- Eficiencia de bodega
- Productividad de empleados
- Análisis de rentabilidad
- Exportación a Excel/PDF

### 🤖 AI Analytics (Beta)
- **Predicción de Ventas**: Modelos ARIMA y Prophet
- **Recomendaciones Inteligentes**: Optimización de stock y precios
- **Detección de Anomalías**: Identificación de comportamientos inusuales
- **OCR de Documentos**: Captura automática de datos
- **Forecasting Avanzado**: Deep Learning para demanda
- **Segmentación de Clientes**: Clustering automático

---

## 🛠 Tecnologías

### Frontend
- **HTML5** - Estructura semántica
- **CSS3** - Diseño responsive y moderno
- **JavaScript Vanilla** - Sin dependencias pesadas
- **Font Awesome 6** - Iconografía

### Backend
- **Node.js 18+** - Runtime JavaScript
- **Express.js 4** - Framework web
- **CORS** - Control de acceso
- **Body Parser** - Parsing de requests

### Base de Datos
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **Schema validation** - Validación de datos

---

## 📦 Instalación

### Requisitos Previos
- Node.js 18.0 o superior
- npm 9.0 o superior

### Pasos

```bash
# Clonar
git clone https://github.com/gproatechnology/GProA_Punto_Venta_Distribuidor_IA.git
cd GProA_Punto_Venta_Distribuidor_IA

# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Producción
npm start
```

Acceder: http://localhost:3000

---

## 📁 Estructura

```
GProA_Punto_Venta_Distribuidor_IA/
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── backend/
│   ├── server.js
│   └── routes/
├── database/
│   └── mongodb-schema.json
├── package.json
└── README.md
```

---

## 🚀 Uso

Navegar entre secciones usando el menú lateral:
1. **Dashboard** - Overview del negocio
2. **Punto de Venta** - Registro de ventas
3. **Inventario** - Gestión de productos
4. **Bodega** - Control de almacenamiento
5. **Trazabilidad** - Rastreo de productos
6. **Trabajadores** - Gestión de personal
7. **Reportes** - Análisis e informes
8. **AI Analytics** - Funcionalidades de IA

---

## 🔌 API Endpoints

### Inventario
```
GET    /api/inventory/products
POST   /api/inventory/products
GET    /api/inventory/products/:sku
```

### Ventas
```
GET    /api/sales
POST   /api/sales
GET    /api/sales/:id
```

### Bodega
```
GET    /api/warehouse
POST   /api/warehouse/movements/entrada
POST   /api/warehouse/movements/salida
```

### Reportes
```
GET    /api/reports
GET    /api/reports/sales
GET    /api/reports/inventory
```

### AI Analytics
```
GET    /api/ai-analytics/predictions/sales
GET    /api/ai-analytics/recommendations
GET    /api/ai-analytics/anomalies
```

---

## 📋 Roadmap

### v1.0 ✅
- Dashboard administrativo
- Sistema POS
- Gestión de inventario
- Control de bodega
- AI Analytics (Beta)

### v1.1 🔄
- Autenticación JWT
- Códigos QR
- Notificaciones
- App Offline

### v2.0
- Migración a React
- Microservicios
- ML Models avanzados
- App Móvil

---

## 🤝 Contribución

Fork → Branch → Commit → Pull Request

---

## 📄 Licencia

MIT License - Ver LICENSE

---

## 📞 Soporte

- 📧 Email: support@gproa.com
- 🌐 Website: https://gproa.com

**GProA - Transformando distribuidores a través de la tecnología**
* Automatizaciones

---

# Integraciones Futuras

* ZWCAD
* AutoCAD DXF/DWG workflows
* WhatsApp Business API
* Facturación SAT
* Lectores QR
* Impresoras térmicas
* RFID

---

# Objetivo Comercial

Construir una solución:

* Escalable
* Modular
* Económica
* Inteligente
* Fácil de implementar

Orientada a:

* Distribuidores
* Bodegas
* Negocios medianos
* Empresas de logística
* Reparto y ventas

---

# Licencia

Proyecto privado desarrollado por GProA Technology.

Todos los derechos reservados.

---

# Autor

GProA Technology

Innovación • Automatización • Inteligencia Artificial
