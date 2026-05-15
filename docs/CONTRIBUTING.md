# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir a GProA! Este documento explica el proceso.

## Código de Conducta

- ✅ Sé respetuoso
- ✅ Sé inclusivo
- ✅ Sé constructivo
- ❌ No hagas spam
- ❌ No hagas ataques personales

---

## Cómo Contribuir

### 1. Reportar Bugs

**Crear una Issue en GitHub:**

Título: `[BUG] Descripción breve del problema`

Descripción:
```
## Descripción
Descripción clara del bug

## Pasos para reproducir
1. Paso uno
2. Paso dos
3. Paso tres

## Resultado esperado
¿Qué debería suceder?

## Resultado actual
¿Qué sucede en realidad?

## Ambiente
- OS: [e.g. Ubuntu 24.04]
- Node: [e.g. 18.0.0]
- Navegador: [e.g. Chrome 125]
```

### 2. Sugerir Mejoras

**Crear una Issue de Feature:**

Título: `[FEATURE] Descripción de la funcionalidad`

Descripción:
```
## Descripción
¿Cuál es la funcionalidad que se solicita?

## Caso de uso
¿Por qué es útil?

## Beneficios
- Beneficio 1
- Beneficio 2

## Posible implementación
(Opcional) Cómo se podría implementar
```

### 3. Enviar Pull Request (PR)

#### Paso 1: Fork el Repositorio
```bash
# En GitHub, haz clic en "Fork"
```

#### Paso 2: Clonar tu Fork
```bash
git clone https://github.com/TU_USUARIO/GProA_Punto_Venta_Distribuidor_IA.git
cd GProA_Punto_Venta_Distribuidor_IA
```

#### Paso 3: Crear Rama de Feature
```bash
git checkout -b feature/mi-funcionalidad
```

#### Paso 4: Hacer Cambios
```bash
# Editar archivos
# Probar cambios
npm run dev
```

#### Paso 5: Commit
```bash
git add .
git commit -m "feat: descripción clara de cambios"
```

#### Paso 4: Push
```bash
git push origin feature/mi-funcionalidad
```

#### Paso 5: Crear Pull Request
- Ir a tu fork en GitHub
- Hacer clic en "Compare & pull request"
- Completar el template
- Hacer clic en "Create pull request"

---

## Template de Pull Request

```markdown
## 📝 Descripción
Descripción clara de los cambios

## 🔗 Issues Relacionadas
Cierra #NUMERO_ISSUE

## ✅ Checklist
- [ ] He probado estos cambios localmente
- [ ] He seguido el estilo de código del proyecto
- [ ] He actualizado la documentación
- [ ] He agregado/actualizado tests si es necesario

## 📸 Screenshots (si aplica)
[Agregar screenshots de cambios visuales]

## 🧪 Testing
Describir cómo probar los cambios
```

---

## Estándares de Código

### JavaScript

```javascript
// ✅ BUENO
const obtenerUsuarios = async (id) => {
    try {
        const usuario = await Usuario.findById(id);
        return usuario;
    } catch (error) {
        throw new Error('Error al obtener usuario');
    }
};

// ❌ NO HACER
function getusuarios(id){
    var u = Usuario.findById(id);
    return u;
}
```

### Commits

```bash
# ✅ BUENO
git commit -m "feat: agregar predicción de ventas"
git commit -m "fix: corregir error en cálculo de stock"
git commit -m "docs: actualizar guía de instalación"

# ❌ NO HACER
git commit -m "cambios"
git commit -m "fix bug"
git commit -m "actualizar archivos"
```

### HTML/CSS

```html
<!-- ✅ BUENO -->
<div class="container">
    <h2 class="heading">Título</h2>
    <button class="btn btn-primary">Enviar</button>
</div>

<!-- ❌ NO HACER -->
<div style="margin: 10px;">
    <h2 style="color: blue; font-size: 20px;">Título</h2>
    <button onclick="send()">Enviar</button>
</div>
```

---

## Áreas de Contribución

### Código
- Nuevas funcionalidades
- Corrección de bugs
- Optimización de performance
- Refactorización

### Documentación
- README
- Guías de instalación
- Ejemplos
- Comentarios en código

### Pruebas
- Unit tests
- Integration tests
- Tests de UI

### Traducción
- Documentación en otros idiomas
- Interfaz multiidioma

---

## Proceso de Revisión

1. **Revisión automática**: Tests y linting
2. **Revisión manual**: Uno o más maintainers
3. **Cambios solicitados**: Si es necesario
4. **Aprobación**: Cuando cumple los estándares
5. **Merge**: El cambio se fusiona a main

---

## Reconocimiento

Todos los contribuidores son reconocidos en:
- [CONTRIBUTORS.md](#)
- Página de GitHub del proyecto
- Changelog de cada versión

---

## Preguntas

¿Preguntas? Abre una Issue de "Question" o contacta:
- 📧 development@gproa.com
- 💬 Discord
- 🐦 Twitter

---

¡Gracias por contribuir a GProA! 🚀

*Última actualización: Mayo 14, 2024*
