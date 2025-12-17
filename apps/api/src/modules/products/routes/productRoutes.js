const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');
const { authenticate } = require('../../../middleware/auth');
const { validate } = require('../validators/productValidator');
const {
  createProductSchema,
  updateProductSchema,
  addCommentSchema,
  addRatingSchema,
  shareProductSchema
} = require('../validators/productValidator');

// ==================== PRODUCTS ====================

// Obtener productos (público)
router.get('/', ProductController.getAllProducts);

// Obtener producto por ID (público)
router.get('/:id', ProductController.getProduct);

// Crear producto (protegido)
router.post('/', authenticate, validate(createProductSchema), ProductController.createProduct);

// Actualizar producto (protegido)
router.put('/:id', authenticate, validate(updateProductSchema), ProductController.updateProduct);

// Eliminar producto (protegido)
router.delete('/:id', authenticate, ProductController.deleteProduct);

// ==================== LIKES ====================

// Dar like
router.post('/:id/like', authenticate, ProductController.likeProduct);

// Remover like
router.delete('/:id/like', authenticate, ProductController.unlikeProduct);

// Obtener likes (público)
router.get('/:id/likes', ProductController.getProductLikes);

// ==================== COMMENTS ====================

// Crear comentario (protegido)
router.post('/:id/comments', authenticate, validate(addCommentSchema), ProductController.addComment);

// Obtener comentarios (público)
router.get('/:id/comments', ProductController.getProductComments);

// Eliminar comentario (protegido)
router.delete('/comments/:commentId', authenticate, ProductController.deleteComment);

// ==================== RATINGS ====================

// Crear rating (protegido)
router.post('/:id/ratings', authenticate, validate(addRatingSchema), ProductController.addRating);

// Obtener ratings (público)
router.get('/:id/ratings', ProductController.getProductRatings);

// Obtener rating del usuario actual (protegido)
router.get('/:id/my-rating', authenticate, ProductController.getUserRating);

// Eliminar rating (protegido)
router.delete('/ratings/:ratingId', authenticate, ProductController.deleteRating);

// ==================== SHARES ====================

// Compartir producto (protegido)
router.post('/:id/share', authenticate, validate(shareProductSchema), ProductController.shareProduct);

// Obtener compartidos (público)
router.get('/:id/shares', ProductController.getProductShares);

// ==================== RECOMMENDATIONS ====================

// Obtener productos recomendados (público)
router.get('/recommendations/featured', ProductController.getRecommendedProducts);

// Obtener bestsellers (público)
router.get('/recommendations/bestsellers', ProductController.getBestSellers);

// Obtener más recientes (público)
router.get('/recommendations/newest', ProductController.getNewest);

module.exports = router;
