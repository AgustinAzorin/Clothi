# Ejemplos Prácticos - Módulo de Productos

## 1. Crear Producto Digital

```bash
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "name": "Logo Design Template Pack",
    "description": "Conjunto completo de templates para diseño de logos profesionales. Incluye variaciones en color y blanco/negro.",
    "price": 49.99,
    "product_type": "digital",
    "category_id": "550e8400-e29b-41d4-a716-446655440000",
    "file_url": "https://storage.example.com/templates/logo-pack.zip",
    "file_size_mb": 350,
    "status": "published",
    "is_featured": true,
    "tags": [
      "550e8400-e29b-41d4-a716-446655440001",
      "550e8400-e29b-41d4-a716-446655440002"
    ],
    "brands": ["550e8400-e29b-41d4-a716-446655440003"]
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "name": "Logo Design Template Pack",
    "price": 49.99,
    "seller_id": "user-123",
    "status": "published",
    "is_featured": true,
    "view_count": 0,
    "like_count": 0,
    "comment_count": 0,
    "share_count": 0,
    "average_rating": 0,
    "rating_count": 0,
    "slug": "logo-design-template-pack-abcd1234",
    "created_at": "2025-12-17T10:00:00Z",
    "updated_at": "2025-12-17T10:00:00Z"
  }
}
```

---

## 2. Crear Producto Físico

```bash
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "name": "Mechanical Keyboard RGB",
    "description": "Teclado mecánico gaming con RGB personalizable. Switches Cherry MX Brown. Layout QWERTY español.",
    "price": 149.99,
    "product_type": "physical",
    "category_id": "550e8400-e29b-41d4-a716-446655440000",
    "sku": "MECH-RGB-001",
    "stock_quantity": 50,
    "weight_kg": 1.2,
    "dimensions": {
      "width": 450,
      "height": 150,
      "depth": 100
    },
    "status": "published",
    "brands": ["550e8400-e29b-41d4-a716-446655440003"]
  }'
```

---

## 3. Buscar Productos con Filtros

### Búsqueda Simple
```bash
curl -X GET "http://localhost:3001/api/products?search=logo&page=1&limit=20"
```

### Búsqueda por Rango de Precio
```bash
curl -X GET "http://localhost:3001/api/products?minPrice=10&maxPrice=100&sortBy=price&sortOrder=ASC"
```

### Búsqueda por Categoría y Ordenar por Rating
```bash
curl -X GET "http://localhost:3001/api/products?categoryId=550e8400-e29b-41d4-a716-446655440000&sortBy=average_rating&sortOrder=DESC"
```

### Búsqueda Avanzada Combinada
```bash
curl -X GET "http://localhost:3001/api/products?search=template&minPrice=20&maxPrice=200&isFeatured=true&sortBy=created_at&sortOrder=DESC&page=1&limit=50"
```

### Filtrar por Tags
```bash
curl -X GET "http://localhost:3001/api/products?tags=tag-id-1&tags=tag-id-2&tags=tag-id-3"
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
    {
      "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "name": "Logo Design Template Pack",
      "description": "...",
      "price": 49.99,
      "product_type": "digital",
      "status": "published",
      "view_count": 245,
      "like_count": 32,
      "comment_count": 8,
      "share_count": 15,
      "average_rating": 4.7,
      "rating_count": 15,
      "seller": {
        "id": "user-123",
        "username": "design_pro",
        "display_name": "Design Pro",
        "avatar_url": "https://..."
      },
      "category": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Design"
      },
      "tags": [
        { "id": "tag-1", "name": "Logo", "slug": "logo", "color": "#FF0000" },
        { "id": "tag-2", "name": "Template", "slug": "template", "color": "#00FF00" }
      ],
      "brands": [
        { "id": "brand-1", "name": "Adobe", "verified": true }
      ]
    }
  ],
  "pagination": {
    "total": 156,
    "page": 1,
    "limit": 20,
    "pages": 8
  }
}
```

---

## 4. Dar Like a un Producto

```bash
curl -X POST http://localhost:3001/api/products/f47ac10b-58cc-4372-a567-0e02b2c3d479/like \
  -H "Authorization: Bearer eyJhbGc..."
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Product liked successfully"
}
```

---

## 5. Obtener Likes de un Producto

```bash
curl -X GET "http://localhost:3001/api/products/f47ac10b-58cc-4372-a567-0e02b2c3d479/likes?page=1&limit=10"
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Likes retrieved successfully",
  "data": [
    {
      "id": "like-001",
      "user": {
        "id": "user-001",
        "username": "john_doe",
        "display_name": "John Doe",
        "avatar_url": "https://..."
      },
      "created_at": "2025-12-17T09:30:00Z"
    },
    {
      "id": "like-002",
      "user": {
        "id": "user-002",
        "username": "jane_smith",
        "display_name": "Jane Smith",
        "avatar_url": "https://..."
      },
      "created_at": "2025-12-17T08:45:00Z"
    }
  ],
  "pagination": {
    "total": 32,
    "page": 1,
    "limit": 10,
    "pages": 4
  }
}
```

---

## 6. Crear Comentario

### Comentario Principal
```bash
curl -X POST http://localhost:3001/api/products/f47ac10b-58cc-4372-a567-0e02b2c3d479/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "content": "¿Qué programas necesito para abrir los archivos? ¿Viene en formato PSD, AI y PNG?"
  }'
```

### Respuesta a Comentario
```bash
curl -X POST http://localhost:3001/api/products/f47ac10b-58cc-4372-a567-0e02b2c3d479/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "content": "Los archivos vienen en formato PSD (Adobe Photoshop), AI (Adobe Illustrator) y PNG. Necesitas tener Adobe Creative Cloud instalado.",
    "parentCommentId": "comment-001"
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "id": "comment-002",
    "content": "Los archivos vienen en formato PSD...",
    "user": {
      "id": "user-123",
      "username": "design_pro",
      "display_name": "Design Pro",
      "avatar_url": "https://..."
    },
    "parent_comment_id": "comment-001",
    "like_count": 0,
    "created_at": "2025-12-17T10:15:00Z"
  }
}
```

---

## 7. Obtener Comentarios con Respuestas

```bash
curl -X GET "http://localhost:3001/api/products/f47ac10b-58cc-4372-a567-0e02b2c3d479/comments?page=1&limit=10"
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Comments retrieved successfully",
  "data": [
    {
      "id": "comment-001",
      "content": "¿Qué programas necesito para abrir los archivos?",
      "user": {
        "id": "user-001",
        "username": "john_doe",
        "display_name": "John Doe",
        "avatar_url": "https://..."
      },
      "like_count": 5,
      "created_at": "2025-12-17T09:00:00Z",
      "replies": [
        {
          "id": "comment-002",
          "content": "Los archivos vienen en formato PSD (Adobe Photoshop), AI (Adobe Illustrator) y PNG.",
          "user": {
            "id": "user-123",
            "username": "design_pro",
            "display_name": "Design Pro",
            "avatar_url": "https://..."
          },
          "created_at": "2025-12-17T10:15:00Z"
        }
      ]
    }
  ],
  "pagination": {
    "total": 8,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

---

## 8. Crear Rating/Reseña

```bash
curl -X POST http://localhost:3001/api/products/f47ac10b-58cc-4372-a567-0e02b2c3d479/ratings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "score": 5,
    "review": "Excelente pack de templates. Los diseños son modernos y profesionales. Muy fáciles de personalizar. Recomendado 100%!"
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Rating added successfully",
  "data": {
    "id": "rating-001",
    "score": 5,
    "review": "Excelente pack de templates...",
    "user": {
      "id": "user-001",
      "username": "john_doe",
      "display_name": "John Doe",
      "avatar_url": "https://..."
    },
    "helpful_count": 0,
    "unhelpful_count": 0,
    "created_at": "2025-12-17T10:30:00Z"
  }
}
```

---

## 9. Obtener Ratings de un Producto

```bash
curl -X GET "http://localhost:3001/api/products/f47ac10b-58cc-4372-a567-0e02b2c3d479/ratings?page=1&limit=20"
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Ratings retrieved successfully",
  "data": [
    {
      "id": "rating-001",
      "score": 5,
      "review": "Excelente pack de templates...",
      "user": {
        "id": "user-001",
        "username": "john_doe",
        "display_name": "John Doe",
        "avatar_url": "https://..."
      },
      "helpful_count": 12,
      "unhelpful_count": 1,
      "created_at": "2025-12-17T10:30:00Z"
    },
    {
      "id": "rating-002",
      "score": 4,
      "review": "Buenos templates, aunque algunos necesitan más opciones de personalización.",
      "user": {
        "id": "user-002",
        "username": "jane_smith",
        "display_name": "Jane Smith",
        "avatar_url": "https://..."
      },
      "helpful_count": 8,
      "unhelpful_count": 0,
      "created_at": "2025-12-17T09:15:00Z"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

---

## 10. Obtener Tu Rating (Usuario Autenticado)

```bash
curl -X GET http://localhost:3001/api/products/f47ac10b-58cc-4372-a567-0e02b2c3d479/my-rating \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## 11. Compartir Producto en WhatsApp

```bash
curl -X POST http://localhost:3001/api/products/f47ac10b-58cc-4372-a567-0e02b2c3d479/share \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "shared_to": "whatsapp",
    "message": "¡Mira este increíble pack de templates de logo! Perfecto para tu negocio. Te ahorrará mucho tiempo."
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Product shared successfully",
  "data": {
    "id": "share-001",
    "shared_to": "whatsapp",
    "message": "¡Mira este increíble pack...",
    "user": {
      "id": "user-001",
      "username": "john_doe",
      "display_name": "John Doe"
    },
    "created_at": "2025-12-17T10:45:00Z"
  }
}
```

---

## 12. Compartir Directamente a Usuario

```bash
curl -X POST http://localhost:3001/api/products/f47ac10b-58cc-4372-a567-0e02b2c3d479/share \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "shared_to": "direct_link",
    "shared_with_user_id": "user-002",
    "message": "Te recomiendo este producto, creo que te será útil"
  }'
```

---

## 13. Obtener Compartidos de un Producto

```bash
curl -X GET "http://localhost:3001/api/products/f47ac10b-58cc-4372-a567-0e02b2c3d479/shares?page=1&limit=20"
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Shares retrieved successfully",
  "data": [
    {
      "id": "share-001",
      "shared_to": "whatsapp",
      "message": "¡Mira este pack de templates!",
      "user": {
        "id": "user-001",
        "username": "john_doe",
        "display_name": "John Doe"
      },
      "sharedWith": null,
      "created_at": "2025-12-17T10:45:00Z"
    },
    {
      "id": "share-002",
      "shared_to": "direct_link",
      "message": "Te recomiendo este producto",
      "user": {
        "id": "user-001",
        "username": "john_doe",
        "display_name": "John Doe"
      },
      "sharedWith": {
        "id": "user-002",
        "username": "jane_smith",
        "display_name": "Jane Smith"
      },
      "created_at": "2025-12-17T10:50:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

---

## 14. Obtener Productos Recomendados

### Top Rated (Mejor Puntuación)
```bash
curl -X GET "http://localhost:3001/api/products/recommendations/featured?limit=10"
```

### Bestsellers (Más Vendidos)
```bash
curl -X GET "http://localhost:3001/api/products/recommendations/bestsellers?limit=10"
```

### Más Recientes
```bash
curl -X GET "http://localhost:3001/api/products/recommendations/newest?limit=10"
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Recommended products retrieved successfully",
  "data": [
    {
      "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "name": "Logo Design Template Pack",
      "price": 49.99,
      "average_rating": 4.8,
      "rating_count": 25,
      "purchase_count": 342,
      "view_count": 1250,
      "seller": {
        "id": "user-123",
        "username": "design_pro",
        "display_name": "Design Pro"
      },
      "category": {
        "name": "Design"
      },
      "assets": [
        {
          "url": "https://..."
        }
      ]
    }
  ]
}
```

---

## 15. Actualizar Producto

```bash
curl -X PUT http://localhost:3001/api/products/f47ac10b-58cc-4372-a567-0e02b2c3d479 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "name": "Logo Design Template Pack V2",
    "description": "Versión mejorada con 50 templates adicionales...",
    "price": 59.99,
    "stock_quantity": 100,
    "is_featured": true
  }'
```

---

## 16. Eliminar Producto

```bash
curl -X DELETE http://localhost:3001/api/products/f47ac10b-58cc-4372-a567-0e02b2c3d479 \
  -H "Authorization: Bearer eyJhbGc..."
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## 17. Remover Like

```bash
curl -X DELETE http://localhost:3001/api/products/f47ac10b-58cc-4372-a567-0e02b2c3d479/like \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## 18. Eliminar Comentario

```bash
curl -X DELETE http://localhost:3001/api/products/comments/comment-001 \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## 19. Eliminar Rating

```bash
curl -X DELETE http://localhost:3001/api/products/ratings/rating-001 \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## Errores Comunes

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    "Product name is required",
    "Price must be a positive number"
  ]
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "You are not authorized to update this product"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Product not found"
}
```

---

## Tips Útiles

1. **Siempre incluye el token JWT en el header `Authorization: Bearer {token}`**
2. **Las IDs son UUIDs - verifícalas bien**
3. **Los límites de paginación están limitados a máximo 100**
4. **La búsqueda es case-insensitive (no importa mayúsculas)**
5. **Los contadores se actualizan automáticamente**
6. **Solo el vendedor puede editar/eliminar su producto**
7. **Solo el autor puede eliminar su comentario/rating**

