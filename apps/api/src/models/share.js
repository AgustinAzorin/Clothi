const { DataTypes } = require('sequelize');
const { baseFields } = require('../shared/baseModel');

module.exports = (sequelize) => {
  const Share = sequelize.define('Share', {
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
    },
    shared_to: {
      type: DataTypes.ENUM('whatsapp', 'facebook', 'twitter', 'instagram', 'email', 'direct_link', 'copy_link'),
      allowNull: false,
      defaultValue: 'copy_link'
    },
    shared_with_user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'user_profiles',
        key: 'id'
      }
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 500]
      }
    }
  }, {
    tableName: 'shares',
    hooks: {
      afterCreate: async (share) => {
        // Actualizar contador de compartidos
        await updateShareCount(share, 'increment');
      },
      afterDestroy: async (share) => {
        // Actualizar contador de compartidos
        await updateShareCount(share, 'decrement');
      }
    },
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['product_id']
      },
      {
        fields: ['outfit_id']
      },
      {
        fields: ['post_id']
      },
      {
        fields: ['shared_to']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['user_id', 'product_id']
      }
    ]
  });

  // Función helper para actualizar contador de compartidos
  async function updateShareCount(share, operation) {
    const increment = operation === 'increment' ? 1 : -1;
    
    if (share.product_id) {
      await sequelize.models.Product.increment('share_count', {
        by: increment,
        where: { id: share.product_id }
      });
    } else if (share.outfit_id) {
      await sequelize.models.Outfit.increment('share_count', {
        by: increment,
        where: { id: share.outfit_id }
      });
    } else if (share.post_id) {
      await sequelize.models.Post.increment('share_count', {
        by: increment,
        where: { id: share.post_id }
      });
    }
  }

  return Share;
};
