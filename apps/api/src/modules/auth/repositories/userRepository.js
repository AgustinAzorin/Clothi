const { UserProfile, sequelize } = require('../../../models');
const { QueryTypes, Op } = require('sequelize');

class UserRepository {
  /**
   * Encontrar usuario por ID
   */
  static async findById(id, options = {}) {
    const defaultOptions = {
      attributes: { exclude: ['created_at', 'updated_at'] },
      ...options
    };
    
    return await UserProfile.findByPk(id, defaultOptions);
  }

  /**
   * Encontrar usuario por email
   */
  static async findByEmail(email, options = {}) {
    const defaultOptions = {
      attributes: { exclude: ['created_at', 'updated_at'] },
      ...options
    };
    
    return await UserProfile.findOne({
      where: { email },
      ...defaultOptions
    });
  }

  /**
   * Encontrar usuario por username
   */
  static async findByUsername(username, options = {}) {
    const defaultOptions = {
      attributes: { exclude: ['created_at', 'updated_at'] },
      ...options
    };
    
    return await UserProfile.findOne({
      where: { username: username.toLowerCase() },
      ...defaultOptions
    });
  }

  /**
   * Crear nuevo usuario
   */
  static async create(userData, transaction = null) {
    const options = transaction ? { transaction } : {};
    
    return await UserProfile.create({
      id: userData.id,
      username: userData.username,
      display_name: userData.display_name || userData.username,
      bio: userData.bio || '',
      email: userData.email,
      avatar_url: userData.avatar_url || null,
      ...userData
    }, options);
  }

  /**
   * Actualizar usuario
   */
  static async update(id, updateData, transaction = null) {
    const options = transaction ? { where: { id }, transaction } : { where: { id } };
    
    const [affectedRows] = await UserProfile.update(updateData, options);
    
    if (affectedRows === 0) {
      throw new Error('User not found or no changes made');
    }
    
    return await this.findById(id);
  }

  /**
   * Actualizar parcialmente (PATCH)
   */
  static async patch(id, patchData, transaction = null) {
    const user = await this.findById(id);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return await user.update(patchData, { transaction });
  }

  /**
   * Eliminar usuario
   */
  static async delete(id, transaction = null) {
    const options = transaction ? { where: { id }, transaction } : { where: { id } };
    
    const deleted = await UserProfile.destroy(options);
    
    if (deleted === 0) {
      throw new Error('User not found');
    }
    
    return true;
  }

  /**
   * Buscar usuarios con paginación
   */
  static async findAllPaginated({
    page = 1,
    limit = 10,
    sortBy = 'created_at',
    sortOrder = 'DESC',
    search = '',
    filters = {}
  } = {}) {
    const offset = (page - 1) * limit;
    
    // Construir where clause
    const where = { ...filters };
    
    if (search) {
      where[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { display_name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    // Ejecutar query
    const { count, rows } = await UserProfile.findAndCountAll({
      where,
      attributes: { exclude: ['created_at', 'updated_at'] },
      order: [[sortBy, sortOrder]],
      limit,
      offset,
      distinct: true
    });
    
    return {
      users: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
        hasNextPage: page * limit < count,
        hasPrevPage: page > 1
      }
    };
  }

  /**
   * Actualizar estadísticas del usuario
   */
  static async updateStats(userId, statsUpdate, transaction = null) {
    const updates = {};
    
    // Construir incrementos/decrementos
    Object.keys(statsUpdate).forEach(key => {
      if (statsUpdate[key] > 0) {
        updates[key] = sequelize.literal(`"${key}" + ${statsUpdate[key]}`);
      } else if (statsUpdate[key] < 0) {
        updates[key] = sequelize.literal(`"${key}" - ${Math.abs(statsUpdate[key])}`);
      }
    });
    
    const options = transaction ? 
      { where: { id: userId }, transaction } : 
      { where: { id: userId } };
    
    const [affectedRows] = await UserProfile.update(updates, options);
    
    if (affectedRows === 0) {
      throw new Error('User not found');
    }
    
    return await this.findById(userId);
  }

  /**
   * Buscar vendedores destacados
   */
  static async findFeaturedSellers(limit = 10) {
    return await UserProfile.findAll({
      where: {
        is_seller: true,
        total_sales: { [Op.gt]: 0 }
      },
      order: [
        ['seller_rating', 'DESC'],
        ['total_sales', 'DESC'],
        ['follower_count', 'DESC']
      ],
      limit,
      attributes: [
        'id',
        'username',
        'display_name',
        'avatar_url',
        'shop_name',
        'seller_rating',
        'total_sales',
        'follower_count'
      ]
    });
  }

  /**
   * Verificar si username está disponible
   */
  static async isUsernameAvailable(username) {
    const existing = await this.findByUsername(username);
    return !existing;
  }

  /**
   * Obtener estadísticas de usuario
   */
  static async getUserStats(userId) {
    const user = await this.findById(userId, {
      attributes: [
        'follower_count',
        'following_count',
        'outfit_count',
        'total_sales',
        'seller_rating'
      ]
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Podrías agregar más estadísticas aquí
    return user;
  }
}

module.exports = UserRepository;