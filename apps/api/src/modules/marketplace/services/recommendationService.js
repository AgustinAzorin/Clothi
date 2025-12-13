const { Category } = require('../../../models');

class RecommendationService {
    /**
     * Obtiene productos recomendados basados en preferencias del usuario
     * @param {Object} userContext - Contexto del usuario
     * @param {string} userContext.userId - ID del usuario
     * @param {Array<string>} userContext.preferredCategories - Nombres de categorías preferidas
     * @param {Array<string>} userContext.recentlyViewedProductIds - IDs de productos vistos recientemente
     * @param {Array<string>} userContext.purchasedBrandIds - IDs de marcas compradas
     * @param {string} userContext.currentLocation - Ubicación actual del usuario
     * @param {Object} marketplaceRepository - Instancia del repository
     * @param {Object} options - Opciones de paginación (limit, offset)
     * @returns {Promise<Array>} Productos recomendados ordenados por relevancia
     */
    static async getRecommendedProducts(userContext = {}, marketplaceRepository, options = {}) {
        // Validar datos de entrada
        this._validateUserContext(userContext);

        // Resolver IDs de categorías desde nombres
        const preferredCategoryIds = await this._resolveCategoryIds(userContext.preferredCategories || []);

        // Obtener productos sin filtrar usando el repository
        const allProducts = await marketplaceRepository.getPublishedProductsWithStock(options);

        // Aplicar filtros en memoria (separación de responsabilidades)
        const filteredProducts = this._applyFilters(allProducts, {
            preferredCategoryIds,
            recentlyViewedProductIds: userContext.recentlyViewedProductIds || [],
            purchasedBrandIds: userContext.purchasedBrandIds || []
        });

        // Calcular scores de recomendación
        const scoredProducts = this._scoreProducts(filteredProducts, {
            preferredCategoryIds,
            purchasedBrandIds: userContext.purchasedBrandIds || []
        });

        // Ordenar por score y retornar
        return scoredProducts.sort((a, b) => b.recommendationScore - a.recommendationScore);
    }

    /**
     * Valida que el contexto del usuario tenga los datos necesarios
     * @private
     */
    static _validateUserContext(userContext) {
        if (typeof userContext !== 'object' || userContext === null) {
            throw new Error('userContext debe ser un objeto válido');
        }

        if (userContext.preferredCategories && !Array.isArray(userContext.preferredCategories)) {
            throw new Error('preferredCategories debe ser un array de strings');
        }

        if (userContext.recentlyViewedProductIds && !Array.isArray(userContext.recentlyViewedProductIds)) {
            throw new Error('recentlyViewedProductIds debe ser un array de strings');
        }

        if (userContext.purchasedBrandIds && !Array.isArray(userContext.purchasedBrandIds)) {
            throw new Error('purchasedBrandIds debe ser un array de strings');
        }
    }

    /**
     * Resuelve nombres de categorías a sus IDs en la base de datos
     * @private
     */
    static async _resolveCategoryIds(categoryNames) {
        if (!categoryNames || categoryNames.length === 0) {
            return [];
        }

        try {
            const categories = await Category.findAll({
                where: {
                    name: categoryNames // Sequelize manejará correctamente el IN
                },
                attributes: ['id', 'name'],
                raw: true
            });

            return categories.map(cat => cat.id);
        } catch (error) {
            throw new Error(`Error al resolver categorías: ${error.message}`);
        }
    }

    /**
     * Aplica filtros a la lista de productos
     * @private
     */
    static _applyFilters(products, filterOptions) {
        let filtered = [...products];

        // Filtro 1: Excluir productos vistos recientemente
        if (filterOptions.recentlyViewedProductIds.length > 0) {
            filtered = filtered.filter(
                product => !filterOptions.recentlyViewedProductIds.includes(product.id)
            );
        }

        // Filtro 2: Si hay categorías preferidas, priorizar pero no excluir otros
        // (la priorización se hace en el scoring)
        // Aquí solo mantenemos todos los productos para que el scoring los ordene

        return filtered;
    }

    /**
     * Calcula scores de recomendación para cada producto
     * @private
     */
    static _scoreProducts(products, scoreContext) {
        return products.map(product => {
            let score = 0;

            // 1. BONUS POR CATEGORÍA PREFERIDA (100 puntos)
            // Solo sumar si el producto está REALMENTE en una categoría preferida
            if (
                scoreContext.preferredCategoryIds.length > 0 &&
                product.category_id &&
                scoreContext.preferredCategoryIds.includes(product.category_id)
            ) {
                score += 100;
            }

            // 2. BONUS POR PRODUCTO DESTACADO (50 puntos)
            if (product.is_featured) {
                score += 50;
            }

            // 3. BONUS POR POPULARIDAD (basado en métricas)
            // - Compras: 5 puntos por compra
            // - Likes: 2 puntos por like
            // - Vistas: 0.5 puntos por vista
            score += (product.purchase_count || 0) * 5;
            score += (product.like_count || 0) * 2;
            score += (product.view_count || 0) * 0.5;

            // 4. BONUS POR MARCA COMPRADA (30 puntos)
            // Asumiendo que las marcas pueden estar en tags o en una propiedad brand
            if (scoreContext.purchasedBrandIds.length > 0 && product.tags) {
                const brandMatch = scoreContext.purchasedBrandIds.some(brand =>
                    product.tags.includes(brand)
                );
                if (brandMatch) {
                    score += 30;
                }
            }

            return {
                ...product.dataValues || product,
                recommendationScore: score
            };
        });
    }

    /**
     * Obtiene productos relacionados a uno específico
     * @param {string} productId - ID del producto de referencia
     * @param {Object} marketplaceRepository - Instancia del repository
     * @param {Object} options - Opciones (limit, offset)
     * @returns {Promise<Array>} Productos relacionados
     */
    static async getRelatedProducts(productId, marketplaceRepository, options = {}) {
        const referenceProduct = await marketplaceRepository.getProductById(productId);

        if (!referenceProduct) {
            throw new Error(`Producto ${productId} no encontrado`);
        }

        // Obtener productos de la misma categoría
        const relatedProducts = await marketplaceRepository.getProductsByCategory(
            referenceProduct.category_id,
            {
                excludeProductId: productId,
                ...options
            }
        );

        // Ordenar por popularidad
        return relatedProducts.sort(
            (a, b) => (b.purchase_count + b.like_count) - (a.purchase_count + a.like_count)
        );
    }
}

module.exports = RecommendationService;
