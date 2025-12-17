const { DataTypes, Op } = require('sequelize');
const { baseFields } = require('../shared/baseModel');

module.exports = (sequelize) => {
  const Rating = sequelize.define('Rating', {
    ...baseFields,
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'user_profiles',
        key: 'id'
      }
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
        isInt: true
      }
    },
    review: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 2000]
      }
    },
    helpful_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    unhelpful_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    }
  }, {
    tableName: 'ratings',
    hooks: {
      afterCreate: async (rating) => {
        // Actualizar rating promedio y count del producto
        await updateProductRating(rating.product_id);
      },
      afterUpdate: async (rating) => {
        // Actualizar rating promedio y count del producto
        await updateProductRating(rating.product_id);
      },
      afterDestroy: async (rating) => {
        // Actualizar rating promedio y count del producto
        await updateProductRating(rating.product_id);
      }
    },
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'product_id']
      },
      {
        fields: ['product_id']
      },
      {
        fields: ['score']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['helpful_count', 'score']
      }
    ]
  });

  // Función helper para actualizar rating promedio del producto
  async function updateProductRating(productId) {
    try {
      const { sequelize: seq } = require('../models');
      
      // Calcular el rating promedio
      const result = await Rating.findAll({
        where: { product_id: productId },
        attributes: [
          [seq.fn('AVG', seq.col('score')), 'avg_rating'],
          [seq.fn('COUNT', seq.col('id')), 'rating_count']
        ],
        raw: true
      });

      if (result && result.length > 0) {
        const avgRating = parseFloat(result[0].avg_rating) || 0;
        const ratingCount = parseInt(result[0].rating_count) || 0;

        await sequelize.models.Product.update(
          {
            average_rating: avgRating.toFixed(2),
            rating_count: ratingCount
          },
          {
            where: { id: productId }
          }
        );
      }
    } catch (error) {
      console.error('Error updating product rating:', error);
    }
  }

  return Rating;
};
