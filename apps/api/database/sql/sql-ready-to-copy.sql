-- ============================================
-- SQL PARA SUPABASE - TAGS Y BRANDS
-- Copiar y pegar directamente
-- ============================================

-- 1. CREAR TABLA: tags
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

-- 2. CREAR TABLA: product_tags
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

-- 3. CREAR TABLA: brands
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

-- 4. CREAR TABLA: product_brands
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

-- ============================================
-- INSERTAR DATOS DE EJEMPLO (Opcional)
-- ============================================

INSERT INTO tags (name, slug, color, description, usage_count) VALUES
  ('Electrónica', 'electronica', '#0066FF', 'Productos electrónicos y gadgets', 0),
  ('Gaming', 'gaming', '#FF6600', 'Artículos para gamers', 0),
  ('Fashion', 'fashion', '#FF0099', 'Ropa y accesorios', 0),
  ('Hogar', 'hogar', '#00CC66', 'Artículos para el hogar', 0),
  ('Deportes', 'deportes', '#FF3333', 'Equipamiento deportivo', 0),
  ('Belleza', 'belleza', '#FF00FF', 'Productos de belleza', 0),
  ('Salud', 'salud', '#00FFFF', 'Productos de salud', 0),
  ('Viajes', 'viajes', '#FFCC00', 'Accesorios de viaje', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO brands (name, slug, logo_url, description, verified, product_count) VALUES
  ('Apple', 'apple', '', 'Dispositivos Apple premium', TRUE, 0),
  ('Sony', 'sony', '', 'Electrónica y audio Sony', TRUE, 0),
  ('Samsung', 'samsung', '', 'Electrónica y displays Samsung', TRUE, 0),
  ('Microsoft', 'microsoft', '', 'Software y hardware Microsoft', TRUE, 0),
  ('Nintendo', 'nintendo', '', 'Consolas y juegos Nintendo', TRUE, 0),
  ('Nike', 'nike', '', 'Ropa y deportes Nike', TRUE, 0),
  ('Adidas', 'adidas', '', 'Ropa y deportes Adidas', TRUE, 0),
  ('Puma', 'puma', '', 'Ropa deportiva Puma', TRUE, 0),
  ('Canon', 'canon', '', 'Cámaras y equipos fotográficos', TRUE, 0),
  ('Nikon', 'nikon', '', 'Cámaras y lentes Nikon', TRUE, 0)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- QUERIES ÚTILES PARA TESTING
-- ============================================

-- Listar todos los tags
-- SELECT name, slug, color, usage_count FROM tags ORDER BY usage_count DESC;

-- Listar todas las brands
-- SELECT name, slug, verified, product_count FROM brands ORDER BY product_count DESC;

-- Contar productos por tag
-- SELECT t.name, COUNT(pt.product_id) as product_count
-- FROM tags t
-- LEFT JOIN product_tags pt ON t.id = pt.tag_id
-- GROUP BY t.id, t.name
-- ORDER BY product_count DESC;

-- Productos con todos sus tags
-- SELECT 
--   p.id,
--   p.name,
--   array_agg(t.name) as tags,
--   array_agg(t.slug) as tag_slugs
-- FROM products p
-- LEFT JOIN product_tags pt ON p.id = pt.product_id
-- LEFT JOIN tags t ON pt.tag_id = t.id
-- GROUP BY p.id, p.name
-- LIMIT 10;

-- Productos con todas sus brands
-- SELECT 
--   p.id,
--   p.name,
--   array_agg(b.name) as brands,
--   array_agg(b.verified) as verified
-- FROM products p
-- LEFT JOIN product_brands pb ON p.id = pb.product_id
-- LEFT JOIN brands b ON pb.brand_id = b.id
-- GROUP BY p.id, p.name
-- LIMIT 10;
