const { Product, Category } = require('../../../models');
const { Op } = require('sequelize');

/**
 * MarketplaceRepository
 * Responsabilidades: Acceso a datos de forma segura y reutilizable
 * NO incluye: lógica de negocio, scoring, o filtros complejos
 */
class marketplaceRepository {
    /**
     * Obtener todos los productos con opciones de paginación
     * @param {Object} options - { limit, offset, attributes }
     * @returns {Promise<Array>} Array de productos
     */
    static async getAllProducts(options = {}) {
        const defaultOptions = {
            attributes: { exclude: ['created_at', 'updated_at'] },
            ...options
        };
        return await Product.findAll(defaultOptions);
    }

    /**
     * Obtener productos publicados con stock disponible
     * Usado como base para la lógica de recomendación en el service
     * @param {Object} options - { limit, offset }
     * @returns {Promise<Array>} Array de productos publicados
     */
    static async getPublishedProductsWithStock(options = {}) {
        const {
            limit = 100, // Traer más para que el service haga scoring
            offset = 0
        } = options;

        return await Product.findAll({
            where: {
                status: 'PUBLISHED',
                stock_quantity: { [Op.gt]: 0 }
            },
            attributes: { exclude: ['created_at', 'updated_at'] },
            limit,
            offset,
            raw: true
        });
    }

    /**
     * Obtener un producto por ID
     * @param {string} productId - ID del producto
     * @returns {Promise<Object|null>} Producto o null si no existe
     */
    static async getProductById(productId) {
        return await Product.findByPk(productId, {
            attributes: { exclude: ['created_at', 'updated_at'] },
            raw: true
        });
    }

    /**
     * Obtener productos por categoría
     * @param {string} categoryId - ID de la categoría
     * @param {Object} options - { limit, offset, excludeProductId }
     * @returns {Promise<Array>} Array de productos en la categoría
     */
    static async getProductsByCategory(categoryId, options = {}) {
        const {
            limit = 20,
            offset = 0,
            excludeProductId = null
        } = options;

        const where = {
            category_id: categoryId,
            status: 'PUBLISHED',
            stock_quantity: { [Op.gt]: 0 }
        };

        if (excludeProductId) {
            where.id = { [Op.ne]: excludeProductId };
        }

        return await Product.findAll({
            where,
            attributes: { exclude: ['created_at', 'updated_at'] },
            limit,
            offset,
            raw: true
        });
    }

    /**
     * Obtener productos por IDs específicos
     * @param {Array<string>} productIds - Array de IDs
     * @returns {Promise<Array>} Array de productos encontrados
     */
    static async getProductsByIds(productIds = []) {
        if (!Array.isArray(productIds) || productIds.length === 0) {
            return [];
        }

        return await Product.findAll({
            where: {
                id: { [Op.in]: productIds }
            },
            attributes: { exclude: ['created_at', 'updated_at'] },
            raw: true
        });
    }

    /**
     * Buscar productos por nombre o descripción
     * @param {string} searchTerm - Término de búsqueda
     * @param {Object} options - { limit, offset }
     * @returns {Promise<Array>} Array de productos que coinciden
     */
    static async searchProducts(searchTerm, options = {}) {
        const {
            limit = 20,
            offset = 0
        } = options;

        if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length === 0) {
            throw new Error('searchTerm debe ser una cadena no vacía');
        }

        return await Product.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.iLike]: `%${searchTerm}%` } },
                    { description: { [Op.iLike]: `%${searchTerm}%` } }
                ],
                status: 'PUBLISHED',
                stock_quantity: { [Op.gt]: 0 }
            },
            attributes: { exclude: ['created_at', 'updated_at'] },
            limit,
            offset,
            raw: true
        });
    }

    /**
     * Obtener categorías por nombres
     * @param {Array<string>} categoryNames - Array de nombres de categorías
     * @returns {Promise<Array>} Array de categorías encontradas
     */
    static async getCategoriesByNames(categoryNames = []) {
        if (!Array.isArray(categoryNames) || categoryNames.length === 0) {
            return [];
        }

        return await Category.findAll({
            where: {
                name: { [Op.in]: categoryNames }
            },
            attributes: ['id', 'name'],
            raw: true
        });
    }
}

module.exports = marketplaceRepository;