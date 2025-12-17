# 📋 INSTRUCCIONES PASO A PASO: Instalar Tags y Brands

## 🎯 Objetivo Final
Agregar soporte para Tags y Brands en tu base de datos con relaciones many-to-many normalizadas.

## ✅ PASO 1: Verificar Código Instalado

Tu aplicación ya tiene todo el código listo. Verifica en:

```bash
# Revisar que existen los archivos
ls -la apps/api/src/models/tag.js         ✅
ls -la apps/api/src/models/productTag.js  ✅
ls -la apps/api/src/models/brand.js       ✅
ls -la apps/api/src/models/productBrand.js ✅

# Verificar tests
npm test 2>&1 | grep "passed"
# Debería mostrar: Tests: 25 passed ✅
```

## ✅ PASO 2: Crear Tablas en Supabase

### Opción A: SQL Ready-to-Copy (Recomendado ⭐)

1. Abre https://supabase.com y ve a tu proyecto
2. Click en `SQL Editor` (left sidebar)
3. Click en `New Query`
4. **Copia TODO el contenido de:**
   ```
   database/sql/sql-ready-to-copy.sql
   ```
5. Pega en el editor
6. Click en botón `RUN` (arriba)
7. Espera a que se ejecute (verde = éxito ✅)

### Opción B: SQL Línea por Línea

Si prefieres hacerlo en pasos, copia cada sección:

#### Paso 2.1: Crear tabla TAGS
```sql
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  color VARCHAR(7),
  description TEXT,
  usage_count INTEGER DEFAULT 0 CHECK (usage_count >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tags_name ON tags(name);
CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_tags_usage_count ON tags(usage_count DESC);
```
✅ Click RUN

#### Paso 2.2: Crear tabla PRODUCT_TAGS
```sql
CREATE TABLE IF NOT EXISTS product_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, tag_id)
);

CREATE INDEX idx_product_tags_product_id ON product_tags(product_id);
CREATE INDEX idx_product_tags_tag_id ON product_tags(tag_id);
```
✅ Click RUN

#### Paso 2.3: Crear tabla BRANDS
```sql
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  logo_url TEXT,
  description TEXT,
  official_website TEXT,
  verified BOOLEAN DEFAULT FALSE,
  product_count INTEGER DEFAULT 0 CHECK (product_count >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_brands_name ON brands(name);
CREATE INDEX idx_brands_slug ON brands(slug);
CREATE INDEX idx_brands_verified ON brands(verified);
CREATE INDEX idx_brands_product_count ON brands(product_count DESC);
```
✅ Click RUN

#### Paso 2.4: Crear tabla PRODUCT_BRANDS
```sql
CREATE TABLE IF NOT EXISTS product_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, brand_id)
);

CREATE INDEX idx_product_brands_product_id ON product_brands(product_id);
CREATE INDEX idx_product_brands_brand_id ON product_brands(brand_id);
```
✅ Click RUN

#### Paso 2.5: Insertar Datos de Ejemplo (Opcional)
```sql
INSERT INTO tags (name, slug, color, description, usage_count) VALUES
  ('Electrónica', 'electronica', '#0066FF', 'Productos electrónicos y gadgets', 0),
  ('Gaming', 'gaming', '#FF6600', 'Artículos para gamers', 0),
  ('Fashion', 'fashion', '#FF0099', 'Ropa y accesorios', 0),
  ('Hogar', 'hogar', '#00CC66', 'Artículos para el hogar', 0),
  ('Deportes', 'deportes', '#FF3333', 'Equipamiento deportivo', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO brands (name, slug, logo_url, description, verified, product_count) VALUES
  ('Apple', 'apple', '', 'Dispositivos Apple premium', TRUE, 0),
  ('Sony', 'sony', '', 'Electrónica y audio Sony', TRUE, 0),
  ('Samsung', 'samsung', '', 'Electrónica Samsung', TRUE, 0),
  ('Nike', 'nike', '', 'Ropa y deportes Nike', TRUE, 0),
  ('Adidas', 'adidas', '', 'Ropa y deportes Adidas', TRUE, 0)
ON CONFLICT (slug) DO NOTHING;
```
✅ Click RUN

### ✅ Verificación en Supabase

Después de ejecutar el SQL, verifica en Supabase:

1. Click en `Table Editor` (left sidebar)
2. Deberías ver las 4 nuevas tablas:
   - ✅ `tags`
   - ✅ `product_tags`
   - ✅ `brands`
   - ✅ `product_brands`

3. Click en cada tabla y verifica que tienen datos de ejemplo

## ✅ PASO 3: Reiniciar la Aplicación

```bash
# Detener servidor (si está corriendo)
# Ctrl + C

# Reiniciar
npm run dev

# Deberías ver en los logs:
# ✅ Todas las asociaciones de modelos configuradas
```

## ✅ PASO 4: Verificar Tests

```bash
npm test

# Resultado esperado:
# Test Suites: 3 passed, 3 total
# Tests:       25 passed, 25 total
```

Si todo está ✅ verde, ¡ya está listo!

## 🧪 PASO 5: Testing Manual (Opcional)

### Opción A: Usando Node REPL

```bash
node
```

```javascript
const { Product, Tag, Brand } = require('./apps/api/src/models');

// Obtener tags disponibles
const tags = await Tag.findAll();
console.log('Tags disponibles:', tags.map(t => t.name));

// Obtener brands disponibles
const brands = await Brand.findAll({ where: { verified: true } });
console.log('Brands verificadas:', brands.map(b => b.name));

// Salir
process.exit();
```

### Opción B: Usar Supabase Table Editor

1. Ve a `Table Editor` en Supabase
2. Click en `tags` → verifica que hay datos
3. Click en `brands` → verifica que hay datos
4. Haz algunas queries de prueba (ver archivo SQL)

## 🚀 PASO 6: Usar en Tu Código

### Agregar Tags a un Producto

```javascript
const { Product, Tag } = require('./src/models');

// Obtener producto
const product = await Product.findByPk('product-uuid');

// Obtener tags
const electrónicaTag = await Tag.findOne({ where: { slug: 'electronica' } });
const gamingTag = await Tag.findOne({ where: { slug: 'gaming' } });

// Agregar tags
await product.addTags([electrónicaTag, gamingTag]);

// ✅ Listo! El producto ahora tiene tags
```

### Agregar Brands a un Producto

```javascript
const { Product, Brand } = require('./src/models');

// Obtener producto
const product = await Product.findByPk('product-uuid');

// Obtener brand
const appleBrand = await Brand.findOne({ where: { slug: 'apple' } });

// Agregar brand
await product.addBrand(appleBrand);

// ✅ Listo! El producto ahora tiene brand
```

### Obtener Producto con Tags y Brands

```javascript
const { Product } = require('./src/models');

const product = await Product.findByPk('product-uuid', {
  include: [
    { 
      association: 'tags',
      attributes: ['id', 'name', 'slug'],
      through: { attributes: [] }
    },
    {
      association: 'brands',
      attributes: ['id', 'name', 'slug', 'verified'],
      through: { attributes: [] }
    }
  ]
});

console.log(product.tags);   // Array de tags
console.log(product.brands); // Array de brands
```

## ❓ Problemas Comunes

### ❌ Error: "relation 'tags' does not exist"
**Solución:** Ejecuta el SQL en Supabase. Las tablas no se crearon.

### ❌ Error: "FK constraint violation"
**Solución:** Asegúrate de que la tabla `products` existe antes de crear las relaciones.

### ❌ Modelos no se cargan
**Solución:** 
```bash
rm -rf node_modules
npm install
npm run dev
```

### ❌ Tests fallan
**Solución:**
```bash
npm test -- --no-coverage
# Si ves "25 passed" ✅ está todo bien
```

## 📞 Soporte

Si algo no funciona:

1. **Verifica logs:** `npm run dev` y revisa errores
2. **Verifica Supabase:** Abre tabla editor y confirma que existen las tablas
3. **Verifica código:** 
   ```bash
   ls -la apps/api/src/models/ | grep tag
   ls -la apps/api/src/models/ | grep brand
   ```
4. **Lee guía completa:** `SETUP_TAGS_BRANDS.md`

## ✅ Checklist Final

- [ ] Ejecuté SQL en Supabase
- [ ] Reinicié la aplicación (`npm run dev`)
- [ ] Los tests pasan (`npm test`)
- [ ] Puedo ver las nuevas tablas en Supabase
- [ ] Puedo agregar tags a productos
- [ ] Puedo agregar brands a productos
- [ ] Puedo filtrar por tags
- [ ] Puedo filtrar por brands

¡Si todo está ✅ listo, tu base de datos está completamente funcional! 🎉
