const RecommendationService = require('../../modules/marketplace/services/recommendationService');

describe('RecommendationService', () => {
    describe('_validateUserContext', () => {
        it('debe lanzar error si userContext no es un objeto', () => {
            expect(() => {
                RecommendationService._validateUserContext(null);
            }).toThrow('userContext debe ser un objeto válido');

            expect(() => {
                RecommendationService._validateUserContext('invalid');
            }).toThrow('userContext debe ser un objeto válido');
        });

        it('debe lanzar error si preferredCategories no es un array', () => {
            expect(() => {
                RecommendationService._validateUserContext({
                    preferredCategories: 'Electrónica'
                });
            }).toThrow('preferredCategories debe ser un array de strings');
        });

        it('debe lanzar error si recentlyViewedProductIds no es un array', () => {
            expect(() => {
                RecommendationService._validateUserContext({
                    recentlyViewedProductIds: 'P001'
                });
            }).toThrow('recentlyViewedProductIds debe ser un array de strings');
        });

        it('debe aceptar un userContext válido', () => {
            expect(() => {
                RecommendationService._validateUserContext({
                    preferredCategories: [],
                    recentlyViewedProductIds: [],
                    purchasedBrandIds: []
                });
            }).not.toThrow();
        });
    });

    describe('_applyFilters', () => {
        const mockProducts = [
            { id: 'P1', name: 'Producto 1', category_id: 'CAT1' },
            { id: 'P2', name: 'Producto 2', category_id: 'CAT1' },
            { id: 'P3', name: 'Producto 3', category_id: 'CAT2' }
        ];

        it('debe excluir productos vistos recientemente', () => {
            const result = RecommendationService._applyFilters(mockProducts, {
                recentlyViewedProductIds: ['P1', 'P3'],
                preferredCategoryIds: []
            });

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('P2');
        });

        it('debe retornar todos los productos si no hay filtros', () => {
            const result = RecommendationService._applyFilters(mockProducts, {
                recentlyViewedProductIds: [],
                preferredCategoryIds: []
            });

            expect(result).toHaveLength(3);
        });

        it('debe retornar lista vacía si todos los productos están vistos', () => {
            const result = RecommendationService._applyFilters(mockProducts, {
                recentlyViewedProductIds: ['P1', 'P2', 'P3'],
                preferredCategoryIds: []
            });

            expect(result).toHaveLength(0);
        });
    });

    describe('_scoreProducts', () => {
        const mockProducts = [
            {
                id: 'P1',
                category_id: 'CAT1',
                is_featured: true,
                purchase_count: 10,
                like_count: 5,
                view_count: 100,
                tags: ['B_Sony']
            },
            {
                id: 'P2',
                category_id: 'CAT2',
                is_featured: false,
                purchase_count: 2,
                like_count: 1,
                view_count: 20,
                tags: ['B_Apple']
            },
            {
                id: 'P3',
                category_id: 'CAT1',
                is_featured: false,
                purchase_count: 0,
                like_count: 0,
                view_count: 0,
                tags: []
            }
        ];

        it('debe calcular score correcto para producto en categoría preferida', () => {
            const scored = RecommendationService._scoreProducts(mockProducts, {
                preferredCategoryIds: ['CAT1'],
                purchasedBrandIds: []
            });

            const p1 = scored.find(p => p.id === 'P1');
            const p2 = scored.find(p => p.id === 'P2');

            // P1: 100 (categoría) + 50 (featured) + 50 (10*5) + 10 (5*2) + 50 (100*0.5) = 260
            expect(p1.recommendationScore).toBe(260);

            // P2: 0 (categoría) + 0 (not featured) + 10 (2*5) + 2 (1*2) + 10 (20*0.5) = 22
            expect(p2.recommendationScore).toBe(22);
        });

        it('debe NOT sumar puntos de categoría si no está en preferidas', () => {
            const scored = RecommendationService._scoreProducts(mockProducts, {
                preferredCategoryIds: ['CAT_NO_EXISTE'],
                purchasedBrandIds: []
            });

            const p1 = scored.find(p => p.id === 'P1');
            // P1: 0 (no en categoría preferida) + 50 (featured) + 50 + 10 + 50 = 160
            expect(p1.recommendationScore).toBe(160);
        });

        it('debe sumar puntos si la marca fue comprada', () => {
            const scored = RecommendationService._scoreProducts(mockProducts, {
                preferredCategoryIds: [],
                purchasedBrandIds: ['B_Sony']
            });

            const p1 = scored.find(p => p.id === 'P1');
            const p2 = scored.find(p => p.id === 'P2');

            // P1 tiene B_Sony: debería tener más puntos que P2
            expect(p1.recommendationScore).toBeGreaterThan(p2.recommendationScore);
            
            // P2 sin marcas compradas debería tener menos puntos
            expect(p2.recommendationScore).toBeLessThan(p1.recommendationScore);
        });

        it('debe ordenar correctamente por score (mayor a menor)', () => {
            const scored = RecommendationService._scoreProducts(mockProducts, {
                preferredCategoryIds: ['CAT1'],
                purchasedBrandIds: []
            });

            const sorted = scored.sort((a, b) => b.recommendationScore - a.recommendationScore);

            expect(sorted[0].id).toBe('P1'); // Score: 260
            expect(sorted[1].id).toBe('P3'); // Score: 150 (100 de categoría + 50 de featured)
            expect(sorted[2].id).toBe('P2'); // Score: 22
        });

        it('debe manejar productos sin valores numéricos', () => {
            const productsWithNull = [
                {
                    id: 'P1',
                    category_id: 'CAT1',
                    is_featured: false,
                    purchase_count: null,
                    like_count: null,
                    view_count: null,
                    tags: []
                }
            ];

            expect(() => {
                RecommendationService._scoreProducts(productsWithNull, {
                    preferredCategoryIds: ['CAT1'],
                    purchasedBrandIds: []
                });
            }).not.toThrow();

            const scored = RecommendationService._scoreProducts(productsWithNull, {
                preferredCategoryIds: ['CAT1'],
                purchasedBrandIds: []
            });

            expect(scored[0].recommendationScore).toBe(100);
        });
    });

    describe('Integración: Flujo completo', () => {
        // Estos tests requieren mocks de la BD
        // Aquí se muestran ejemplos de cómo se harían

        it('debe combinar filtros + scoring correctamente', () => {
            const products = [
                { id: 'P1', category_id: 'CAT1', is_featured: true, purchase_count: 5, like_count: 2, view_count: 50, tags: [] },
                { id: 'P2', category_id: 'CAT1', is_featured: false, purchase_count: 1, like_count: 0, view_count: 10, tags: [] },
                { id: 'P3', category_id: 'CAT2', is_featured: false, purchase_count: 20, like_count: 15, view_count: 500, tags: [] }
            ];

            // Filtrar
            const filtered = RecommendationService._applyFilters(products, {
                recentlyViewedProductIds: ['P3'],
                preferredCategoryIds: ['CAT1']
            });

            // Score
            const scored = RecommendationService._scoreProducts(filtered, {
                preferredCategoryIds: ['CAT1'],
                purchasedBrandIds: []
            });

            // Ordenar
            const sorted = scored.sort((a, b) => b.recommendationScore - a.recommendationScore);

            expect(filtered).toHaveLength(2);
            expect(sorted[0].id).toBe('P1');
            expect(sorted[1].id).toBe('P2');
        });
    });
});

module.exports = RecommendationService;
