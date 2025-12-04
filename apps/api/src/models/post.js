const { DataTypes } = require('sequelize');
const { baseFields } = require('../shared/baseModel');
const { PostVisibility } = require('../shared/enums');

module.exports = (sequelize) => {
  const Post = sequelize.define('Post', {
    ...baseFields,
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'user_profiles',
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
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 5000]
      }
    },
    media_urls: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: [],
      validate: {
        isValidUrls(value) {
          if (!Array.isArray(value)) return false;
          return value.every(url => {
            try {
              new URL(url);
              return true;
            } catch {
              return false;
            }
          });
        }
      }
    },
    // Engagement stats
    like_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    comment_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    share_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    visibility: {
      type: DataTypes.ENUM(...Object.values(PostVisibility)),
      defaultValue: PostVisibility.PUBLIC
    }
  }, {
    tableName: 'posts',
    hooks: {
      beforeValidate: (post) => {
        // Validar que tenga al menos contenido o media
        if (!post.content && (!post.media_urls || post.media_urls.length === 0)) {
          throw new Error('Post debe tener contenido o al menos una imagen');
        }
      }
    },
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['outfit_id'],
        where: { outfit_id: { [sequelize.Op.ne]: null } }
      },
      {
        fields: ['created_at']
      }
    ]
  });

  return Post;
};