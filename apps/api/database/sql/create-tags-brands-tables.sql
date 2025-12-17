-- ============================================
-- SQL para Crear Tablas en Supabase
-- Modelos: Tags, Brands y sus relaciones
-- ============================================

-- ==========================================
-- 1. TABLA: tags
-- ==========================================
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

-- Índices para tags
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_usage_count ON tags(usage_count DESC);

-- ==========================================
-- 2. TABLA: product_tags (Relacional)
-- ==========================================
CREATE TABLE IF NOT EXISTS product_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, tag_id)
);

-- Índices para product_tags
CREATE INDEX IF NOT EXISTS idx_product_tags_product_id ON product_tags(product_id);
CREATE INDEX IF NOT EXISTS idx_product_tags_tag_id ON product_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_product_tags_unique ON product_tags(product_id, tag_id);

-- ==========================================
-- 3. TABLA: brands
-- ==========================================
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

-- Índices para brands
CREATE INDEX IF NOT EXISTS idx_brands_name ON brands(name);
CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug);
CREATE INDEX IF NOT EXISTS idx_brands_verified ON brands(verified);
CREATE INDEX IF NOT EXISTS idx_brands_product_count ON brands(product_count DESC);

-- ==========================================
-- 4. TABLA: product_brands (Relacional)
-- ==========================================
CREATE TABLE IF NOT EXISTS product_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, brand_id)
);

-- Índices para product_brands
CREATE INDEX IF NOT EXISTS idx_product_brands_product_id ON product_brands(product_id);
CREATE INDEX IF NOT EXISTS idx_product_brands_brand_id ON product_brands(brand_id);
CREATE INDEX IF NOT EXISTS idx_product_brands_unique ON product_brands(product_id, brand_id);

-- ==========================================
-- 5. MODIFICAR TABLA: products
-- Remover columna tags (ahora es relacional)
-- ==========================================
-- Nota: Si ya tienes datos en la columna tags, primero haz un backup
-- ALTER TABLE products DROP COLUMN IF EXISTS tags;

-- ============================================
-- FUNCIONES DE UTILIDAD (Opcional)
-- ============================================

-- Función para incrementar tag usage
CREATE OR REPLACE FUNCTION increment_tag_usage(tag_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE tags SET usage_count = usage_count + 1 WHERE id = tag_id;
END;
$$ LANGUAGE plpgsql;

-- Función para decrementar tag usage
CREATE OR REPLACE FUNCTION decrement_tag_usage(tag_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE tags SET usage_count = CASE WHEN usage_count > 0 THEN usage_count - 1 ELSE 0 END WHERE id = tag_id;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar product_count de brands
CREATE OR REPLACE FUNCTION update_brand_product_count(brand_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE brands 
  SET product_count = (SELECT COUNT(*) FROM product_brands WHERE brand_id = brands.id)
  WHERE id = brand_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS (Opcional - Auditoría)
-- ============================================

-- Trigger para actualizar updated_at en tags
CREATE OR REPLACE FUNCTION update_tags_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tags_updated_at_trigger
BEFORE UPDATE ON tags
FOR EACH ROW
EXECUTE FUNCTION update_tags_timestamp();

-- Trigger para actualizar updated_at en brands
CREATE OR REPLACE FUNCTION update_brands_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER brands_updated_at_trigger
BEFORE UPDATE ON brands
FOR EACH ROW
EXECUTE FUNCTION update_brands_timestamp();

-- Trigger para actualizar updated_at en product_tags
CREATE OR REPLACE FUNCTION update_product_tags_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_tags_updated_at_trigger
BEFORE UPDATE ON product_tags
FOR EACH ROW
EXECUTE FUNCTION update_product_tags_timestamp();

-- Trigger para actualizar updated_at en product_brands
CREATE OR REPLACE FUNCTION update_product_brands_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_brands_updated_at_trigger
BEFORE UPDATE ON product_brands
FOR EACH ROW
EXECUTE FUNCTION update_product_brands_timestamp();

-- ============================================
-- DATOS DE EJEMPLO (Opcional)
-- ============================================

-- Insertar tags de ejemplo
INSERT INTO tags (name, slug, color, description, usage_count) VALUES
  ('Electrónica', 'electronica', '#0066FF', 'Productos electrónicos y gadgets', 0),
  ('Gaming', 'gaming', '#FF6600', 'Artículos para gamers', 0),
  ('Fashion', 'fashion', '#FF0099', 'Ropa y accesorios', 0),
  ('Hogar', 'hogar', '#00CC66', 'Artículos para el hogar', 0),
  ('Deportes', 'deportes', '#FF3333', 'Equipamiento deportivo', 0)
ON CONFLICT (slug) DO NOTHING;

-- Insertar brands de ejemplo
INSERT INTO brands (name, slug, logo_url, description, verified, product_count) VALUES
  ('Apple', 'apple', 'https://example.com/logos/apple.png', 'Dispositivos Apple', TRUE, 0),
  ('Sony', 'sony', 'https://example.com/logos/sony.png', 'Productos Sony', TRUE, 0),
  ('Samsung', 'samsung', 'https://example.com/logos/samsung.png', 'Electrónica Samsung', TRUE, 0),
  ('Nike', 'nike', 'https://example.com/logos/nike.png', 'Ropa y deportes Nike', TRUE, 0),
  ('Adidas', 'adidas', 'https://example.com/logos/adidas.png', 'Ropa y deportes Adidas', TRUE, 0)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- QUERIES ÚTILES PARA TESTING
-- ============================================

-- Obtener todos los tags
-- SELECT * FROM tags ORDER BY usage_count DESC;

-- Obtener todas las brands
-- SELECT * FROM brands WHERE verified = true ORDER BY product_count DESC;

-- Obtener productos con sus tags
-- SELECT p.id, p.name, array_agg(t.name) as tags 
-- FROM products p
-- LEFT JOIN product_tags pt ON p.id = pt.product_id
-- LEFT JOIN tags t ON pt.tag_id = t.id
-- GROUP BY p.id, p.name;

-- Obtener productos con sus brands
-- SELECT p.id, p.name, array_agg(b.name) as brands 
-- FROM products p
-- LEFT JOIN product_brands pb ON p.id = pb.product_id
-- LEFT JOIN brands b ON pb.brand_id = b.id
-- GROUP BY p.id, p.name;

-- Contar productos por tag
-- SELECT t.name, COUNT(pt.product_id) as product_count
-- FROM tags t
-- LEFT JOIN product_tags pt ON t.id = pt.tag_id
-- GROUP BY t.id, t.name
-- ORDER BY product_count DESC;
