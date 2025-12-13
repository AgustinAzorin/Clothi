/**
 * EJEMPLOS AVANZADOS Y MEJORAS FUTURAS
 * 
 * Este archivo documenta uso avanzado del servicio de recomendaciones
 * y posibles mejoras para versiones futuras
 */

// ============================================================================
// 1. EJEMPLO: USO AVANZADO CON CONTEXTO COMPLETO
// ============================================================================

/**
 * Ejemplo de controller usando todas las preferencias del usuario
 */
async function getPersonalizedRecommendations(req, res) {
    try {
        const userContext = {
            userId: req.user.id,
            preferredCategories: req.user.preferences?.categories || [],
            recentlyViewedProductIds: req.user.recentViewHistory || [],
            purchasedBrandIds: req.user.purchaseHistory?.map(p => p.brand_id) || [],
            currentLocation: req.user.location || null
        };

        const recommendations = await RecommendationService.getRecommendedProducts(
            userContext,
            marketplaceRepository,
            { limit: 20, offset: 0 }
        );

        res.json({
            success: true,
            data: recommendations.map(product => ({
                ...product,
                // Enriquecer respuesta con datos adicionales
                relevanceReason: explainRelevance(product, userContext)
            }))
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
}

/**
 * Función auxiliar para explicar por qué se recomienda un producto
 */
function explainRelevance(product, userContext) {
    const reasons = [];

    if (userContext.preferredCategories.includes(product.category_name)) {
        reasons.push('En tu categoría preferida');
    }

    if (product.is_featured) {
        reasons.push('Producto destacado');
    }

    if (product.purchase_count > 100) {
        reasons.push('Muy popular');
    }

    if (userContext.purchasedBrandIds.some(bid => product.tags?.includes(bid))) {
        reasons.push('De una marca que te gusta');
    }

    return reasons.length > 0 ? reasons : ['Relacionado con tus intereses'];
}

// ============================================================================
// 2. MEJORA FUTURA: CACHÉ CON REDIS
// ============================================================================

/**
 * Versión con caché de recomendaciones
 * Ideal cuando hay miles de usuarios
 */
class CachedRecommendationService extends RecommendationService {
    static async getRecommendedProducts(userContext = {}, marketplaceRepository, options = {}) {
        const cacheKey = this._generateCacheKey(userContext);
        
        // Intentar obtener del caché
        const cached = await redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        // Si no está en caché, calcular
        const recommendations = await super.getRecommendedProducts(
            userContext,
            marketplaceRepository,
            options
        );

        // Guardar en caché por 1 hora
        await redis.setex(cacheKey, 3600, JSON.stringify(recommendations));

        return recommendations;
    }

    static _generateCacheKey(userContext) {
        const parts = [
            userContext.userId,
            (userContext.preferredCategories || []).sort().join(','),
            (userContext.purchasedBrandIds || []).sort().join(','),
            userContext.currentLocation
        ].filter(Boolean);

        return `recommendations:${parts.join(':')}`;
    }
}

// ============================================================================
// 3. MEJORA FUTURA: SCORING EN BASE DE DATOS
// ============================================================================

/**
 * Si el volumen crece, mover el scoring a SQL es más eficiente
 * 
 * Pseudocódigo para scoring en Sequelize:
 */
class AdvancedMarketplaceRepository extends marketplaceRepository {
    /**
     * Obtener productos con scoring ya calculado en la BD
     * Útil cuando tenemos millones de productos
     */
    static async getProductsWithScoring(userContext = {}, options = {}) {
        const { preferredCategoryIds = [], purchasedBrandIds = [] } = userContext;

        return await sequelize.query(`
            SELECT 
                p.*,
                -- Score por categoría
                CASE 
                    WHEN p.category_id IN (:categoryIds) THEN 100
                    ELSE 0 
                END +
                -- Score por featured
                CASE WHEN p.is_featured THEN 50 ELSE 0 END +
                -- Score por popularidad
                (p.purchase_count * 5) +
                (p.like_count * 2) +
                (p.view_count * 0.5) +
                -- Score por marca
                CASE 
                    WHEN p.tags && :brandIds THEN 30
                    ELSE 0 
                END AS recommendation_score
            FROM products p
            WHERE 
                p.status = 'PUBLISHED' 
                AND p.stock_quantity > 0
                AND p.id NOT IN (:viewedIds)
            ORDER BY recommendation_score DESC
            LIMIT :limit OFFSET :offset
        `, {
            replacements: {
                categoryIds: preferredCategoryIds,
                brandIds: purchasedBrandIds,
                viewedIds: userContext.recentlyViewedProductIds || [],
                limit: options.limit || 20,
                offset: options.offset || 0
            },
            type: sequelize.QueryTypes.SELECT
        });
    }
}

// ============================================================================
// 4. MEJORA FUTURA: RECOMENDACIONES COLABORATIVAS
// ============================================================================

/**
 * Filtrado colaborativo: Recomendar lo que compraron usuarios similares
 */
class CollaborativeRecommendationService extends RecommendationService {
    /**
     * Encontrar usuarios similares y sus compras
     */
    static async getCollaborativeRecommendations(userId, options = {}) {
        // 1. Encontrar usuarios con preferencias similares
        const similarUsers = await this._findSimilarUsers(userId);

        // 2. Obtener lo que compraron (que este usuario no)
        const similarUserPurchases = await this._getSimilarUserPurchases(
            similarUsers,
            userId
        );

        // 3. Puntuar por frecuencia de compra entre usuarios similares
        const scored = this._scoreByPopularity(similarUserPurchases);

        return scored.slice(0, options.limit || 20);
    }

    static async _findSimilarUsers(userId) {
        // Encontrar usuarios con overlapping en:
        // - Categorías preferidas
        // - Marcas compradas
        // - Historial de compras
        return await User.findAll({
            where: {
                id: { [Op.ne]: userId },
                // Lógica para encontrar similitud
            },
            limit: 50
        });
    }

    static async _getSimilarUserPurchases(similarUsers, currentUserId) {
        const userIds = similarUsers.map(u => u.id);
        
        return await Order.findAll({
            where: {
                user_id: { [Op.in]: userIds },
                // Excluir lo que ya compró el usuario actual
            },
            include: [{ association: 'items', include: ['product'] }]
        });
    }

    static _scoreByPopularity(purchases) {
        const productScores = {};

        purchases.forEach(order => {
            order.items.forEach(item => {
                const pid = item.product_id;
                productScores[pid] = (productScores[pid] || 0) + 1;
            });
        });

        return Object.entries(productScores)
            .map(([productId, score]) => ({ productId, score }))
            .sort((a, b) => b.score - a.score);
    }
}

// ============================================================================
// 5. MEJORA FUTURA: A/B TESTING DE PESOS DE SCORING
// ============================================================================

/**
 * Sistema de pesos dinámicos para A/B testing
 * Permite experimentar con diferentes estrategias de scoring
 */
class ExperimentalRecommendationService extends RecommendationService {
    static async getRecommendedProducts(userContext = {}, marketplaceRepository, options = {}) {
        // Determinar qué experimento está en el usuario
        const experiment = await this._getUserExperiment(userContext.userId);
        
        // Usar pesos específicos del experimento
        const scoringWeights = this._getWeightsForExperiment(experiment);
        
        const userContextWithWeights = { ...userContext, scoringWeights };
        
        // Aplicar lógica normal con pesos alternativos
        return await this.getRecommendedProductsWithWeights(
            userContextWithWeights,
            marketplaceRepository,
            options
        );
    }

    static async _getUserExperiment(userId) {
        // Consultar tabla de experimentos para este usuario
        const userExperiment = await Experiment.findOne({
            where: { user_id: userId, active: true }
        });

        return userExperiment?.experiment_type || 'default';
    }

    static _getWeightsForExperiment(experimentType) {
        const weights = {
            default: {
                category: 100,
                featured: 50,
                purchases: 5,
                likes: 2,
                views: 0.5,
                brand: 30
            },
            // Experimento A: Mayor énfasis en featured
            featured_heavy: {
                category: 100,
                featured: 150,  // Aumentado
                purchases: 5,
                likes: 2,
                views: 0.5,
                brand: 30
            },
            // Experimento B: Mayor énfasis en popularidad
            popularity_driven: {
                category: 100,
                featured: 30,
                purchases: 10,  // Aumentado
                likes: 5,      // Aumentado
                views: 1,      // Aumentado
                brand: 30
            }
        };

        return weights[experimentType] || weights.default;
    }

    static _scoreProducts(products, scoreContext, weights = null) {
        const w = weights || this._getWeightsForExperiment('default');

        return products.map(product => {
            let score = 0;

            if (
                scoreContext.preferredCategoryIds.length > 0 &&
                product.category_id &&
                scoreContext.preferredCategoryIds.includes(product.category_id)
            ) {
                score += w.category;
            }

            if (product.is_featured) {
                score += w.featured;
            }

            score += (product.purchase_count || 0) * w.purchases;
            score += (product.like_count || 0) * w.likes;
            score += (product.view_count || 0) * w.views;

            if (scoreContext.purchasedBrandIds.length > 0 && product.tags) {
                const brandMatch = scoreContext.purchasedBrandIds.some(brand =>
                    product.tags.includes(brand)
                );
                if (brandMatch) {
                    score += w.brand;
                }
            }

            return {
                ...product.dataValues || product,
                recommendationScore: score
            };
        });
    }
}

// ============================================================================
// 6. MEJORA FUTURA: MONITOREO Y MÉTRICAS
// ============================================================================

/**
 * Registrar métricas para análisis posterior
 */
class MonitoredRecommendationService extends RecommendationService {
    static async getRecommendedProducts(userContext = {}, marketplaceRepository, options = {}) {
        const startTime = Date.now();

        const recommendations = await super.getRecommendedProducts(
            userContext,
            marketplaceRepository,
            options
        );

        // Registrar métricas
        await this._recordMetrics({
            userId: userContext.userId,
            preferredCategoriesCount: (userContext.preferredCategories || []).length,
            recommendedCount: recommendations.length,
            executionTimeMs: Date.now() - startTime,
            timestamp: new Date()
        });

        return recommendations;
    }

    static async _recordMetrics(metrics) {
        // Guardar en tabla de analytics o enviar a Sentry/DataDog
        await RecommendationMetric.create(metrics);
        
        // Opcional: Enviar a sistema de monitoreo externo
        // amplitude.logEvent('recommendations_generated', metrics);
    }
}

// ============================================================================
// 7. USO COMPLETO CON TODAS LAS MEJORAS
// ============================================================================

/**
 * Ejemplo de controller que usa todas las mejoras
 */
async function getAdvancedRecommendations(req, res) {
    try {
        const userContext = {
            userId: req.user.id,
            preferredCategories: req.user.preferences?.categories || [],
            recentlyViewedProductIds: req.session.viewHistory || [],
            purchasedBrandIds: req.user.purchaseHistory?.map(p => p.brand_id) || [],
            currentLocation: req.user.location || null
        };

        let recommendations;

        // Usar servicio con caché si el usuario es frecuente
        if (req.user.isFrequentUser) {
            recommendations = await CachedRecommendationService.getRecommendedProducts(
                userContext,
                marketplaceRepository,
                { limit: 20, offset: 0 }
            );
        }
        // Usar filtrado colaborativo para nuevos usuarios sin historial
        else if (!req.user.purchaseHistory || req.user.purchaseHistory.length === 0) {
            recommendations = await CollaborativeRecommendationService.getCollaborativeRecommendations(
                req.user.id,
                { limit: 20 }
            );
        }
        // Usar A/B testing para usuarios en experimentos
        else if (req.user.experiment_assigned) {
            recommendations = await ExperimentalRecommendationService.getRecommendedProducts(
                userContext,
                marketplaceRepository,
                { limit: 20, offset: 0 }
            );
        }
        // Default: Servicio base con monitoreo
        else {
            recommendations = await MonitoredRecommendationService.getRecommendedProducts(
                userContext,
                marketplaceRepository,
                { limit: 20, offset: 0 }
            );
        }

        res.json({
            success: true,
            data: recommendations,
            count: recommendations.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// ============================================================================
// EXPORTAR PARA USO
// ============================================================================

module.exports = {
    CachedRecommendationService,
    AdvancedMarketplaceRepository,
    CollaborativeRecommendationService,
    ExperimentalRecommendationService,
    MonitoredRecommendationService,
    getAdvancedRecommendations,
    explainRelevance
};
