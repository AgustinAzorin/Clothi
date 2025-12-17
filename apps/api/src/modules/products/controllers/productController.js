const ProductService = require('../services/productService');
const { AppError } = require('../../../middleware/errorHandler');

class ProductController {
  /**
   * @desc    Obtener todos los productos
   * @route   GET /api/products
   * @access  Public
   */
  static async getAllProducts(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        sellerId,
        categoryId,
        status,
        isFeatured,
        minPrice,
        maxPrice,
        search,
        tags,
        brands,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = req.query;

      const filters = {
        sellerId,
        categoryId,
        status,
        isFeatured: isFeatured === 'true',
        minPrice: minPrice ? parseFloat(minPrice) : null,
        maxPrice: maxPrice ? parseFloat(maxPrice) : null,
        search,
        tags: tags ? (Array.isArray(tags) ? tags : [tags]) : [],
        brands: brands ? (Array.isArray(brands) ? brands : [brands]) : [],
        sortBy,
        sortOrder
      };

      const pagination = {
        limit: Math.min(parseInt(limit), 100),
        offset: (parseInt(page) - 1) * parseInt(limit)
      };

      const result = await ProductService.listProducts(filters, pagination);

      res.json({
        success: true,
        message: 'Products retrieved successfully',
        data: result.items,
        pagination: {
          total: result.total,
          page: parseInt(page),
          limit: pagination.limit,
          pages: Math.ceil(result.total / pagination.limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc    Obtener producto por ID
   * @route   GET /api/products/:id
   * @access  Public
   */
  static async getProduct(req, res, next) {
    try {
      const { id } = req.params;

      const product = await ProductService.getProduct(id);

      res.json({
        success: true,
        message: 'Product retrieved successfully',
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc    Crear producto
   * @route   POST /api/products
   * @access  Private
   */
  static async createProduct(req, res, next) {
    try {
      const productData = req.body;

      const result = await ProductService.createProduct(productData, req.user.id);

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc    Actualizar producto
   * @route   PUT /api/products/:id
   * @access  Private
   */
  static async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const productData = req.body;

      const result = await ProductService.updateProduct(id, productData, req.user.id);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc    Eliminar producto
   * @route   DELETE /api/products/:id
   * @access  Private
   */
  static async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;

      const result = await ProductService.deleteProduct(id, req.user.id);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // ==================== LIKES ====================

  /**
   * @desc    Dar like a un producto
   * @route   POST /api/products/:id/like
   * @access  Private
   */
  static async likeProduct(req, res, next) {
    try {
      const { id } = req.params;

      const result = await ProductService.likeProduct(id, req.user.id);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc    Remover like de un producto
   * @route   DELETE /api/products/:id/like
   * @access  Private
   */
  static async unlikeProduct(req, res, next) {
    try {
      const { id } = req.params;

      const result = await ProductService.unlikeProduct(id, req.user.id);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc    Obtener likes de un producto
   * @route   GET /api/products/:id/likes
   * @access  Public
   */
  static async getProductLikes(req, res, next) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const pagination = {
        limit: Math.min(parseInt(limit), 100),
        offset: (parseInt(page) - 1) * parseInt(limit)
      };

      const result = await ProductService.getProductLikes(id, pagination);

      res.json({
        success: true,
        message: 'Likes retrieved successfully',
        data: result.items,
        pagination: {
          total: result.total,
          page: parseInt(page),
          limit: pagination.limit,
          pages: Math.ceil(result.total / pagination.limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================== COMMENTS ====================

  /**
   * @desc    Crear comentario en un producto
   * @route   POST /api/products/:id/comments
   * @access  Private
   */
  static async addComment(req, res, next) {
    try {
      const { id } = req.params;
      const { content, parentCommentId } = req.body;

      const result = await ProductService.commentProduct(
        id,
        req.user.id,
        content,
        parentCommentId
      );

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc    Obtener comentarios de un producto
   * @route   GET /api/products/:id/comments
   * @access  Public
   */
  static async getProductComments(req, res, next) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const pagination = {
        limit: Math.min(parseInt(limit), 100),
        offset: (parseInt(page) - 1) * parseInt(limit)
      };

      const result = await ProductService.getProductComments(id, pagination);

      res.json({
        success: true,
        message: 'Comments retrieved successfully',
        data: result.items,
        pagination: {
          total: result.total,
          page: parseInt(page),
          limit: pagination.limit,
          pages: Math.ceil(result.total / pagination.limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc    Eliminar comentario
   * @route   DELETE /api/products/comments/:commentId
   * @access  Private
   */
  static async deleteComment(req, res, next) {
    try {
      const { commentId } = req.params;

      const result = await ProductService.deleteComment(commentId, req.user.id);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // ==================== RATINGS ====================

  /**
   * @desc    Crear rating/reseña
   * @route   POST /api/products/:id/ratings
   * @access  Private
   */
  static async addRating(req, res, next) {
    try {
      const { id } = req.params;
      const { score, review } = req.body;

      const ratingData = { score, review };

      const result = await ProductService.rateProduct(id, req.user.id, ratingData);

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc    Obtener ratings de un producto
   * @route   GET /api/products/:id/ratings
   * @access  Public
   */
  static async getProductRatings(req, res, next) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const pagination = {
        limit: Math.min(parseInt(limit), 100),
        offset: (parseInt(page) - 1) * parseInt(limit)
      };

      const result = await ProductService.getProductRatings(id, pagination);

      res.json({
        success: true,
        message: 'Ratings retrieved successfully',
        data: result.items,
        pagination: {
          total: result.total,
          page: parseInt(page),
          limit: pagination.limit,
          pages: Math.ceil(result.total / pagination.limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc    Obtener rating del usuario actual
   * @route   GET /api/products/:id/my-rating
   * @access  Private
   */
  static async getUserRating(req, res, next) {
    try {
      const { id } = req.params;

      const rating = await ProductService.getUserRating(id, req.user.id);

      res.json({
        success: true,
        message: 'User rating retrieved successfully',
        data: rating
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc    Eliminar rating
   * @route   DELETE /api/products/ratings/:ratingId
   * @access  Private
   */
  static async deleteRating(req, res, next) {
    try {
      const { ratingId } = req.params;

      const result = await ProductService.deleteRating(ratingId, req.user.id);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // ==================== SHARES ====================

  /**
   * @desc    Compartir producto
   * @route   POST /api/products/:id/share
   * @access  Private
   */
  static async shareProduct(req, res, next) {
    try {
      const { id } = req.params;
      const shareData = req.body;

      const result = await ProductService.shareProduct(id, req.user.id, shareData);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc    Obtener compartidos de un producto
   * @route   GET /api/products/:id/shares
   * @access  Public
   */
  static async getProductShares(req, res, next) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const pagination = {
        limit: Math.min(parseInt(limit), 100),
        offset: (parseInt(page) - 1) * parseInt(limit)
      };

      const result = await ProductService.getProductShares(id, pagination);

      res.json({
        success: true,
        message: 'Shares retrieved successfully',
        data: result.items,
        pagination: {
          total: result.total,
          page: parseInt(page),
          limit: pagination.limit,
          pages: Math.ceil(result.total / pagination.limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================== RECOMMENDATIONS ====================

  /**
   * @desc    Obtener productos recomendados
   * @route   GET /api/products/recommendations/featured
   * @access  Public
   */
  static async getRecommendedProducts(req, res, next) {
    try {
      const { limit = 10 } = req.query;

      const products = await ProductService.getRecommendedProducts(Math.min(parseInt(limit), 50));

      res.json({
        success: true,
        message: 'Recommended products retrieved successfully',
        data: products
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc    Obtener bestsellers
   * @route   GET /api/products/recommendations/bestsellers
   * @access  Public
   */
  static async getBestSellers(req, res, next) {
    try {
      const { limit = 10 } = req.query;

      const products = await ProductService.getBestSellerProducts(Math.min(parseInt(limit), 50));

      res.json({
        success: true,
        message: 'Best seller products retrieved successfully',
        data: products
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc    Obtener productos más recientes
   * @route   GET /api/products/recommendations/newest
   * @access  Public
   */
  static async getNewest(req, res, next) {
    try {
      const { limit = 10 } = req.query;

      const products = await ProductService.getNewestProducts(Math.min(parseInt(limit), 50));

      res.json({
        success: true,
        message: 'Newest products retrieved successfully',
        data: products
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProductController;
