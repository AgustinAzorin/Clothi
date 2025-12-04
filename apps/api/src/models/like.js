const { DataTypes } = require('sequelize');
const { baseFields } = require('../shared/baseModel');

module.exports = (sequelize) => {
  const Like = sequelize.define('Like', {
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
      allowNull: true,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    outfit_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'outfits',
        key: 'id'
      }
    },
    post_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'posts',
        key: 'id'
      }
    }
  }, {
    tableName: 'likes',
    hooks: {
      beforeValidate: (like) => {
        // Validar que solo un campo objetivo esté lleno
        const targetCount = [like.product_id, like.outfit_id, like.post_id]
          .filter(Boolean).length;
        
        if (targetCount !== 1) {
          throw new Error('Like debe tener exactamente un objetivo (product, outfit o post)');
        }
      },
      afterCreate: async (like) => {
        // Actualizar contadores
        await updateLikeCount(like, 'increment');
      },
      afterDestroy: async (like) => {
        // Actualizar contadores
        await updateLikeCount(like, 'decrement');
      }
    },
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'product_id'],
        where: { product_id: { [sequelize.Op.ne]: null } }
      },
      {
        unique: true,
        fields: ['user_id', 'outfit_id'],
        where: { outfit_id: { [sequelize.Op.ne]: null } }
      },
      {
        unique: true,
        fields: ['user_id', 'post_id'],
        where: { post_id: { [sequelize.Op.ne]: null } }
      },
      {
        fields: ['product_id'],
        where: { product_id: { [sequelize.Op.ne]: null } }
      },
      {
        fields: ['outfit_id'],
        where: { outfit_id: { [sequelize.Op.ne]: null } }
      },
      {
        fields: ['post_id'],
        where: { post_id: { [sequelize.Op.ne]: null } }
      }
    ]
  });

  // Función helper para actualizar contadores
  async function updateLikeCount(like, operation) {
    const increment = operation === 'increment' ? 1 : -1;
    
    if (like.product_id) {
      await sequelize.models.Product.increment('like_count', {
        by: increment,
        where: { id: like.product_id }
      });
    } else if (like.outfit_id) {
      await sequelize.models.Outfit.increment('like_count', {
        by: increment,
        where: { id: like.outfit_id }
      });
    } else if (like.post_id) {
      await sequelize.models.Post.increment('like_count', {
        by: increment,
        where: { id: like.post_id }
      });
    }
  }

  return Like;
};