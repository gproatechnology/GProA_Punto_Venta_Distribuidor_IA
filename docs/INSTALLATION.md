# 📚 Documentación de Instalación y Configuración

## Instalación Local

### 1. Requisitos
- Node.js 18.0 o superior
- npm 9.0 o superior  
- MongoDB 5.0 o superior (opcional para desarrollo)
- Git

### 2. Clonar el Repositorio

```bash
git clone https://github.com/gproatechnology/GProA_Punto_Venta_Distribuidor_IA.git
cd GProA_Punto_Venta_Distribuidor_IA
```

### 3. Instalar Dependencias

```bash
npm install
```

### 4. Configurar Variables de Entorno

```bash
cp .env.example .env
```

Editar `.env` con tus valores (especialmente MONGODB_URI en producción)

### 5. Iniciar el Servidor

**Desarrollo (con auto-reload):**
```bash
npm run dev
```

**Producción:**
```bash
npm start
```

### 6. Acceder a la Aplicación

Abre tu navegador en: `http://localhost:3000`

---

## Configuración de MongoDB

### Local

```bash
# Instalar MongoDB (macOS con Homebrew)
brew tap mongodb/brew
brew install mongodb-community

# Instalar MongoDB (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install -y mongodb

# Iniciar servicio
mongod
```

### En la Nube (MongoDB Atlas)

1. Crear cuenta en https://www.mongodb.com/cloud/atlas
2. Crear un cluster gratuito
3. Obtener la URI de conexión
4. Actualizar `MONGODB_URI` en `.env`

---

## Estructura de Directorios

```
frontend/          → Interfaz web
├── index.html     → Página principal
├── style.css      → Estilos globales
└── script.js      → Lógica de aplicación

backend/           → API y lógica del servidor
├── server.js      → Configuración de Express
└── routes/        → Endpoints de API

database/          → Esquemas y configuración
└── mongodb-schema.json

docs/              → Documentación

package.json       → Dependencias y scripts
```

---

## Scripts Disponibles

```bash
npm start          # Iniciar en producción
npm run dev        # Iniciar en desarrollo (con nodemon)
npm test           # Ejecutar pruebas
npm run build      # Compilar para producción
```

---

## Troubleshooting

### Puerto 3000 ya en uso

```bash
# macOS/Linux
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Error: Cannot find module

```bash
rm -rf node_modules package-lock.json
npm install
```

### MongoDB Connection Error

- Verificar que MongoDB está corriendo
- Verificar MONGODB_URI en .env
- Verificar credenciales de autenticación

---

## Desarrollo

### Agregar nuevas rutas

1. Crear archivo en `backend/routes/`
2. Importar en `backend/server.js`
3. Usar `app.use('/api/nombre', routesFile)`

### Modificar Frontend

- Editar `frontend/index.html` para estructura
- Editar `frontend/style.css` para estilos
- Editar `frontend/script.js` para lógica

### Base de Datos

Ver `database/mongodb-schema.json` para estructura de colecciones

---

## Despliegue

### Heroku

```bash
heroku create gproa-app
git push heroku main
```

### Vercel

```bash
npm i -g vercel
vercel
```

### Docker

```bash
docker build -t gproa .
docker run -p 3000:3000 gproa
```

---

## Notas de Seguridad

- ⚠️ Cambiar JWT_SECRET en producción
- ⚠️ Usar HTTPS en producción
- ⚠️ Validar todas las entradas del usuario
- ⚠️ Usar variables de entorno para datos sensibles
- ⚠️ Implementar rate limiting
- ⚠️ Hacer backup regular de MongoDB

---

*Última actualización: Mayo 14, 2024*
