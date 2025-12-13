const RecommendationService = require('../services/recommendationService');
const marketplaceRepository = require('../repositories/marketplaceRepository');

class RecommendationController {
    /**
     * GET /marketplace/recommendations
     * Obtiene productos recomendados para el usuario actual
     */
    static async getRecommendations(req, res) {
        try {
            const userContext = {
                userId: req.user?.id,
                preferredCategories: req.query.preferredCategories || [],
                recentlyViewedProductIds: req.query.recentlyViewedProductIds || [],
                purchasedBrandIds: req.query.purchasedBrandIds || [],
                currentLocation: req.query.currentLocation
            };

            const paginationOptions = {
                limit: parseInt(req.query.limit) || 20,
                offset: parseInt(req.query.offset) || 0
            };

            const recommendations = await RecommendationService.getRecommendedProducts(
                userContext,
                marketplaceRepository,
                paginationOptions
            );

            res.json({
                success: true,
                data: recommendations,
                count: recommendations.length
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * GET /marketplace/products/:productId/related
     * Obtiene productos relacionados a uno específico
     */
    static async getRelatedProducts(req, res) {
        try {
            const { productId } = req.params;
            const paginationOptions = {
                limit: parseInt(req.query.limit) || 10,
                offset: parseInt(req.query.offset) || 0
            };

            const relatedProducts = await RecommendationService.getRelatedProducts(
                productId,
                marketplaceRepository,
                paginationOptions
            );

            res.json({
                success: true,
                data: relatedProducts,
                count: relatedProducts.length
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = RecommendationController;
