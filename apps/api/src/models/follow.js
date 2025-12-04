const { DataTypes } = require('sequelize');
const { baseFields } = require('./shared/baseModel');

module.exports = (sequelize) => {
  const Follow = sequelize.define('Follow', {
    ...baseFields,
    follower_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'user_profiles',
        key: 'id'
      }
    },
    following_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'user_profiles',
        key: 'id'
      }
    }
  }, {
    tableName: 'follows',
    hooks: {
      beforeValidate: (follow) => {
        // No se puede seguir a sí mismo
        if (follow.follower_id === follow.following_id) {
          throw new Error('No puedes seguirte a ti mismo');
        }
      },
      afterCreate: async (follow) => {
        // Actualizar contadores
        await sequelize.models.UserProfile.increment('follower_count', {
          by: 1,
          where: { id: follow.following_id }
        });
        
        await sequelize.models.UserProfile.increment('following_count', {
          by: 1,
          where: { id: follow.follower_id }
        });
      },
      afterDestroy: async (follow) => {
        // Actualizar contadores
        await sequelize.models.UserProfile.increment('follower_count', {
          by: -1,
          where: { id: follow.following_id }
        });
        
        await sequelize.models.UserProfile.increment('following_count', {
          by: -1,
          where: { id: follow.follower_id }
        });
      }
    },
    indexes: [
      {
        unique: true,
        fields: ['follower_id', 'following_id']
      },
      {
        fields: ['follower_id']
      },
      {
        fields: ['following_id']
      }
    ]
  });

  return Follow;
};