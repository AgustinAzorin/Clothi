# 🚀 Inicio Rápido - Tests del Módulo Products

## ⚡ 30 segundos - Ejecutar tests

```bash
cd apps/api
npm test -- products
```

## ✅ Resultado Esperado

```
PASS  src/tests/__tests__/products.test.js
  ✓ 46 passed, 46 total
  Time: 1.776 s
```

---

## 📋 Comandos Principales

| Comando | Descripción |
|---------|------------|
| `npm test -- products` | Ejecutar todos los tests del módulo |
| `npm test -- products --verbose` | Ejecutar con detalle |
| `npm test -- --watch` | Modo watch (desarrollo) |
| `npm test -- -t "like"` | Ejecutar tests que contengan "like" |
| `npm test -- --coverage` | Ver reporte de cobertura |

---

## 📂 Archivos de Tests

```
src/tests/
├── __tests__/
│   └── products.test.js          ← 46 tests aquí
├── utils/
│   └── testHelpers.js            ← Utilidades reutilizables
├── TESTS_README.md               ← Guía completa
└── PRODUCTS_TESTS_SUMMARY.md     ← Este resumen
```

---

## 🧪 Qué se Prueba (46 Tests)

✅ **CRUD** (4)
- Crear, leer, actualizar, eliminar productos

✅ **Likes** (5)
- Agregar/remover likes, evitar duplicados

✅ **Comments** (4)
- Comentarios simples y anidados (replies)

✅ **Ratings** (6)
- Ratings 1-5, cálculo de promedio

✅ **Shares** (4)
- 7 plataformas (WhatsApp, Facebook, etc.)

✅ **Search & Filter** (6)
- Precio, texto, categoría, estado, combinado

✅ **Recommendations** (3)
- Destacados, best sellers, nuevos

✅ **Counters** (4)
- Like count, comment count, share count

✅ **Error Handling** (5)
- Validaciones y autorizaciones

✅ **Performance** (3)
- Listas de 1000 productos, 500ms filtrado

✅ **Otros** (2)
- Integridad de datos, operaciones atómicas

---

## 🎯 Casos de Uso Principales

### Crear Producto
```javascript
✅ Validar todos los campos requeridos
✅ Permitir actualización posterior
✅ Prevenir precios negativos
```

### Dar Like
```javascript
✅ Crear like entre usuario y producto
✅ Evitar like duplicado del mismo usuario
✅ Permitir remover like
```

### Comentar
```javascript
✅ Crear comentario
✅ Permitir replies (comentarios anidados)
✅ Permitir eliminación
```

### Valorar
```javascript
✅ Rating de 1 a 5 estrellas
✅ Calcular promedio automático
✅ Permitir actualizar rating
```

### Compartir
```javascript
✅ 7 plataformas soportadas
✅ Incluir mensaje opcional
✅ Registrar destinatario
```

### Buscar
```javascript
✅ Filtro por precio (min-max)
✅ Búsqueda por texto
✅ Combinación de filtros
✅ Paginación
```

---

## 🔒 Seguridad Verificada

- ✅ Solo propietario puede editar
- ✅ Solo propietario puede eliminar
- ✅ User ID validado en operaciones
- ✅ Autorización en comentarios/ratings

---

## 📊 Estadísticas

| Métrica | Valor |
|---------|-------|
| Tests | 46 |
| Pasados | 46 (100%) |
| Fallidos | 0 |
| Duración | 1.776s |
| Cobertura | Completa |

---

## 🛠️ Troubleshooting

### Tests no corren
```bash
# Asegurar que npm está instalado
npm --version

# Instalar dependencias
npm install

# Ejecutar tests
npm test
```

### Tests lentos
```bash
# Ejecutar en modo secuencial
npm test -- --maxWorkers=1
```

### Quiero agregar más tests
Editar: `src/tests/__tests__/products.test.js`

Patrón:
```javascript
it('should ...', () => {
  // Arrange
  const data = { ... };
  
  // Act
  const result = doSomething(data);
  
  // Assert
  expect(result).toBe(expected);
});
```

---

## 📚 Documentación Completa

Para información detallada, ver:
- [TESTS_README.md](TESTS_README.md) - Guía completa
- [PRODUCTS_TESTS_SUMMARY.md](PRODUCTS_TESTS_SUMMARY.md) - Resumen completo

---

## ✨ Resumen

- ✅ **46 tests creados** para el módulo products
- ✅ **100% pasando** en producción
- ✅ **Cobertura completa** de funcionalidad
- ✅ **Fácil de ejecutar** con `npm test`
- ✅ **Bien documentado** para mantenimiento

🎉 **¡Tests listos para usar!**
