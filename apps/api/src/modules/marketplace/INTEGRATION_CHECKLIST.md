# ✅ CHECKLIST DE INTEGRACIÓN

## Pasos para Integrar la Refactorización

### 1️⃣ VERIFICACIÓN INICIAL
- [ ] Revisar `SUMMARY.md` para entender los cambios
- [ ] Leer `COMPARISON.md` para ver antes vs después
- [ ] Revisar archivos nuevos:
  - [ ] `recommendationService.js`
  - [ ] `recommendationController.js`
  - [ ] `recommendationService.test.js`

### 2️⃣ SETUP DE ROUTES
- [ ] Crear `routes/recommendationRoutes.js`:
```javascript
const express = require('express');
const router = express.Router();
const RecommendationController = require('../controller/recommendationController');
const { authMiddleware } = require('../../../middleware/auth');

router.get('/recommendations', 
    authMiddleware, 
    RecommendationController.getRecommendations
);

router.get('/products/:productId/related',
    RecommendationController.getRelatedProducts
);

module.exports = router;
```

- [ ] Importar en `routes/index.js`:
```javascript
const recommendationRoutes = require('./recommendationRoutes');
app.use('/api/marketplace', recommendationRoutes);
```

### 3️⃣ TESTING
- [ ] Instalar testing dependencies (si no existen):
```bash
npm install --save-dev jest supertest
```

- [ ] Ejecutar tests:
```bash
npm test tests/recommendationService.test.js
```

- [ ] Verificar cobertura:
```bash
npm test -- --coverage tests/recommendationService.test.js
```

- [ ] Todos los tests deben pasar ✅

### 4️⃣ VALIDACIÓN DE DATOS

#### 4.1 - Verificar Models
- [ ] Confirmar que `Product` tiene estos campos:
  - [ ] `id` (UUID)
  - [ ] `category_id` (UUID)
  - [ ] `status` (ENUM)
  - [ ] `stock_quantity` (INTEGER)
  - [ ] `is_featured` (BOOLEAN)
  - [ ] `purchase_count` (INTEGER)
  - [ ] `like_count` (INTEGER)
  - [ ] `view_count` (INTEGER)
  - [ ] `tags` (ARRAY)

- [ ] Confirmar que `Category` tiene:
  - [ ] `id` (UUID)
  - [ ] `name` (STRING)

#### 4.2 - Verificar Seeders/Fixtures
- [ ] Base de datos tiene al menos 20 productos PUBLISHED
- [ ] Al menos 3 categorías creadas
- [ ] Algunos productos con stats (purchase_count, likes, views)

### 5️⃣ ENDPOINTS TESTING

#### 5.1 - Test con cURL
```bash
# Test 1: Recomendaciones básicas
curl -X GET \
  'http://localhost:3000/api/marketplace/recommendations?preferredCategories=Electrónica,Gaming&limit=10' \
  -H 'Authorization: Bearer YOUR_TOKEN'

# Esperado: 200 OK con array de productos

# Test 2: Con productos vistos
curl -X GET \
  'http://localhost:3000/api/marketplace/recommendations?preferredCategories=Electrónica&recentlyViewedProductIds=P001,P002' \
  -H 'Authorization: Bearer YOUR_TOKEN'

# Esperado: 200 OK, sin P001 ni P002

# Test 3: Productos relacionados
curl -X GET \
  'http://localhost:3000/api/marketplace/products/PRODUCT_ID/related?limit=5'

# Esperado: 200 OK con productos de la misma categoría
```

#### 5.2 - Test con Postman
- [ ] Crear colección `Marketplace - Recommendations`
- [ ] Agregar requests:
  - [ ] `GET /recommendations` (sin parámetros)
  - [ ] `GET /recommendations` (con categorías)
  - [ ] `GET /recommendations` (con recientes vistos)
  - [ ] `GET /recommendations` (con marcas)
  - [ ] `GET /products/:id/related`

### 6️⃣ VALIDACIÓN DE SCORING

#### 6.1 - Test de Scoring Manual
```javascript
// En Postman o Node REPL
const RecommendationService = require('./services/recommendationService');

// Mock products
const products = [
  {
    id: 'P1',
    category_id: 'CAT1',
    is_featured: true,
    purchase_count: 10,
    like_count: 5,
    view_count: 100,
    tags: ['B_Sony']
  }
];

// Test scoring
const scored = RecommendationService._scoreProducts(products, {
  preferredCategoryIds: ['CAT1'],
  purchasedBrandIds: ['B_Sony']
});

console.log(scored[0].recommendationScore);
// Esperado: 100 (cat) + 50 (featured) + 50 (purchases) + 10 (likes) + 50 (views) + 30 (brand) = 290
```

### 7️⃣ SEGURIDAD

#### 7.1 - SQL Injection Test
- [ ] Intentar inyección en query params:
```bash
curl 'http://localhost:3000/api/marketplace/recommendations?preferredCategories=x%27%20OR%20%271%27=%271'
```
- [ ] Debe rechazar o escapar correctamente ✅

#### 7.2 - Validación de Input
- [ ] Test con arrays vacías → Debe funcionar
- [ ] Test con valores null → Debe manejar correctamente
- [ ] Test con strings especiales → Debe escapar

### 8️⃣ PERFORMANCE

#### 8.1 - Load Test
- [ ] Generar 100+ productos en BD
- [ ] Hacer 10 requests concurrentes
- [ ] Tiempo de respuesta debe ser < 500ms

```bash
# Usando Apache Bench
ab -n 100 -c 10 'http://localhost:3000/api/marketplace/recommendations?limit=20'
```

#### 8.2 - Memoria
- [ ] Revisar memory usage con `node --inspect`
- [ ] No debe crecer indefinidamente
- [ ] GC debe limpiar correctamente

### 9️⃣ DOCUMENTACIÓN

#### 9.1 - README Actualizado
- [ ] Agregar sección "Recomendaciones" con:
  - [ ] Descripción del sistema
  - [ ] Ejemplo de request
  - [ ] Explicación del scoring
  - [ ] Links a documentación

#### 9.2 - API Documentation
- [ ] Agregar OpenAPI/Swagger (Opcional):
```javascript
/**
 * @swagger
 * /api/marketplace/recommendations:
 *   get:
 *     summary: Get personalized product recommendations
 *     parameters:
 *       - name: preferredCategories
 *         in: query
 *         type: array
 */
```

### 🔟 DEPLOYMENT

#### 10.1 - Pre-Deploy Checklist
- [ ] Todos los tests pasan
- [ ] No hay warnings en linting
- [ ] Documentación es correcta
- [ ] CHANGELOG actualizado
- [ ] Versión en package.json incrementada

#### 10.2 - Database Migrations (si aplica)
- [ ] No se requieren migraciones (solo reads)
- [ ] Verificar índices en products table:
  - [ ] Index en `status`
  - [ ] Index en `category_id`
  - [ ] Index en `stock_quantity`

#### 10.3 - Environment Variables
- [ ] No se requieren nuevas variables de entorno
- [ ] Verificar que DATABASE_URL está configurada
- [ ] Redis URL (opcional, para caché futuro)

### 1️⃣1️⃣ POST-DEPLOYMENT

#### 11.1 - Monitoring
- [ ] Configurar logs en CloudWatch/Sentry:
```javascript
logger.info('recommendations_fetched', {
  userId,
  categoriesCount,
  recommendedCount,
  executionTime
});
```

#### 11.2 - Analytics
- [ ] Trackear eventos:
  - [ ] `recommendation_viewed`
  - [ ] `recommendation_clicked`
  - [ ] `recommendation_purchased`

#### 11.3 - User Feedback
- [ ] Agregar botón "¿Te fue útil?" en recomendaciones
- [ ] Guardar feedback para mejorar algoritmo

### 1️⃣2️⃣ ROLLBACK PLAN

Si algo sale mal:

1. [ ] Revertir cambios en repository:
```bash
git revert <commit-hash>
```

2. [ ] Desactivar nuevos endpoints:
```javascript
router.get('/recommendations', (req, res) => {
  res.status(503).json({ error: 'Service temporarily unavailable' });
});
```

3. [ ] Volver a endpoint anterior si existe:
```bash
git checkout old-branch -- apps/api/src/modules/marketplace/repositories/marketplaceRepository.js
```

---

## 📋 QUICK START SCRIPT

```bash
#!/bin/bash

# Setup
echo "1. Verificando archivos..."
test -f apps/api/src/modules/marketplace/services/recommendationService.js || echo "❌ Service no encontrado"
test -f apps/api/src/modules/marketplace/controller/recommendationController.js || echo "❌ Controller no encontrado"

# Install
echo "2. Instalando dependencias..."
cd apps/api
npm install

# Test
echo "3. Ejecutando tests..."
npm test tests/recommendationService.test.js

# Check
echo "4. Validando..."
npm run lint -- --fix

# Done
echo "✅ Setup completado!"
```

---

## 🔍 TROUBLESHOOTING

### Problema: "Cannot find module 'recommendationService'"
**Solución**: Verificar que el archivo está en:
```
apps/api/src/modules/marketplace/services/recommendationService.js
```

### Problema: Tests fallan
**Solución**: 
1. Verificar Node version (debe ser >= 14)
2. Instalar jest: `npm install --save-dev jest`
3. Ejecutar: `npm test -- --verbose`

### Problema: Queries lentas
**Solución**:
1. Verificar índices en DB
2. Aumentar `limit` en `getPublishedProductsWithStock()`
3. Implementar caché (ver ADVANCED_EXAMPLES.js)

### Problema: SQL Injection warning
**Verificar**: No usar `sequelize.literal()` en queries
```javascript
// ❌ MAL
sequelize.literal(`WHERE id IN (${ids})`)

// ✅ BIEN
{ id: { [Op.in]: ids } }
```

---

## ✅ SIGNOFF CHECKLIST

**Desarrollador**:
- [ ] Revisé toda la documentación
- [ ] Ejecuté todos los tests
- [ ] Validé endpoints manualmente
- [ ] No hay SQL injection
- [ ] Performance es aceptable

**Reviewer**:
- [ ] Aprobé el código
- [ ] Validé la arquitectura
- [ ] Verificé tests
- [ ] La documentación es clara

**QA/Tester**:
- [ ] Testeé todos los endpoints
- [ ] Validé casos edge
- [ ] Performance está OK
- [ ] Sin regressions

**DevOps/Deployment**:
- [ ] Configuré variables de entorno
- [ ] Validé migraciones (no hay)
- [ ] Setup de monitoring
- [ ] Plan de rollback listo

---

## 📞 SOPORTE

Si tienes dudas:
1. Leer `SUMMARY.md` para overview
2. Ver `COMPARISON.md` para antes vs después
3. Revisar `REFACTORING.md` para arquitectura
4. Check `ADVANCED_EXAMPLES.js` para mejoras futuras
5. Ejecutar tests para validar

---

**Status**: 🟢 Listo para integración
**Última actualización**: 13/12/2025
