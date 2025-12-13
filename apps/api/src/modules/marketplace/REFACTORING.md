# Arquitectura de Recomendaciones - Refactorización

## Problema Original

La función `filterByPreferences` original mezclaba tres responsabilidades:
1. **Queries a BD**: Construcción de queries Sequelize complejas
2. **Lógica de negocio**: Reglas de preferencias y pesos de scoring
3. **Post-procesamiento**: Scoring en memoria y ordenamiento

Problemas específicos:
- ⚠️ **SQL Injection**: Uso de `sequelize.literal()` con concatenación de strings
- ⚠️ **Scoring incorrecto**: Sumaba 100 puntos a CUALQUIER producto con categoría, no solo preferidas
- ⚠️ **Difícil de testear**: Lógica mezclada hace testing complejo
- ⚠️ **Mantenibilidad**: Cambiar pesos o reglas requiere tocar el repository
- ⚠️ **Escalabilidad**: Traer muchos datos a memoria para post-procesar no escala

## Solución Refactorizada

### 1. **Repository (marketplaceRepository.js)**
```
Responsabilidad: SOLO acceso seguro a datos
```

✅ **Queries reutilizables y seguras**:
- `getPublishedProductsWithStock()` - Base para recomendaciones
- `getProductsByCategory()` - Productos relacionados
- `getProductsByIds()` - Búsquedas por IDs
- `searchProducts()` - Búsqueda de texto
- `getCategoriesByNames()` - Resolver categorías (sin SQL injection)

✅ **Ventajas**:
- Usa operadores Sequelize (`Op.in`) en lugar de `sequelize.literal()`
- Previene SQL injection
- Métodos simples y componibles
- Fácil de testear (mock amigable)

### 2. **Service (recommendationService.js)**
```
Responsabilidad: TODA la lógica de recomendación y scoring
```

✅ **Métodos públicos**:
- `getRecommendedProducts()` - Orquesta el flujo completo
- `getRelatedProducts()` - Productos de la misma categoría

✅ **Métodos privados** (separación de concerns):
- `_validateUserContext()` - Validar entrada
- `_resolveCategoryIds()` - Mapear nombres → IDs (usa repository)
- `_applyFilters()` - Filtros en memoria (excluir vistos)
- `_scoreProducts()` - Calcular relevancia

✅ **Scoring mejorado**:
```javascript
// ANTES (INCORRECTO): Sumaba 100 a cualquier producto con categoría
if (preferredCategories.length > 0 && product.category_id) {
    score += 100;  // ❌ Incorrecto: products con cualquier categoría
}

// DESPUÉS (CORRECTO): Solo si está en categorías preferidas
if (
    scoreContext.preferredCategoryIds.length > 0 &&
    product.category_id &&
    scoreContext.preferredCategoryIds.includes(product.category_id)  // ✅ Verificar explícitamente
) {
    score += 100;
}
```

✅ **Esquema de scoring**:
| Criterio | Puntos | Condición |
|----------|--------|-----------|
| Categoría preferida | 100 | ID en `preferredCategoryIds` |
| Producto destacado | 50 | `is_featured = true` |
| Compras | 5 × count | `purchase_count` |
| Likes | 2 × count | `like_count` |
| Vistas | 0.5 × count | `view_count` |
| Marca comprada | 30 | Marca en `tags` |

### 3. **Controller (recommendationController.js)**
```
Responsabilidad: Orquestar requests HTTP y respuestas
```

✅ **Endpoints**:
- `GET /marketplace/recommendations` - Recomendaciones personalizadas
- `GET /marketplace/products/:productId/related` - Productos relacionados

## Flujo de Ejecución

```
CLIENT REQUEST
    ↓
RecommendationController
    ↓
    ├─→ Parsear query params → userContext
    ├─→ RecommendationService.getRecommendedProducts()
    │   ├─→ Validar userContext
    │   ├─→ marketplaceRepository.getCategoriesByNames()
    │   │   └─→ Resolver "Electrónica" → UUID_123
    │   ├─→ marketplaceRepository.getPublishedProductsWithStock()
    │   │   └─→ SELECT products WHERE status=PUBLISHED AND stock>0
    │   ├─→ _applyFilters() [EN MEMORIA]
    │   │   └─→ Excluir productos vistos recientemente
    │   ├─→ _scoreProducts() [EN MEMORIA]
    │   │   └─→ Calcular score para cada producto
    │   └─→ Ordenar por score DESC
    └─→ Retornar JSON
```

## Ejemplos de Uso

### Solicitud HTTP
```bash
GET /marketplace/recommendations?preferredCategories=Electrónica,Gaming&recentlyViewedProductIds=P005,P010&purchasedBrandIds=B_Sony,B_Apple&limit=20&offset=0
```

### En el código
```javascript
const userContext = {
    userId: "usuario_123",
    preferredCategories: ["Electrónica", "Gaming"],
    recentlyViewedProductIds: ["P005", "P010"],
    purchasedBrandIds: ["B_Sony", "B_Apple"],
    currentLocation: "Buenos Aires"
};

const options = { limit: 20, offset: 0 };

const recommendations = await RecommendationService.getRecommendedProducts(
    userContext,
    marketplaceRepository,
    options
);
```

## Ventajas de la Refactorización

### Seguridad ✅
- No hay riesgo de SQL injection (no se usa `sequelize.literal()`)
- Validación explícita de entrada
- Queries parametrizadas via Sequelize

### Mantenibilidad ✅
- Repository: Acceso a datos únicamente
- Service: Lógica de negocio centralizada
- Controller: Orquestación HTTP
- Cada capa tiene una responsabilidad única

### Testabilidad ✅
```javascript
// Fácil de testear
describe('RecommendationService', () => {
    it('debe excluir productos vistos recientemente', () => {
        const products = [
            { id: 'P1', category_id: 'CAT1' },
            { id: 'P2', category_id: 'CAT1' }
        ];
        
        const result = RecommendationService._applyFilters(products, {
            recentlyViewedProductIds: ['P1'],
            preferredCategoryIds: ['CAT1']
        });
        
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('P2');
    });
});
```

### Escalabilidad ✅
- Si crece el volumen: agregar paginación en repository (ya implementado)
- Si crece la complejidad: crear nuevos métodos en service
- Si cambian reglas: modificar solo `_scoreProducts()`

## Próximas Mejoras (Opcionales)

1. **Caché de recomendaciones**: Redis para usuarios frecuentes
2. **Scoring en BD**: Si el volumen crece, mover scoring a SQL
3. **A/B Testing**: Experimentar con diferentes pesos
4. **User profiling**: Guardar histórico de preferencias
5. **Análisis colaborativo**: Recomendaciones basadas en usuarios similares

## Estructura de Archivos

```
marketplace/
├── controller/
│   └── recommendationController.js    ← NEW
├── repositories/
│   └── marketplaceRepository.js       ← REFACTORED
├── services/
│   └── recommendationService.js       ← NEW
└── routes/
    └── (aquí importar recommendationController)
```
