const { Product, ProductAsset, Category, Tag, Brand, Like, Comment, Rating, Share, UserProfile, sequelize } = require('../../../models');
const { QueryTypes, Op } = require('sequelize');

class ProductRepository {
  /**
   * Encontrar producto por ID con todas las relaciones
   */
  static async findById(id, options = {}) {
    const defaultOptions = {
      include: [
        { model: UserProfile, as: 'seller', attributes: ['id', 'username', 'display_name', 'avatar_url'] },
        { model: Category, as: 'category' },
        { model: ProductAsset, as: 'assets' },
        { model: Tag, as: 'tags', through: { attributes: [] } },
        { model: Brand, as: 'brands', through: { attributes: [] } }
      ],
      ...options
    };
    
    return await Product.findByPk(id, defaultOptions);
  }

  /**
   * Encontrar todos los productos con paginación y filtros
   */
  static async findAll(filters = {}, pagination = {}) {
    const { 
      sellerId, 
      categoryId, 
      status, 
      isFeatured,
      minPrice,
      maxPrice,
      search,
      tags = [],
      brands = [],
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = filters;

    const { limit = 20, offset = 0 } = pagination;

    const where = {};
    
    if (sellerId) where.seller_id = sellerId;
    if (categoryId) where.category_id = categoryId;
    if (status) where.status = status;
    if (isFeatured !== undefined) where.is_featured = isFeatured;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = minPrice;
      if (maxPrice) where.price[Op.lte] = maxPrice;
    }
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const include = [
      { model: UserProfile, as: 'seller', attributes: ['id', 'username', 'display_name', 'avatar_url'] },
      { model: Category, as: 'category' },
      { model: ProductAsset, as: 'assets', limit: 3, separate: true },
      { model: Tag, as: 'tags', through: { attributes: [] }, separate: true },
      { model: Brand, as: 'brands', through: { attributes: [] }, separate: true }
    ];

    // Agregar filtros de tags y brands
    if (tags.length > 0) {
      include.push({
        model: Tag,
        as: 'tags',
        where: { id: { [Op.in]: tags } },
        through: { attributes: [] },
        required: true
      });
    }

    if (brands.length > 0) {
      include.push({
        model: Brand,
        as: 'brands',
        where: { id: { [Op.in]: brands } },
        through: { attributes: [] },
        required: true
      });
    }

    const order = [[sortBy, sortOrder]];

    const result = await Product.findAndCountAll({
      where,
      include,
      order,
      limit,
      offset,
      distinct: true,
      subQuery: false
    });

    return {
      items: result.rows,
      total: result.count,
      limit,
      offset
    };
  }

  /**
   * Crear nuevo producto
   */
  static async create(productData, transaction = null) {
    const options = transaction ? { transaction } : {};
    
    const product = await Product.create(productData, options);
    
    // Si hay tags, asociarlos
    if (productData.tags && productData.tags.length > 0) {
      await product.addTags(productData.tags, options);
    }

    // Si hay brands, asociarlos
    if (productData.brands && productData.brands.length > 0) {
      await product.addBrands(productData.brands, options);
    }

    return this.findById(product.id);
  }

  /**
   * Actualizar producto
   */
  static async update(id, productData, transaction = null) {
    const product = await this.findById(id);
    
    if (!product) {
      throw new Error('Product not found');
    }

    const options = transaction ? { transaction } : {};

    // Actualizar datos básicos
    const fieldsToUpdate = Object.keys(productData).filter(
      key => !['tags', 'brands', 'assets'].includes(key)
    );
    
    const updateData = fieldsToUpdate.reduce((acc, key) => {
      acc[key] = productData[key];
      return acc;
    }, {});

    await product.update(updateData, options);

    // Actualizar tags
    if (productData.tags !== undefined) {
      await product.setTags(productData.tags || [], options);
    }

    // Actualizar brands
    if (productData.brands !== undefined) {
      await product.setBrands(productData.brands || [], options);
    }

    return this.findById(id);
  }

  /**
   * Eliminar producto
   */
  static async delete(id, transaction = null) {
    const product = await this.findById(id);
    
    if (!product) {
      throw new Error('Product not found');
    }

    const options = transaction ? { transaction } : {};
    await product.destroy(options);
    
    return true;
  }

  /**
   * Obtener likes de un producto
   */
  static async getLikes(productId, pagination = {}) {
    const { limit = 20, offset = 0 } = pagination;

    const result = await Like.findAndCountAll({
      where: { product_id: productId },
      include: [
        { model: UserProfile, as: 'user', attributes: ['id', 'username', 'display_name', 'avatar_url'] }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    return {
      items: result.rows,
      total: result.count
    };
  }

  /**
   * Verificar si usuario le dio like a un producto
   */
  static async hasLiked(productId, userId) {
    const like = await Like.findOne({
      where: { product_id: productId, user_id: userId }
    });

    return !!like;
  }

  /**
   * Agregar like
   */
  static async addLike(productId, userId, transaction = null) {
    const options = transaction ? { transaction } : {};

    const existingLike = await Like.findOne({
      where: { product_id: productId, user_id: userId }
    });

    if (existingLike) {
      throw new Error('You already liked this product');
    }

    return await Like.create(
      { product_id: productId, user_id: userId },
      options
    );
  }

  /**
   * Remover like
   */
  static async removeLike(productId, userId, transaction = null) {
    const options = transaction ? { transaction } : {};

    return await Like.destroy({
      where: { product_id: productId, user_id: userId },
      ...options
    });
  }

  /**
   * Obtener comentarios de un producto
   */
  static async getComments(productId, pagination = {}) {
    const { limit = 20, offset = 0 } = pagination;

    const result = await Comment.findAndCountAll({
      where: { 
        product_id: productId,
        parent_comment_id: null // Solo comentarios principales
      },
      include: [
        { model: UserProfile, as: 'user', attributes: ['id', 'username', 'display_name', 'avatar_url'] },
        {
          model: Comment,
          as: 'replies',
          include: [
            { model: UserProfile, as: 'user', attributes: ['id', 'username', 'display_name', 'avatar_url'] }
          ]
        }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    return {
      items: result.rows,
      total: result.count
    };
  }

  /**
   * Crear comentario en producto
   */
  static async addComment(productId, userId, content, parentCommentId = null, transaction = null) {
    const options = transaction ? { transaction } : {};

    return await Comment.create(
      {
        product_id: productId,
        user_id: userId,
        content,
        parent_comment_id: parentCommentId
      },
      {
        ...options,
        include: [
          { model: UserProfile, as: 'user', attributes: ['id', 'username', 'display_name', 'avatar_url'] }
        ]
      }
    );
  }

  /**
   * Eliminar comentario
   */
  static async deleteComment(commentId, transaction = null) {
    const options = transaction ? { transaction } : {};

    return await Comment.destroy({
      where: { id: commentId },
      ...options
    });
  }

  /**
   * Obtener ratings de un producto
   */
  static async getRatings(productId, pagination = {}) {
    const { limit = 20, offset = 0 } = pagination;

    const result = await Rating.findAndCountAll({
      where: { product_id: productId },
      include: [
        { model: UserProfile, as: 'user', attributes: ['id', 'username', 'display_name', 'avatar_url'] }
      ],
      order: [['helpful_count', 'DESC'], ['created_at', 'DESC']],
      limit,
      offset
    });

    return {
      items: result.rows,
      total: result.count
    };
  }

  /**
   * Obtener rating de un usuario para un producto
   */
  static async getUserRating(productId, userId) {
    return await Rating.findOne({
      where: { product_id: productId, user_id: userId },
      include: [
        { model: UserProfile, as: 'user', attributes: ['id', 'username', 'display_name', 'avatar_url'] }
      ]
    });
  }

  /**
   * Crear o actualizar rating
   */
  static async addRating(productId, userId, ratingData, transaction = null) {
    const options = transaction ? { transaction } : {};

    const existingRating = await Rating.findOne({
      where: { product_id: productId, user_id: userId }
    });

    if (existingRating) {
      await existingRating.update(ratingData, options);
      return this.getUserRating(productId, userId);
    }

    return await Rating.create(
      {
        product_id: productId,
        user_id: userId,
        ...ratingData
      },
      {
        ...options,
        include: [
          { model: UserProfile, as: 'user', attributes: ['id', 'username', 'display_name', 'avatar_url'] }
        ]
      }
    );
  }

  /**
   * Eliminar rating
   */
  static async deleteRating(ratingId, transaction = null) {
    const options = transaction ? { transaction } : {};

    return await Rating.destroy({
      where: { id: ratingId },
      ...options
    });
  }

  /**
   * Obtener compartidos de un producto
   */
  static async getShares(productId, pagination = {}) {
    const { limit = 20, offset = 0 } = pagination;

    const result = await Share.findAndCountAll({
      where: { product_id: productId },
      include: [
        { model: UserProfile, as: 'user', attributes: ['id', 'username', 'display_name'] },
        { model: UserProfile, as: 'sharedWith', attributes: ['id', 'username', 'display_name'] }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    return {
      items: result.rows,
      total: result.count
    };
  }

  /**
   * Compartir producto
   */
  static async addShare(productId, userId, shareData, transaction = null) {
    const options = transaction ? { transaction } : {};

    return await Share.create(
      {
        product_id: productId,
        user_id: userId,
        ...shareData
      },
      {
        ...options,
        include: [
          { model: UserProfile, as: 'user', attributes: ['id', 'username', 'display_name'] },
          { model: UserProfile, as: 'sharedWith', attributes: ['id', 'username', 'display_name'] }
        ]
      }
    );
  }

  /**
   * Obtener productos recomendados (top rated y más vendidos)
   */
  static async getRecommended(limit = 10) {
    return await Product.findAll({
      attributes: {
        include: [
          [sequelize.fn('AVG', sequelize.col('rating_count')), 'avg_rating'],
          [sequelize.fn('SUM', sequelize.col('purchase_count')), 'total_purchases']
        ]
      },
      where: { status: 'published' },
      include: [
        { model: UserProfile, as: 'seller', attributes: ['id', 'username', 'display_name'] },
        { model: Category, as: 'category' },
        { model: ProductAsset, as: 'assets', limit: 1 }
      ],
      order: [['average_rating', 'DESC'], ['purchase_count', 'DESC']],
      limit,
      subQuery: false
    });
  }

  /**
   * Obtener productos más vendidos
   */
  static async getBestSellers(limit = 10) {
    return await Product.findAll({
      where: { status: 'published' },
      include: [
        { model: UserProfile, as: 'seller', attributes: ['id', 'username', 'display_name'] },
        { model: Category, as: 'category' },
        { model: ProductAsset, as: 'assets', limit: 1 }
      ],
      order: [['purchase_count', 'DESC']],
      limit
    });
  }

  /**
   * Obtener productos más recientes
   */
  static async getNewest(limit = 10) {
    return await Product.findAll({
      where: { status: 'published' },
      include: [
        { model: UserProfile, as: 'seller', attributes: ['id', 'username', 'display_name'] },
        { model: Category, as: 'category' },
        { model: ProductAsset, as: 'assets', limit: 1 }
      ],
      order: [['created_at', 'DESC']],
      limit
    });
  }

  /**
   * Incrementar view count de un producto
   */
  static async incrementViews(productId) {
    return await Product.increment('view_count', {
      by: 1,
      where: { id: productId }
    });
  }
}

module.exports = ProductRepository;
