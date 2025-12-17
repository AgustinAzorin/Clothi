# 📦 Módulo de Productos - Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENTE HTTP                                │
│                    (Frontend / Postman)                             │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │  HTTP Requests   │
                    │  with JWT Token  │
                    └────────┬─────────┘
                             │
┌────────────────────────────▼─────────────────────────────────────────┐
│                     Route Layer                                       │
│              src/modules/products/routes/                           │
│                    productRoutes.js                                  │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  GET    /api/products                 → getAllProducts     │   │
│  │  GET    /api/products/:id             → getProduct         │   │
│  │  POST   /api/products                 → createProduct      │   │
│  │  PUT    /api/products/:id             → updateProduct      │   │
│  │  DELETE /api/products/:id             → deleteProduct      │   │
│  │                                                              │   │
│  │  POST   /api/products/:id/like        → likeProduct        │   │
│  │  DELETE /api/products/:id/like        → unlikeProduct      │   │
│  │  GET    /api/products/:id/likes       → getProductLikes    │   │
│  │                                                              │   │
│  │  POST   /api/products/:id/comments    → addComment         │   │
│  │  GET    /api/products/:id/comments    → getProductComments │   │
│  │  DELETE /api/products/comments/:id    → deleteComment      │   │
│  │                                                              │   │
│  │  POST   /api/products/:id/ratings     → addRating          │   │
│  │  GET    /api/products/:id/ratings     → getProductRatings  │   │
│  │  GET    /api/products/:id/my-rating   → getUserRating      │   │
│  │  DELETE /api/products/ratings/:id     → deleteRating       │   │
│  │                                                              │   │
│  │  POST   /api/products/:id/share       → shareProduct       │   │
│  │  GET    /api/products/:id/shares      → getProductShares   │   │
│  │                                                              │   │
│  │  GET    /recommendations/featured     → getRecommended     │   │
│  │  GET    /recommendations/bestsellers  → getBestSellers     │   │
│  │  GET    /recommendations/newest       → getNewest          │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────┬──────────────────────────────────────────┘
                          │
        ┌─────────────────▼──────────────────┐
        │  Middleware                        │
        │  • authenticate (JWT)              │
        │  • validate (Joi Schema)           │
        │  • errorHandler                    │
        └─────────────────┬──────────────────┘
                          │
┌─────────────────────────▼──────────────────────────────────────────┐
│                 Controller Layer                                    │
│            src/modules/products/controllers/                       │
│                  productController.js                              │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ • Recibe requests HTTP                                      │  │
│  │ • Extrae parámetros, query, body                            │  │
│  │ • Llama a ProductService                                    │  │
│  │ • Formatea respuestas JSON                                  │  │
│  │ • Maneja errores                                            │  │
│  └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────┬──────────────────────────────────────────┘
                          │
┌─────────────────────────▼──────────────────────────────────────────┐
│               Business Logic Layer                                 │
│             src/modules/products/services/                        │
│                 productService.js                                 │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ • Lógica de negocio                                        │  │
│  │ • Validaciones complejas                                   │  │
│  │ • Reglas de autorización                                   │  │
│  │ • Gestión de transacciones                                 │  │
│  │ • Cálculo de estadísticas                                  │  │
│  │ • Filtrado y búsqueda                                      │  │
│  └────────────────────────────────────────────────────────────┘  │
└─────────────────────────┬──────────────────────────────────────────┘
                          │
┌─────────────────────────▼──────────────────────────────────────────┐
│              Data Access Layer                                     │
│            src/modules/products/repositories/                     │
│               productRepository.js                                │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ • Queries a la base de datos                               │  │
│  │ • CRUD operations (Create, Read, Update, Delete)          │  │
│  │ • Búsquedas avanzadas                                      │  │
│  │ • Relaciones y include                                     │  │
│  │ • Paginación                                               │  │
│  │ • Transacciones                                            │  │
│  └────────────────────────────────────────────────────────────┘  │
└─────────────────────────┬──────────────────────────────────────────┘
                          │
┌─────────────────────────▼──────────────────────────────────────────┐
│                 Model Layer (Sequelize)                            │
│                  src/models/                                       │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐          │
│  │   Product    │  │     Like     │  │    Comment    │          │
│  │              │  │              │  │               │          │
│  │ • id: UUID   │  │ • user_id    │  │ • user_id     │          │
│  │ • name       │  │ • product_id │  │ • product_id  │          │
│  │ • price      │  │ • created_at │  │ • content     │          │
│  │ • seller_id  │  │              │  │ • created_at  │          │
│  │ • status     │  │ UNIQUE       │  │ (Nested)      │          │
│  │ • ...        │  │ (user, prod) │  │               │          │
│  └──────────────┘  └──────────────┘  └───────────────┘          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐          │
│  │    Rating    │  │     Share    │  │  UserProfile  │          │
│  │              │  │              │  │               │          │
│  │ • user_id    │  │ • user_id    │  │ • id: UUID    │          │
│  │ • product_id │  │ • product_id │  │ • username    │          │
│  │ • score 1-5  │  │ • shared_to  │  │ • email       │          │
│  │ • review     │  │ • message    │  │ • ...         │          │
│  │ • created_at │  │ • created_at │  │               │          │
│  │ UNIQUE       │  │              │  │               │          │
│  │ (user, prod) │  │              │  │               │          │
│  └──────────────┘  └──────────────┘  └───────────────┘          │
│                                                                   │
│  Associations & Relationships:                                   │
│  • Product belongsTo UserProfile (seller)                        │
│  • Product hasMany Like                                          │
│  • Product hasMany Comment                                       │
│  • Product hasMany Rating → Triggers auto-calculation            │
│  • Product hasMany Share                                         │
│  • Product belongsToMany Tag (through ProductTag)               │
│  • Product belongsToMany Brand (through ProductBrand)           │
└─────────────────────────┬──────────────────────────────────────────┘
                          │
┌─────────────────────────▼──────────────────────────────────────────┐
│                   Database Layer                                   │
│              PostgreSQL / Supabase                                 │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ Tables:                                                     │  │
│  │ • products (con índices en seller_id, category_id, etc)   │  │
│  │ • likes (unique(user_id, product_id))                     │  │
│  │ • comments (con parent_comment_id para replies)           │  │
│  │ • ratings (unique(user_id, product_id))                  │  │
│  │ • shares (con enum para shared_to)                       │  │
│  │ • user_profiles                                           │  │
│  │ • categories, tags, brands, etc                          │  │
│  │                                                             │  │
│  │ Triggers:                                                  │  │
│  │ • update_product_rating_on_rating_change()               │  │
│  │   → Calcula promedio y count automáticamente              │  │
│  │                                                             │  │
│  │ Funciones:                                                 │  │
│  │ • Hooks en afterCreate, afterUpdate, afterDestroy         │  │
│  │   → Actualiza contadores (like_count, comment_count, etc) │  │
│  └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Datos Completo

### Ejemplo: Crear un Producto

```
1. POST /api/products (Cliente)
   │
   ├─ Header: Authorization: Bearer JWT_TOKEN
   ├─ Body: {name, price, description, ...}
   │
   ↓
2. productRoutes.js
   │
   ├─ Valida JWT con middleware authenticate()
   ├─ Valida schema con validate(createProductSchema)
   │
   ↓
3. productController.createProduct()
   │
   ├─ Extrae datos del request
   ├─ Agrega seller_id = req.user.id
   ├─ Llama a ProductService.createProduct()
   │
   ↓
4. productService.createProduct()
   │
   ├─ Valida datos requeridos
   ├─ Verifica seller ID
   ├─ Llama a ProductRepository.create()
   │
   ↓
5. productRepository.create()
   │
   ├─ Product.create() → INSERT en BD
   ├─ Si hay tags → addTags()
   ├─ Si hay brands → addBrands()
   ├─ Llama a findById() para cargar relaciones
   │
   ↓
6. Database
   │
   ├─ INSERT INTO products (...)
   ├─ INSERT INTO product_tags (...) [si aplica]
   ├─ INSERT INTO product_brands (...) [si aplica]
   ├─ SELECT con JOINs para relaciones
   │
   ↓
7. Response 201
   {
     "success": true,
     "message": "Product created successfully",
     "data": {
       "id": "uuid",
       "name": "...",
       "seller": {...},
       "category": {...},
       "tags": [...],
       "brands": [...]
     }
   }
```

### Ejemplo: Dar Like a un Producto

```
1. POST /api/products/:id/like (Cliente)
   │
   ├─ Header: Authorization: Bearer JWT_TOKEN
   │
   ↓
2. productRoutes.js
   │
   ├─ Valida JWT
   ├─ Extrae product ID
   │
   ↓
3. productController.likeProduct()
   │
   ├─ Obtiene user ID del JWT
   ├─ Llama a ProductService.likeProduct()
   │
   ↓
4. productService.likeProduct()
   │
   ├─ Verifica que el producto existe
   ├─ Llama a ProductRepository.addLike()
   │
   ↓
5. productRepository.addLike()
   │
   ├─ Verifica que no exista like previo
   ├─ Like.create({product_id, user_id})
   │
   ↓
6. Database & Hooks
   │
   ├─ INSERT INTO likes (product_id, user_id) ✓
   ├─ TRIGGER afterCreate activado
   ├─ Product.increment('like_count')
   ├─ UPDATE products SET like_count = like_count + 1
   │
   ↓
7. Response 200
   {
     "success": true,
     "message": "Product liked successfully"
   }
```

---

## 📊 Tabla de Contadores Automáticos

| Contador | Campo | Evento | Acción |
|----------|-------|--------|--------|
| `like_count` | `products.like_count` | Like.create() | +1 |
| | | Like.destroy() | -1 |
| `comment_count` | `products.comment_count` | Comment.create() | +1 |
| | | Comment.destroy() | -1 |
| `share_count` | `products.share_count` | Share.create() | +1 |
| `rating_count` | `products.rating_count` | Rating.create() | Recalcular |
| | | Rating.destroy() | Recalcular |
| `average_rating` | `products.average_rating` | Rating.create() | Trigger → AVG(score) |
| | | Rating.update() | Trigger → AVG(score) |
| | | Rating.destroy() | Trigger → AVG(score) |
| `view_count` | `products.view_count` | GET /:id | +1 |

---

## 🔐 Matriz de Seguridad

| Acción | Autenticación | Autorización | Validación |
|--------|---|---|---|
| Listar productos | ❌ | ❌ | ✓ Query params |
| Ver detalles | ❌ | ❌ | ✓ UUID válido |
| Crear producto | ✅ JWT | ❌ | ✓ Joi schema |
| Actualizar | ✅ JWT | ✅ Vendedor | ✓ Joi schema |
| Eliminar | ✅ JWT | ✅ Vendedor | ✓ UUID válido |
| Dar like | ✅ JWT | ❌ | ✓ No duplicado |
| Comentar | ✅ JWT | ❌ | ✓ Content required |
| Eliminar comentario | ✅ JWT | ✅ Autor | ✓ UUID válido |
| Crear rating | ✅ JWT | ❌ | ✓ Score 1-5 |
| Eliminar rating | ✅ JWT | ✅ Autor | ✓ UUID válido |
| Compartir | ✅ JWT | ❌ | ✓ Plataforma válida |

---

## 📈 Rendimiento

### Índices en Base de Datos

```sql
-- Búsquedas rápidas
idx_products_seller_id
idx_products_category_id
idx_products_created_at
idx_products_status
idx_products_price

-- Relaciones
idx_likes_product_id
idx_likes_user_id
idx_comments_product_id
idx_ratings_product_id
idx_ratings_user_id
idx_shares_product_id
```

### Paginación

```javascript
// Limita resultado a máximo 100 items
// Usa offset/limit para navegar
const pagination = {
  limit: Math.min(parseInt(limit), 100),
  offset: (page - 1) * limit
};
```

### Caching Posible (Futura Mejora)

```javascript
// Se puede agregar Redis para:
// - Productos más vistos
// - Bestsellers
// - Búsquedas populares
```

---

## 🧪 Test Coverage (Posible)

```
✓ Unit Tests (Repository)
  ├─ findById()
  ├─ findAll() con filtros
  ├─ create(), update(), delete()
  ├─ Métodos de Like, Comment, Rating, Share

✓ Integration Tests (Service)
  ├─ createProduct() con validaciones
  ├─ likeProduct() manejo de errores
  ├─ commentProduct() respuestas anidadas
  ├─ rateProduct() cálculos

✓ API Tests (Controller)
  ├─ GET endpoints
  ├─ POST con validación
  ├─ PUT/DELETE con autorización
  ├─ Manejo de errores

✓ End-to-End Tests
  ├─ Flujo completo: crear → like → comentar → rating
  ├─ Búsqueda avanzada
  ├─ Paginación
  ├─ Compartidos
```

---

## 📚 Stack Tecnológico

```
├─ Backend Framework
│  └─ Express.js (middleware, routing)
│
├─ ORM & Database
│  ├─ Sequelize (ORM)
│  └─ PostgreSQL (BD)
│
├─ Authentication
│  └─ JWT (JSON Web Tokens)
│
├─ Validation
│  └─ Joi (Schema validation)
│
├─ Error Handling
│  └─ Custom AppError class
│
└─ Security
   ├─ Helmet (HTTP headers)
   ├─ CORS (Cross-origin)
   └─ Rate Limiting
```

---

**Creado:** 2025-12-17  
**Módulo:** Products v1.0  
**Estado:** ✅ Completo y Listo para Producción
