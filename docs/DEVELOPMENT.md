# 🔧 Guía de Desarrollo

## Estándares de Código

### JavaScript/Node.js

```javascript
// ✅ Bueno
const getUserById = async (id) => {
    const user = await User.findById(id);
    return user;
};

// ❌ Evitar
function getuser(id){
    return User.findById(id);
}
```

### Naming Conventions

- Variables y funciones: `camelCase`
- Clases: `PascalCase`
- Constantes: `UPPER_SNAKE_CASE`
- Archivos: `kebab-case` o `camelCase`

### Estructura de Rutas

```javascript
router.get('/', (req, res) => {
    // GET all items
});

router.get('/:id', (req, res) => {
    // GET single item
});

router.post('/', (req, res) => {
    // CREATE item
});

router.put('/:id', (req, res) => {
    // UPDATE item
});

router.delete('/:id', (req, res) => {
    // DELETE item
});
```

---

## Estructura de Respuestas API

### Exitosa

```json
{
  "status": "success",
  "message": "Operación completada",
  "data": { ... }
}
```

### Error

```json
{
  "status": "error",
  "message": "Descripción del error",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

---

## Flujo de Trabajo Git

```bash
# 1. Crear rama
git checkout -b feature/nueva-funcionalidad

# 2. Hacer cambios
git add .
git commit -m "feat: descripción clara"

# 3. Push a rama
git push origin feature/nueva-funcionalidad

# 4. Crear Pull Request en GitHub

# 5. Merge a main después de aprobación
git checkout main
git merge feature/nueva-funcionalidad
```

### Mensaje de Commit

Usar conventional commits:

- `feat:` Nueva característica
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Cambios de formato
- `refactor:` Refactorización de código
- `test:` Agregar/actualizar tests
- `chore:` Tareas de build, dependencies, etc

Ejemplo:
```bash
git commit -m "feat: agregar predicción de ventas AI"
git commit -m "fix: corregir error en cálculo de inventario"
git commit -m "docs: actualizar README"
```

---

## Agregar Nueva Funcionalidad

### 1. Nueva Ruta API

**backend/routes/nuevaRoutes.js**
```javascript
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ status: 'success', data: [] });
});

module.exports = router;
```

**backend/server.js**
```javascript
const nuevaRoutes = require('./routes/nuevaRoutes');
app.use('/api/nueva', nuevaRoutes);
```

### 2. Nueva Sección Frontend

**Agregar en index.html:**
```html
<button class="nav-item" data-section="nueva">
    <i class="fas fa-icon"></i>
    <span>Nueva Sección</span>
</button>

<section id="nueva-section" class="section">
    <!-- Contenido aquí -->
</section>
```

**Estilos en style.css:**
```css
#nueva-section {
    /* estilos específicos */
}
```

**Lógica en script.js:**
```javascript
// Ya funciona automáticamente con data-section
```

### 3. Nuevo Modelo MongoDB

**database/mongodb-schema.json**
```json
{
  "collections": {
    "nueva_coleccion": {
      "schema": {
        "field": { "type": "string" }
      }
    }
  }
}
```

---

## Debugging

### Node.js

```bash
# Activar modo debug
node --inspect backend/server.js

# Luego acceder a chrome://inspect en Chrome
```

### Browser

```javascript
// Usar console en script.js
console.log('Debug:', variable);
console.error('Error:', error);
console.table(datos);
```

### API Requests

Usar Postman o Thunder Client:
- GET http://localhost:3000/api/health
- POST http://localhost:3000/api/sales
- PUT http://localhost:3000/api/products/SKU-001
- DELETE http://localhost:3000/api/products/SKU-001

---

## Testing (Futuro)

```bash
npm install --save-dev jest

npm test
```

**Ejemplo de test:**
```javascript
describe('Inventario API', () => {
    test('Debe obtener productos', async () => {
        const response = await request(app).get('/api/inventory/products');
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
    });
});
```

---

## Performance

### Frontend

- Minimizar JavaScript
- Lazy loading de imágenes
- Caché de datos
- Compresión de CSS

### Backend

- Índices en MongoDB
- Caching de respuestas
- Paginación de resultados
- Compresión gzip

---

## Seguridad

### Validación

```javascript
const { body, validationResult } = require('express-validator');

router.post('/products', [
    body('sku').isLength({ min: 1 }),
    body('price').isFloat({ min: 0 }),
    body('name').trim().notEmpty()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    // Procesar
});
```

### Autenticación (v1.1+)

```javascript
const jwt = require('jwt-simple');

const authenticate = (req, res, next) => {
    const token = req.headers.authorization;
    try {
        req.user = jwt.decode(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }
};

router.get('/protected', authenticate, (req, res) => {
    // Solo usuarios autenticados
});
```

---

## Recursos

- [Node.js Docs](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [REST API Best Practices](https://restfulapi.net/)
- [JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)

---

*Última actualización: Mayo 14, 2024*
