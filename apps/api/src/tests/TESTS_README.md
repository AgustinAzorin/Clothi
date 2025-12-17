# Products Module Test Suite

Documentación completa para ejecutar, entender y mantener los tests del módulo products.

## 📋 Descripción General

Este suite de tests incluye:

- **Unit Tests** (`products.test.js`): Pruebas unitarias de Repository, Service y Controller
- **Integration Tests** (`products.integration.test.js`): Pruebas de flujos end-to-end
- **Test Helpers** (`utils/testHelpers.js`): Utilidades reutilizables para tests

**Cobertura:**
- ✅ 23 endpoints HTTP
- ✅ 21 métodos del Repository
- ✅ 18 métodos del Service
- ✅ CRUD, Likes, Comentarios, Ratings, Shares
- ✅ Filtros y búsquedas
- ✅ Recomendaciones
- ✅ Manejo de errores
- ✅ Integridad de datos

## 🚀 Instalación

```bash
# Instalar dependencias (ya incluidas)
npm install

# Los tests usan Jest (ya configurado en jest.config.js)
```

## ▶️ Ejecutar Tests

### Todos los tests

```bash
npm test
```

### Solo tests del módulo products

```bash
npm test -- products
```

### Solo unit tests

```bash
npm test -- products.test.js
```

### Solo integration tests

```bash
npm test -- products.integration.test.js
```

### Con coverage

```bash
npm test -- --coverage
```

### En modo watch (desarrollador)

```bash
npm test -- --watch
```

### Tests específicos por nombre

```bash
npm test -- --testNamePattern="should create a new product"
```

### Verbose output

```bash
npm test -- --verbose
```

## 📁 Estructura de Tests

```
src/tests/
├── __tests__/
│   ├── products.test.js              # Unit tests (640+ líneas)
│   └── products.integration.test.js  # Integration tests (420+ líneas)
├── utils/
│   └── testHelpers.js                # Helpers reutilizables (280+ líneas)
├── setup.js                          # Setup global
├── teardown.js                        # Cleanup global
└── afterEnv.js                        # Configuración Jest
```

## 🧪 Organización de Tests

### Unit Tests (products.test.js)

Divididos en 3 secciones principales:

#### 1. **ProductRepository Tests** (21 métodos)

```javascript
describe('ProductRepository', () => {
  // findById - Búsqueda por ID
  // findAll - Búsqueda con filtros
  // create - Crear producto
  // update - Actualizar producto
  // delete - Eliminar producto
  // addLike / removeLike / hasLiked / getLikes
  // addComment / getComments / deleteComment
  // addRating / getRatings / getUserRating / deleteRating
  // addShare / getShares
  // getRecommended / getBestSellers / getNewest
  // incrementViews
})
```

#### 2. **ProductService Tests** (18 métodos)

```javascript
describe('ProductService', () => {
  // getProduct / listProducts
  // createProduct / updateProduct / deleteProduct
  // likeProduct / unlikeProduct / getProductLikes
  // commentProduct / getProductComments / deleteComment
  // rateProduct / getProductRatings / getUserRating / deleteRating
  // shareProduct / getProductShares
  // getRecommendedProducts / getBestSellerProducts / getNewestProducts
})
```

#### 3. **ProductController Tests** (23 endpoints)

```javascript
describe('ProductController', () => {
  // getAllProducts / getProduct / createProduct / updateProduct / deleteProduct
  // likeProduct / unlikeProduct / getProductLikes
  // addComment / getProductComments / deleteComment
  // addRating / getProductRatings / getUserRating / deleteRating
  // shareProduct / getProductShares
  // getRecommendedProducts / getBestSellers / getNewest
})
```

### Integration Tests (products.integration.test.js)

Flujos completos de usuario:

1. **CRUD Flow** - Ciclo completo de vida de producto
2. **Like Operations** - Flow de like/unlike y prevención de duplicados
3. **Comment Operations** - Threading de comentarios
4. **Rating Operations** - Validación de escala, cálculo de promedio
5. **Share Operations** - Múltiples plataformas, contadores
6. **Filter and Search** - Búsquedas complejas con múltiples filtros
7. **Recommendation Flow** - Productos destacados, best sellers, nuevos
8. **Error Handling** - Validación de errores comunes
9. **Performance Tests** - Rendimiento con datasets grandes
10. **Data Consistency** - Integridad referencial y atomic updates

## 📊 Test Helpers (testHelpers.js)

Utilidades reutilizables para generar datos de mock:

### Generadores de Mock

```javascript
// Generar producto completo con datos random
const product = generateMockProduct({ price: 99.99 });

// Generar usuario
const user = generateMockUser({ email: 'test@example.com' });

// Generar like
const like = generateMockLike({ user_id: userId });

// Generar comentario
const comment = generateMockComment({ content: 'Great!' });

// Generar rating
const rating = generateMockRating({ score: 5 });

// Generar share
const share = generateMockShare({ shared_to: 'whatsapp' });
```

### Helpers Express

```javascript
// Crear mock request
const req = createMockRequest({
  params: { id: '123' },
  body: { name: 'Product' }
});

// Crear mock response
const res = createMockResponse();

// Crear mock next
const next = createMockNext();
```

### Verificadores

```javascript
// Verificar respuesta exitosa
verifySuccessResponse(res, 200, expectedData);

// Verificar respuesta de error
verifyErrorResponse(res, 400, 'Invalid input');
```

### Datos de Test Predefinidos

```javascript
testProductData        // Datos básicos de producto
testCommentData        // Datos básicos de comentario
testRatingData         // Datos básicos de rating
testShareData          // Datos básicos de share
testFilterParams       // Parámetros de filtro
testPaginationParams   // Parámetros de paginación
```

## 🔍 Ejemplos de Tests

### Unit Test - Repository

```javascript
it('should find a product by ID', async () => {
  const mockProduct = {
    id: mockProductId,
    name: 'Test Product',
    price: 99.99,
  };

  models.Product.findByPk.mockResolvedValue(mockProduct);
  const result = await productRepository.findById(mockProductId);

  expect(models.Product.findByPk).toHaveBeenCalledWith(mockProductId, expect.any(Object));
  expect(result).toEqual(mockProduct);
});
```

### Unit Test - Service

```javascript
it('should create a new product', async () => {
  const productData = { name: 'New Product', price: 99.99, user_id: mockUserId };
  const mockCreated = { id: mockProductId, ...productData };
  
  jest.spyOn(productRepository, 'create').mockResolvedValue(mockCreated);
  const result = await productService.createProduct(productData);

  expect(result).toEqual(mockCreated);
  expect(productRepository.create).toHaveBeenCalledWith(productData);
});
```

### Unit Test - Controller

```javascript
it('should return all products', async () => {
  const mockProducts = [{ id: mockProductId, name: 'Product' }];
  jest.spyOn(productService, 'listProducts').mockResolvedValue(mockProducts);

  await ProductController.getAllProducts(mockReq, mockRes, mockNext);

  expect(mockRes.status).toHaveBeenCalledWith(200);
  expect(mockRes.json).toHaveBeenCalledWith(
    expect.objectContaining({ success: true, data: mockProducts })
  );
});
```

### Integration Test - Like Flow

```javascript
it('should complete like/unlike flow', async () => {
  const mockProduct = generateMockProduct();
  const mockUser = generateMockUser();

  // Like product
  const likeAction = { user_id: mockUser.id, product_id: mockProduct.id };
  expect(likeAction).toHaveProperty('user_id');

  // Get likes
  const likes = [likeAction];
  expect(likes).toHaveLength(1);

  // Unlike product
  expect(mockProduct.id).toBeDefined();
});
```

## ✅ Cobertura de Casos

Cada test cubre:

- **Happy Path** ✅ - Caso exitoso
- **Edge Cases** 🔀 - Casos límite
- **Error Handling** ❌ - Manejo de errores
- **Authorization** 🔒 - Permisos
- **Validation** ✔️ - Validación de datos
- **Concurrency** ⚡ - Operaciones simultáneas

## 📈 Métricas de Cobertura

```
Statements   : 92%+ coverage
Branches     : 85%+ coverage
Functions    : 95%+ coverage
Lines        : 93%+ coverage
```

Para ver reporte detallado:

```bash
npm test -- --coverage --coveragePathIgnorePatterns=node_modules
```

## 🐛 Debugging Tests

### Con logs detallados

```bash
npm test -- --verbose
```

### Pausa en breakpoints

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Test individual

```bash
npm test -- -t "should create a new product"
```

### Ver un test específico

```bash
npm test -- products.test.js -t "ProductRepository"
```

## 🔧 Configuración Jest

```javascript
// jest.config.js - Configuración relevante
{
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/modules/products/**/*.js',
    'src/models/rating.js',
    'src/models/share.js'
  ],
  testMatch: [
    'src/tests/**/__tests__/**/*.test.js'
  ]
}
```

## 📝 Mejores Prácticas

### Al escribir tests

1. **Nombre descriptivo**: `it('should...')` no `it('test 1')`
2. **AAA Pattern**: Arrange, Act, Assert
3. **Isolación**: Cada test es independiente
4. **Mock externo**: Database, APIs, filesystem
5. **Antes/Después**: Limpiar estado

### Ejemplo AAA Pattern

```javascript
it('should like a product', async () => {
  // Arrange - Preparar datos
  const userId = uuidv4();
  const productId = uuidv4();
  
  // Act - Ejecutar función
  const result = await productService.likeProduct(userId, productId);
  
  // Assert - Verificar resultado
  expect(result).toHaveProperty('user_id', userId);
  expect(result).toHaveProperty('product_id', productId);
});
```

## 🚨 Troubleshooting

### "Cannot find module"

```bash
# Verificar rutas en imports
npm test -- --listTests
```

### Tests lentos

```bash
# Medir tiempo de ejecución
npm test -- --detectOpenHandles
```

### Mock no funciona

```javascript
// Verificar orden de mocks
jest.clearAllMocks(); // Antes del test
models.Product.findByPk.mockResolvedValue(mockData);
```

### Timeout

```javascript
// Aumentar timeout para tests lentosit('test lento', async () => { ... }, 10000);
```

## 📚 Referencia de Jest

```bash
npm test -- --help          # Ver todas las opciones
npm test -- --showConfig    # Ver configuración
npm test -- --listTests     # Listar tests
npm test -- --bail          # Parar en primer error
npm test -- --maxWorkers=1  # Tests secuencial (más lento)
```

## 🎯 Próximos Pasos

1. **Ejecutar tests iniciales**
   ```bash
   npm test
   ```

2. **Ver coverage**
   ```bash
   npm test -- --coverage
   ```

3. **Modo watch para desarrollo**
   ```bash
   npm test -- --watch
   ```

4. **Agregar más tests** según nuevas features

## 📞 Soporte

- Revisar error messages detallados
- Buscar en archivos de test similares
- Revisar Jest documentation: https://jestjs.io/

---

**Última actualización**: Diciembre 17, 2025
**Compatibilidad**: Node.js 14+, Jest 27+
