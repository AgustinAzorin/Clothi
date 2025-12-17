# 🎯 Guía: Integración de Tags y Brands en Clothi

## 📋 Cambios Realizados

### Modelos Creados:

1. **`tag.js`** - Modelo de Tags
   - `id` (UUID)
   - `name` (STRING, UNIQUE)
   - `slug` (STRING, UNIQUE)
   - `color` (STRING, hex color)
   - `description` (TEXT)
   - `usage_count` (INTEGER)

2. **`productTag.js`** - Tabla Relacional Product ↔ Tag
   - `product_id` (FK)
   - `tag_id` (FK)
   - Constraint: UNIQUE(product_id, tag_id)

3. **`brand.js`** - Modelo de Brands
   - `id` (UUID)
   - `name` (STRING, UNIQUE)
   - `slug` (STRING, UNIQUE)
   - `logo_url` (TEXT)
   - `description` (TEXT)
   - `official_website` (TEXT)
   - `verified` (BOOLEAN)
   - `product_count` (INTEGER)

4. **`productBrand.js`** - Tabla Relacional Product ↔ Brand
   - `product_id` (FK)
   - `brand_id` (FK)
   - Constraint: UNIQUE(product_id, brand_id)

### Archivos Modificados:

- ✅ `models/index.js` - Agregadas nuevas importaciones y exportaciones
- ✅ `models/associations.js` - Agregadas asociaciones many-to-many
- 📝 `models/product.js` - **Pendiente: Remover columna `tags` (array)**

## 🚀 Pasos de Instalación

### Paso 1: Ejecutar SQL en Supabase

1. Abre Supabase Dashboard
2. Ve a `SQL Editor`
3. Copia todo el contenido de `database/sql/create-tags-brands-tables.sql`
4. Pega y ejecuta

**O** copia este SQL directo:

```sql
-- Ver archivo: database/sql/create-tags-brands-tables.sql
-- Ejecutar primero las 4 tablas principales
-- Luego las funciones y triggers (opcionales)
```

### Paso 2: Actualizar Product Model (Manual)

En `models/product.js`, remover o comentar:

```javascript
// ❌ ELIMINAR ESTA SECCIÓN:
tags: {
  type: DataTypes.ARRAY(DataTypes.STRING),
  defaultValue: []
}
```

### Paso 3: Migración de Datos (Si tienes datos existentes)

Si ya tienes productos con tags en formato array, primero hacer backup:

```javascript
// Script para migrar datos antiguos (opcional)
const migrateTagsToRelational = async () => {
  const products = await Product.findAll();
  
  for (const product of products) {
    if (product.tags && Array.isArray(product.tags)) {
      for (const tagName of product.tags) {
        let tag = await Tag.findOne({ where: { name: tagName } });
        if (!tag) {
          tag = await Tag.create({ name: tagName });
        }
        await product.addTag(tag);
      }
    }
  }
};
```

### Paso 4: Reiniciar la Aplicación

```bash
npm run dev
# o
npm start
```

## 📊 Cómo Usar en el Código

### Crear Producto con Tags:

```javascript
const product = await Product.create({
  name: 'iPhone 15 Pro',
  price: 999.99,
  seller_id: 'user-uuid',
  category_id: 'cat-uuid'
});

// Agregar tags
const tags = await Tag.findAll({ 
  where: { name: ['Electrónica', 'Gaming'] } 
});
await product.addTags(tags);

// Agregar brands
const brand = await Brand.findOne({ where: { name: 'Apple' } });
await product.addBrand(brand);
```

### Obtener Productos con Tags y Brands:

```javascript
const products = await Product.findAll({
  include: [
    { association: 'tags', attributes: ['id', 'name', 'slug'] },
    { association: 'brands', attributes: ['id', 'name', 'slug', 'logo_url'] }
  ]
});

// Resultado:
// {
//   id: 'uuid',
//   name: 'iPhone 15',
//   tags: [
//     { id: 'tag-uuid', name: 'Electrónica', slug: 'electronica' },
//     { id: 'tag-uuid-2', name: 'Gaming', slug: 'gaming' }
//   ],
//   brands: [
//     { id: 'brand-uuid', name: 'Apple', slug: 'apple', logo_url: '...' }
//   ]
// }
```

### Filtrar por Tags:

```javascript
const productsByTag = await Product.findAll({
  include: [{
    association: 'tags',
    where: { name: 'Electrónica' },
    attributes: ['id', 'name']
  }]
});
```

### Obtener Estadísticas:

```javascript
// Tags más usados
const popularTags = await Tag.findAll({
  order: [['usage_count', 'DESC']],
  limit: 10
});

// Brands verificadas
const verifiedBrands = await Brand.findAll({
  where: { verified: true },
  order: [['product_count', 'DESC']]
});
```

## 🔄 Actualizar Recomendaciones

Ahora el `recommendationService.js` puede:

```javascript
// Filtrar por tags preferidos
static async getRecommendedProducts(userContext) {
  const { preferredTags = [] } = userContext;
  
  // Obtener tag IDs
  const tags = await Tag.findAll({
    where: { name: preferredTags }
  });
  
  // Productos con esos tags
  const products = await Product.findAll({
    include: [{
      association: 'tags',
      where: { id: tags.map(t => t.id) },
      through: { attributes: [] }
    }]
  });
}
```

## 🧪 Verificar Instalación

```bash
npm test
```

Deberías ver los nuevos modelos en el output:
```
✅ Todas las asociaciones de modelos configuradas
```

## 📝 Notas Importantes

1. **Constraint UNIQUE** en product_tags y product_brands previene duplicados
2. **Índices** optimizan búsquedas y filtros
3. **Funciones y Triggers** se actualizan automáticamente
4. **soft-delete** es respetado por las relaciones (ON DELETE CASCADE)

## ❓ FAQ

**P: ¿Qué pasa si elimino un tag?**
R: Se elimina automáticamente de product_tags (CASCADE)

**P: ¿Puedo tener múltiples brands por producto?**
R: Sí, la relación es many-to-many

**P: ¿Cómo actualizo el slug automáticamente?**
R: Los hooks en beforeValidate generan el slug del name

**P: ¿Necesito ejecutar migraciones?**
R: No, Sequelize los crea automáticamente en desarrollo

## 🎓 Próximos Pasos

- [ ] Crear endpoint GET /api/tags
- [ ] Crear endpoint GET /api/brands
- [ ] Crear endpoint POST /api/products/:id/tags
- [ ] Integrar filtros de tags en marketplace
- [ ] Crear página de filtros por brand
- [ ] Agregar búsqueda por tags

---

¡Listo! 🚀 Preguntas en: [support]
