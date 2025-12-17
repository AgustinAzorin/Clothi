-- ============================================
-- MIGRACIONES PARA EL MÓDULO DE PRODUCTOS
-- Ejecutar en orden numérico
-- ============================================

-- 1. Agregar campos faltantes al producto
ALTER TABLE products
ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0 CHECK (comment_count >= 0),
ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0 CHECK (share_count >= 0),
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5),
ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0 CHECK (rating_count >= 0);

-- 2. Crear tabla ratings
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  review TEXT,
  helpful_count INTEGER DEFAULT 0 CHECK (helpful_count >= 0),
  unhelpful_count INTEGER DEFAULT 0 CHECK (unhelpful_count >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_ratings_product_id ON ratings(product_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_score ON ratings(score);
CREATE INDEX IF NOT EXISTS idx_ratings_helpful ON ratings(helpful_count DESC);

-- 3. Crear tabla shares
CREATE TABLE IF NOT EXISTS shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  outfit_id UUID REFERENCES outfits(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  shared_to VARCHAR(50) NOT NULL DEFAULT 'copy_link' 
    CHECK (shared_to IN ('whatsapp', 'facebook', 'twitter', 'instagram', 'email', 'direct_link', 'copy_link')),
  shared_with_user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shares_user_id ON shares(user_id);
CREATE INDEX IF NOT EXISTS idx_shares_product_id ON shares(product_id) WHERE product_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_shares_shared_to ON shares(shared_to);
CREATE INDEX IF NOT EXISTS idx_shares_created_at ON shares(created_at);

-- 4. Crear función para actualizar rating promedio automáticamente
CREATE OR REPLACE FUNCTION update_product_rating_on_rating_change()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET 
    average_rating = COALESCE((
      SELECT ROUND(AVG(score)::numeric, 2)
      FROM ratings
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    ), 0),
    rating_count = (
      SELECT COUNT(*)
      FROM ratings
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    ),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 5. Crear triggers para actualizar ratings
DROP TRIGGER IF EXISTS trigger_rating_insert ON ratings;
DROP TRIGGER IF EXISTS trigger_rating_update ON ratings;
DROP TRIGGER IF EXISTS trigger_rating_delete ON ratings;

CREATE TRIGGER trigger_rating_insert
AFTER INSERT ON ratings
FOR EACH ROW
EXECUTE FUNCTION update_product_rating_on_rating_change();

CREATE TRIGGER trigger_rating_update
AFTER UPDATE ON ratings
FOR EACH ROW
EXECUTE FUNCTION update_product_rating_on_rating_change();

CREATE TRIGGER trigger_rating_delete
AFTER DELETE ON ratings
FOR EACH ROW
EXECUTE FUNCTION update_product_rating_on_rating_change();

-- ============================================
-- VERIFICACIÓN (ejecutar después)
-- ============================================

-- Verificar que las tablas existen
-- SELECT tablename FROM pg_tables WHERE tablename IN ('ratings', 'shares');

-- Verificar que los campos fueron agregados
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'products' AND column_name IN ('comment_count', 'share_count', 'average_rating', 'rating_count');

-- Verificar que los índices existen
-- SELECT indexname FROM pg_indexes WHERE tablename IN ('ratings', 'shares');

-- ============================================
-- ROLLBACK (Si es necesario deshacer)
-- ============================================

/*
-- Deshacer cambios (comentados por seguridad)

-- DROP TRIGGER IF EXISTS trigger_rating_delete ON ratings;
-- DROP TRIGGER IF EXISTS trigger_rating_update ON ratings;
-- DROP TRIGGER IF EXISTS trigger_rating_insert ON ratings;
-- DROP FUNCTION IF EXISTS update_product_rating_on_rating_change();
-- DROP TABLE IF EXISTS shares;
-- DROP TABLE IF EXISTS ratings;
-- ALTER TABLE products DROP COLUMN IF EXISTS comment_count, DROP COLUMN IF EXISTS share_count, DROP COLUMN IF EXISTS average_rating, DROP COLUMN IF EXISTS rating_count;
*/
