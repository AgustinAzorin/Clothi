const express = require('express');
const router = express.Router();
const RecommendationController = require('../controller/recommendationController');
const { authMiddleware } = require('../../../middleware/auth');

/**
 * RECOMENDACIONES ROUTES
 * 
 * Endpoints para obtener productos recomendados basados en preferencias del usuario
 */

/**
 * GET /api/marketplace/recommendations
 * 
 * Obtiene una lista personalizada de productos recomendados para el usuario
 * 
 * Query Parameters:
 * - preferredCategories (optional): Array de nombres de categorías preferidas
 *   Example: ?preferredCategories=Electrónica,Gaming
 * 
 * - recentlyViewedProductIds (optional): Array de IDs de productos vistos recientemente
 *   Example: ?recentlyViewedProductIds=P001,P002,P003
 * 
 * - purchasedBrandIds (optional): Array de IDs de marcas que el usuario ha comprado
 *   Example: ?purchasedBrandIds=B_Sony,B_Apple
 * 
 * - currentLocation (optional): Ubicación actual del usuario
 *   Example: ?currentLocation=Buenos Aires
 * 
 * - limit (optional, default=20): Número de resultados
 *   Example: ?limit=50
 * 
 * - offset (optional, default=0): Offset para paginación
 *   Example: ?offset=20
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "UUID",
 *       "name": "Product Name",
 *       "category_id": "UUID",
 *       "price": 99.99,
 *       "purchase_count": 50,
 *       "like_count": 25,
 *       "view_count": 500,
 *       "is_featured": true,
 *       "recommendationScore": 390
 *     },
 *     ...
 *   ],
 *   "count": 20
 * }
 * 
 * Examples:
 * 
 * 1. Recomendaciones básicas:
 *    GET /api/marketplace/recommendations
 * 
 * 2. Con categorías preferidas:
 *    GET /api/marketplace/recommendations?preferredCategories=Electrónica,Gaming
 * 
 * 3. Excluir productos vistos:
 *    GET /api/marketplace/recommendations?preferredCategories=Electrónica&recentlyViewedProductIds=P001,P002
 * 
 * 4. Completo:
 *    GET /api/marketplace/recommendations?preferredCategories=Electrónica,Gaming&recentlyViewedProductIds=P001,P002&purchasedBrandIds=B_Sony,B_Apple&limit=50&offset=0
 */
router.get('/recommendations', RecommendationController.getRecommendations);

/**
 * GET /api/marketplace/products/:productId/related
 * 
 * Obtiene productos relacionados (misma categoría) a un producto específico
 * 
 * Path Parameters:
 * - productId (required): UUID del producto de referencia
 * 
 * Query Parameters:
 * - limit (optional, default=10): Número de resultados
 * - offset (optional, default=0): Offset para paginación
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "UUID",
 *       "name": "Related Product",
 *       "category_id": "UUID",
 *       "price": 79.99,
 *       "purchase_count": 30
 *     },
 *     ...
 *   ],
 *   "count": 5
 * }
 * 
 * Error Responses:
 * 404 - Producto no encontrado
 * {
 *   "success": false,
 *   "message": "Producto 123e4567-e89b-12d3-a456-426614174000 no encontrado"
 * }
 * 
 * Examples:
 * 
 * 1. Productos relacionados (por defecto 10):
 *    GET /api/marketplace/products/123e4567-e89b-12d3-a456-426614174000/related
 * 
 * 2. Con paginación:
 *    GET /api/marketplace/products/123e4567-e89b-12d3-a456-426614174000/related?limit=20&offset=10
 */
router.get('/products/:productId/related', RecommendationController.getRelatedProducts);

/**
 * ============================================================================
 * NOTAS IMPORTANTES
 * ============================================================================
 * 
 * 1. AUTENTICACIÓN:
 *    - El endpoint GET /recommendations puede requerir autenticación para
 *      personalizar mejor las recomendaciones (userId del usuario loggeado)
 *    - El endpoint GET /related NO requiere autenticación (es público)
 *    
 *    Para agregar autenticación:
 *    router.get('/recommendations', authMiddleware, RecommendationController.getRecommendations);
 * 
 * 2. RATE LIMITING:
 *    Recomendado agregar rate limiting:
 *    const rateLimit = require('express-rate-limit');
 *    const limiter = rateLimit({
 *      windowMs: 15 * 60 * 1000,  // 15 minutos
 *      max: 100                    // 100 requests por IP
 *    });
 *    router.use(limiter);
 * 
 * 3. CACHING:
 *    Los resultados pueden cachearse:
 *    - Redis: Recomendaciones por usuario (1 hora)
 *    - CDN: Productos relacionados (24 horas)
 * 
 * 4. VALIDACIÓN:
 *    Los parámetros se validan en el controller y service
 * 
 * 5. ERRORES:
 *    Posibles errores:
 *    - 400 Bad Request: Input inválido
 *    - 404 Not Found: Producto no existe
 *    - 500 Internal Server Error: Error en la BD
 * 
 * ============================================================================
 */

module.exports = router;
