## Módulo de Productos - Documentación Completa

Este módulo implementa todas las funcionalidades para gestionar productos, incluyendo:
- ✅ CRUD de productos
- ✅ Sistema de likes
- ✅ Sistema de comentarios
- ✅ Sistema de ratings/reseñas
- ✅ Sistema de compartir (shares)
- ✅ Recomendaciones

---

## Estructura del Módulo

```
src/modules/products/
├── repositories/
│   └── productRepository.js      # Acceso a datos
├── services/
│   └── productService.js         # Lógica de negocio
├── controllers/
│   └── productController.js      # Controladores HTTP
├── routes/
│   └── productRoutes.js          # Definición de rutas
└── validators/
    └── productValidator.js       # Esquemas de validación
```

---

## API Endpoints

### 1. PRODUCTS (CRUD)

#### GET /api/products
Obtener lista de productos con filtros

**Query Parameters:**
```
page: number (default: 1)
limit: number (default: 20, max: 100)
search: string (busca en nombre y descripción)
categoryId: UUID
sellerId: UUID
status: 'draft' | 'published' | 'archived'
isFeatured: boolean
minPrice: number
maxPrice: number
tags: UUID[] (array de IDs)
brands: UUID[] (array de IDs)
sortBy: 'created_at' | 'price' | 'view_count' | 'average_rating' (default: 'created_at')
sortOrder: 'ASC' | 'DESC' (default: 'DESC')
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "name": "Product Name",
      "description": "...",
      "price": 99.99,
      "product_type": "digital",
      "status": "published",
      "view_count": 150,
      "like_count": 25,
      "comment_count": 10,
      "share_count": 5,
      "average_rating": 4.5,
      "rating_count": 8,
      "seller": {...},
      "category": {...},
      "assets": [...],
      "tags": [...],
      "brands": [...]
    }
  ],
  "pagination": {
    "total": 200,
    "page": 1,
    "limit": 20,
    "pages": 10
  }
}
```

---

#### GET /api/products/:id
Obtener detalles de un producto

**Respuesta:**
```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "Product Name",
    ...
  }
}
```

**Nota:** Incrementa automáticamente el contador de vistas

---

#### POST /api/products
Crear nuevo producto (Protegido)

**Headers:** `Authorization: Bearer {token}`

**Body:**
```json
{
  "name": "Mi Producto",
  "description": "Descripción del producto",
  "price": 99.99,
  "product_type": "digital",
  "category_id": "uuid",
  "status": "draft",
  "is_featured": false,
  "file_url": "https://example.com/file.zip",
  "file_size_mb": 100,
  "tags": ["tag-id-1", "tag-id-2"],
  "brands": ["brand-id-1"]
}
```

**Validaciones:**
- `name`: 2-200 caracteres (requerido)
- `price`: número positivo (requerido)
- `product_type`: 'digital', 'physical' o 'both'
- Si es physical, se requiere `sku`
- Si es digital, se requiere `file_url`

---

#### PUT /api/products/:id
Actualizar producto (Protegido, solo vendedor)

**Headers:** `Authorization: Bearer {token}`

**Body:** Mismo que CREATE, pero todos los campos son opcionales

---

#### DELETE /api/products/:id
Eliminar producto (Protegido, solo vendedor)

**Headers:** `Authorization: Bearer {token}`

---

### 2. LIKES

#### POST /api/products/:id/like
Dar like a un producto (Protegido)

**Headers:** `Authorization: Bearer {token}`

**Respuesta:**
```json
{
  "success": true,
  "message": "Product liked successfully"
}
```

---

#### DELETE /api/products/:id/like
Remover like (Protegido)

**Headers:** `Authorization: Bearer {token}`

---

#### GET /api/products/:id/likes
Obtener usuarios que le dieron like

**Query Parameters:**
```
page: number (default: 1)
limit: number (default: 20)
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Likes retrieved successfully",
  "data": [
    {
      "id": "like-id",
      "user": {
        "id": "user-id",
        "username": "john_doe",
        "display_name": "John Doe",
        "avatar_url": "..."
      },
      "created_at": "2025-12-17T10:00:00Z"
    }
  ],
  "pagination": {...}
}
```

---

### 3. COMMENTS

#### POST /api/products/:id/comments
Crear comentario (Protegido)

**Headers:** `Authorization: Bearer {token}`

**Body:**
```json
{
  "content": "Este producto es excelente",
  "parentCommentId": "reply-to-comment-id (opcional)"
}
```

**Validaciones:**
- `content`: 1-1000 caracteres (requerido)

---

#### GET /api/products/:id/comments
Obtener comentarios

**Query Parameters:**
```
page: number (default: 1)
limit: number (default: 20)
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Comments retrieved successfully",
  "data": [
    {
      "id": "comment-id",
      "content": "Excelente producto",
      "user": {...},
      "replies": [
        {
          "id": "reply-id",
          "content": "Gracias por tu comentario",
          "user": {...}
        }
      ],
      "created_at": "2025-12-17T10:00:00Z"
    }
  ],
  "pagination": {...}
}
```

---

#### DELETE /api/products/comments/:commentId
Eliminar comentario (Protegido, solo autor)

**Headers:** `Authorization: Bearer {token}`

---

### 4. RATINGS & REVIEWS

#### POST /api/products/:id/ratings
Crear rating/reseña (Protegido)

**Headers:** `Authorization: Bearer {token}`

**Body:**
```json
{
  "score": 5,
  "review": "Producto de muy buena calidad. Recomendado!"
}
```

**Validaciones:**
- `score`: 1-5 (requerido)
- `review`: 0-2000 caracteres (opcional)

**Nota:** Si el usuario ya tiene un rating, se actualiza automáticamente

---

#### GET /api/products/:id/ratings
Obtener ratings de un producto

**Query Parameters:**
```
page: number (default: 1)
limit: number (default: 20)
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Ratings retrieved successfully",
  "data": [
    {
      "id": "rating-id",
      "score": 5,
      "review": "Excelente...",
      "user": {...},
      "helpful_count": 12,
      "unhelpful_count": 1,
      "created_at": "2025-12-17T10:00:00Z"
    }
  ],
  "pagination": {...}
}
```

---

#### GET /api/products/:id/my-rating
Obtener tu rating (Protegido)

**Headers:** `Authorization: Bearer {token}`

**Respuesta:**
```json
{
  "success": true,
  "message": "User rating retrieved successfully",
  "data": {
    "id": "rating-id",
    "score": 4,
    "review": "Muy bueno",
    ...
  }
}
```

---

#### DELETE /api/products/ratings/:ratingId
Eliminar rating (Protegido, solo autor)

**Headers:** `Authorization: Bearer {token}`

---

### 5. SHARES

#### POST /api/products/:id/share
Compartir producto (Protegido)

**Headers:** `Authorization: Bearer {token}`

**Body:**
```json
{
  "shared_to": "whatsapp|facebook|twitter|instagram|email|direct_link|copy_link",
  "shared_with_user_id": "uuid (opcional)",
  "message": "Mira este producto, te va a gustar!"
}
```

**Validaciones:**
- `shared_to`: requerido, debe ser una plataforma válida
- `message`: 0-500 caracteres (opcional)

---

#### GET /api/products/:id/shares
Obtener compartidos

**Query Parameters:**
```
page: number (default: 1)
limit: number (default: 20)
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Shares retrieved successfully",
  "data": [
    {
      "id": "share-id",
      "shared_to": "whatsapp",
      "message": "Mira esto...",
      "user": {...},
      "sharedWith": {...},
      "created_at": "2025-12-17T10:00:00Z"
    }
  ],
  "pagination": {...}
}
```

---

### 6. RECOMMENDATIONS

#### GET /api/products/recommendations/featured
Obtener productos recomendados (Top Rated)

**Query Parameters:**
```
limit: number (default: 10, max: 50)
```

---

#### GET /api/products/recommendations/bestsellers
Obtener bestsellers (Más vendidos)

**Query Parameters:**
```
limit: number (default: 10, max: 50)
```

---

#### GET /api/products/recommendations/newest
Obtener productos más recientes

**Query Parameters:**
```
limit: number (default: 10, max: 50)
```

---

## Modelos de Datos

### Product
```javascript
{
  id: UUID,
  seller_id: UUID (FK → UserProfile),
  category_id: UUID (FK → Category),
  name: string(200),
  description: text,
  price: decimal(10,2),
  product_type: 'digital' | 'physical' | 'both',
  status: 'draft' | 'published' | 'archived',
  
  // Contadores
  view_count: integer (default: 0),
  like_count: integer (default: 0),
  comment_count: integer (default: 0),
  share_count: integer (default: 0),
  purchase_count: integer (default: 0),
  
  // Ratings
  average_rating: decimal(3,2),
  rating_count: integer,
  
  // Digital
  file_url: string,
  file_size_mb: integer,
  
  // Physical
  sku: string,
  stock_quantity: integer,
  weight_kg: decimal(5,2),
  
  // Metadata
  slug: string (unique),
  is_featured: boolean,
  created_at: timestamp,
  updated_at: timestamp,
  
  // Relaciones
  seller: UserProfile,
  category: Category,
  assets: ProductAsset[],
  tags: Tag[],
  brands: Brand[],
  likes: Like[],
  comments: Comment[],
  ratings: Rating[]
}
```

### Like
```javascript
{
  id: UUID,
  user_id: UUID (FK → UserProfile),
  product_id: UUID (FK → Product),
  created_at: timestamp,
  
  // Constraint: unique(user_id, product_id)
}
```

### Comment
```javascript
{
  id: UUID,
  user_id: UUID (FK → UserProfile),
  product_id: UUID (FK → Product),
  content: text(1000),
  parent_comment_id: UUID (FK → Comment, nullable),
  like_count: integer (default: 0),
  created_at: timestamp,
  updated_at: timestamp,
  
  // Relaciones
  user: UserProfile,
  replies: Comment[]
}
```

### Rating
```javascript
{
  id: UUID,
  user_id: UUID (FK → UserProfile),
  product_id: UUID (FK → Product),
  score: integer (1-5),
  review: text(2000),
  helpful_count: integer (default: 0),
  unhelpful_count: integer (default: 0),
  created_at: timestamp,
  updated_at: timestamp,
  
  // Constraint: unique(user_id, product_id)
}
```

### Share
```javascript
{
  id: UUID,
  user_id: UUID (FK → UserProfile),
  product_id: UUID (FK → Product),
  shared_to: enum('whatsapp', 'facebook', 'twitter', 'instagram', 'email', 'direct_link', 'copy_link'),
  shared_with_user_id: UUID (FK → UserProfile, nullable),
  message: text(500),
  created_at: timestamp,
  updated_at: timestamp
}
```

---

## Ejemplos de Uso

### Ejemplo 1: Crear un producto digital

```bash
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Logo Design Template",
    "description": "Professional logo design template in AI, PSD and PNG formats",
    "price": 49.99,
    "product_type": "digital",
    "category_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "file_url": "https://storage.example.com/logo-template.zip",
    "file_size_mb": 250,
    "status": "published",
    "tags": ["design", "logo", "template"],
    "brands": ["adobe"]
  }'
```

### Ejemplo 2: Buscar productos con filtros

```bash
curl -X GET "http://localhost:3001/api/products?search=logo&minPrice=20&maxPrice=100&sortBy=average_rating&sortOrder=DESC&limit=10"
```

### Ejemplo 3: Dar like a un producto

```bash
curl -X POST http://localhost:3001/api/products/f47ac10b-58cc-4372-a567-0e02b2c3d479/like \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Ejemplo 4: Crear comentario con respuesta

```bash
# Comentario principal
curl -X POST http://localhost:3001/api/products/PRODUCT_ID/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "content": "¿Qué programas necesito para abrir los archivos?"
  }'

# Respuesta al comentario
curl -X POST http://localhost:3001/api/products/PRODUCT_ID/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "content": "Necesitas Adobe Illustrator, Photoshop o Affinity Designer",
    "parentCommentId": "COMMENT_ID"
  }'
```

### Ejemplo 5: Crear rating

```bash
curl -X POST http://localhost:3001/api/products/PRODUCT_ID/ratings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "score": 5,
    "review": "Excelente producto, muy profesional. Recomendado 100%"
  }'
```

### Ejemplo 6: Compartir en WhatsApp

```bash
curl -X POST http://localhost:3001/api/products/PRODUCT_ID/share \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "shared_to": "whatsapp",
    "message": "Mira este template de logo, es perfecto para tu negocio"
  }'
```

---

## Características Importantes

### Validaciones Automáticas

- **Duplicación de likes:** No puedes dar like dos veces al mismo producto
- **Duplicación de ratings:** Si ya tienes un rating, se actualiza automáticamente
- **Solo propietario puede editar:** Solo el vendedor puede editar/eliminar su producto
- **Solo autor puede eliminar:** Solo el autor del comentario puede eliminarlo

### Contadores Automáticos

Los siguientes contadores se actualizan automáticamente:

- `Product.like_count` → cuando se agrega/elimina un like
- `Product.comment_count` → cuando se agrega/elimina un comentario
- `Product.share_count` → cuando se agrega un compartido
- `Product.average_rating` → cuando se agrega/actualiza/elimina un rating
- `Product.rating_count` → cuando se agrega/actualiza/elimina un rating
- `Product.view_count` → cuando se obtiene el producto (GET /:id)

### Relaciones Incluidas

Todas las consultas incluyen automáticamente:

- **Seller:** Información del vendedor
- **Category:** Categoría del producto
- **Tags:** Etiquetas asociadas
- **Brands:** Marcas/fabricantes
- **Assets:** Imágenes/archivos del producto

---

## Filtrado Avanzado

### Por Precio
```
GET /api/products?minPrice=10&maxPrice=100
```

### Por Tags y Brands
```
GET /api/products?tags=tag-id-1&tags=tag-id-2&brands=brand-id-1
```

### Por Texto
```
GET /api/products?search=logo design
```

### Combinado
```
GET /api/products?search=template&minPrice=20&maxPrice=200&categoryId=uuid&sortBy=average_rating&sortOrder=DESC&page=1&limit=20
```

---

## Errores Comunes

| Código | Error | Causa |
|--------|-------|-------|
| 400 | "Product name is required" | Falta el nombre del producto |
| 400 | "Price must be a positive number" | El precio no es válido |
| 400 | "You already liked this product" | Ya le diste like |
| 400 | "Comment content is required" | Comentario vacío |
| 400 | "Rating must be between 1 and 5" | Score fuera de rango |
| 403 | "Not authorized to update this product" | No eres el vendedor |
| 404 | "Product not found" | ID de producto no existe |

---

## Notas de Desarrollo

- Todos los endpoints protegidos requieren autenticación JWT
- Los IDs son UUIDs
- Todos los precios son DECIMAL(10,2)
- Los contadores se actualizan automáticamente mediante hooks de Sequelize
- El sistema es compatible con búsquedas case-insensitive (iLike)
- La paginación está limitada a máximo 100 items por página

---

## Próximas Mejoras

- [ ] Carrito de compras
- [ ] Procesamiento de pagos
- [ ] Historial de compras
- [ ] Sistema de reembolsos
- [ ] Estadísticas de ventas
- [ ] SEO mejorado
- [ ] Búsqueda con Elasticsearch
