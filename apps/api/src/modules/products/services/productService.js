const ProductRepository = require('../repositories/productRepository');
const { AppError } = require('../../../middleware/errorHandler');

class ProductService {
  /**
   * Obtener producto por ID
   */
  static async getProduct(productId) {
    const product = await ProductRepository.findById(productId);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Incrementar contador de vistas
    await ProductRepository.incrementViews(productId);

    return product;
  }

  /**
   * Listar productos con filtros
   */
  static async listProducts(filters = {}, pagination = {}) {
    return await ProductRepository.findAll(filters, pagination);
  }

  /**
   * Crear producto
   */
  static async createProduct(productData, sellerId) {
    try {
      // Validar que el vendedor no sea nulo
      if (!sellerId) {
        throw new AppError('Seller ID is required', 400);
      }

      // Agregar seller_id
      productData.seller_id = sellerId;

      // Validar campos requeridos
      if (!productData.name) {
        throw new AppError('Product name is required', 400);
      }

      if (productData.price === undefined || productData.price === null) {
        throw new AppError('Product price is required', 400);
      }

      const product = await ProductRepository.create(productData);

      return {
        success: true,
        message: 'Product created successfully',
        data: product
      };
    } catch (error) {
      if (error.message.includes('SKU es requerido') || error.message.includes('File URL es requerido')) {
        throw new AppError(error.message, 400);
      }
      throw error;
    }
  }

  /**
   * Actualizar producto
   */
  static async updateProduct(productId, productData, userId) {
    try {
      const product = await ProductRepository.findById(productId);

      if (!product) {
        throw new AppError('Product not found', 404);
      }

      // Verificar que el usuario sea el vendedor
      if (product.seller_id !== userId) {
        throw new AppError('You are not authorized to update this product', 403);
      }

      const updatedProduct = await ProductRepository.update(productId, productData);

      return {
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error.message.includes('Product not found')) throw error;
      throw new AppError(error.message, 400);
    }
  }

  /**
   * Eliminar producto
   */
  static async deleteProduct(productId, userId) {
    const product = await ProductRepository.findById(productId);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (product.seller_id !== userId) {
      throw new AppError('You are not authorized to delete this product', 403);
    }

    await ProductRepository.delete(productId);

    return {
      success: true,
      message: 'Product deleted successfully'
    };
  }

  /**
   * Dar like a un producto
   */
  static async likeProduct(productId, userId) {
    try {
      const product = await ProductRepository.findById(productId);

      if (!product) {
        throw new AppError('Product not found', 404);
      }

      await ProductRepository.addLike(productId, userId);

      return {
        success: true,
        message: 'Product liked successfully'
      };
    } catch (error) {
      if (error.message.includes('already liked')) {
        throw new AppError('You already liked this product', 400);
      }
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 400);
    }
  }

  /**
   * Remover like
   */
  static async unlikeProduct(productId, userId) {
    const product = await ProductRepository.findById(productId);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const hasLiked = await ProductRepository.hasLiked(productId, userId);

    if (!hasLiked) {
      throw new AppError('You did not like this product', 400);
    }

    await ProductRepository.removeLike(productId, userId);

    return {
      success: true,
      message: 'Like removed successfully'
    };
  }

  /**
   * Obtener likes de un producto
   */
  static async getProductLikes(productId, pagination = {}) {
    const product = await ProductRepository.findById(productId);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return await ProductRepository.getLikes(productId, pagination);
  }

  /**
   * Comentar en un producto
   */
  static async commentProduct(productId, userId, content, parentCommentId = null) {
    try {
      const product = await ProductRepository.findById(productId);

      if (!product) {
        throw new AppError('Product not found', 404);
      }

      if (!content || content.trim().length === 0) {
        throw new AppError('Comment content is required', 400);
      }

      if (content.length > 1000) {
        throw new AppError('Comment must be less than 1000 characters', 400);
      }

      const comment = await ProductRepository.addComment(
        productId,
        userId,
        content,
        parentCommentId
      );

      return {
        success: true,
        message: 'Comment added successfully',
        data: comment
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 400);
    }
  }

  /**
   * Obtener comentarios de un producto
   */
  static async getProductComments(productId, pagination = {}) {
    const product = await ProductRepository.findById(productId);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return await ProductRepository.getComments(productId, pagination);
  }

  /**
   * Eliminar comentario
   */
  static async deleteComment(commentId, userId) {
    try {
      // Obtener el comentario para verificar permisos
      const { Comment } = require('../../../models');
      const comment = await Comment.findByPk(commentId);

      if (!comment) {
        throw new AppError('Comment not found', 404);
      }

      if (comment.user_id !== userId) {
        throw new AppError('You are not authorized to delete this comment', 403);
      }

      await ProductRepository.deleteComment(commentId);

      return {
        success: true,
        message: 'Comment deleted successfully'
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 400);
    }
  }

  /**
   * Crear rating/reseña
   */
  static async rateProduct(productId, userId, ratingData) {
    try {
      const product = await ProductRepository.findById(productId);

      if (!product) {
        throw new AppError('Product not found', 404);
      }

      if (!ratingData.score || ratingData.score < 1 || ratingData.score > 5) {
        throw new AppError('Rating score must be between 1 and 5', 400);
      }

      const rating = await ProductRepository.addRating(productId, userId, ratingData);

      return {
        success: true,
        message: 'Rating added successfully',
        data: rating
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 400);
    }
  }

  /**
   * Obtener ratings de un producto
   */
  static async getProductRatings(productId, pagination = {}) {
    const product = await ProductRepository.findById(productId);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return await ProductRepository.getRatings(productId, pagination);
  }

  /**
   * Obtener rating del usuario actual
   */
  static async getUserRating(productId, userId) {
    const product = await ProductRepository.findById(productId);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return await ProductRepository.getUserRating(productId, userId);
  }

  /**
   * Eliminar rating
   */
  static async deleteRating(ratingId, userId) {
    try {
      const { Rating } = require('../../../models');
      const rating = await Rating.findByPk(ratingId);

      if (!rating) {
        throw new AppError('Rating not found', 404);
      }

      if (rating.user_id !== userId) {
        throw new AppError('You are not authorized to delete this rating', 403);
      }

      await ProductRepository.deleteRating(ratingId);

      return {
        success: true,
        message: 'Rating deleted successfully'
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 400);
    }
  }

  /**
   * Compartir producto
   */
  static async shareProduct(productId, userId, shareData) {
    try {
      const product = await ProductRepository.findById(productId);

      if (!product) {
        throw new AppError('Product not found', 404);
      }

      if (!shareData.shared_to) {
        throw new AppError('Share platform is required', 400);
      }

      const validPlatforms = ['whatsapp', 'facebook', 'twitter', 'instagram', 'email', 'direct_link', 'copy_link'];

      if (!validPlatforms.includes(shareData.shared_to)) {
        throw new AppError(`Invalid share platform. Must be one of: ${validPlatforms.join(', ')}`, 400);
      }

      const share = await ProductRepository.addShare(productId, userId, shareData);

      return {
        success: true,
        message: 'Product shared successfully',
        data: share
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 400);
    }
  }

  /**
   * Obtener compartidos de un producto
   */
  static async getProductShares(productId, pagination = {}) {
    const product = await ProductRepository.findById(productId);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return await ProductRepository.getShares(productId, pagination);
  }

  /**
   * Obtener productos recomendados
   */
  static async getRecommendedProducts(limit = 10) {
    return await ProductRepository.getRecommended(limit);
  }

  /**
   * Obtener bestsellers
   */
  static async getBestSellerProducts(limit = 10) {
    return await ProductRepository.getBestSellers(limit);
  }

  /**
   * Obtener productos más recientes
   */
  static async getNewestProducts(limit = 10) {
    return await ProductRepository.getNewest(limit);
  }
}

module.exports = ProductService;
