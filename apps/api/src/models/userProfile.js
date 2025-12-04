const { DataTypes } = require('sequelize');
const { baseFields } = require('./shared/baseModel');
const { baseOptions } = require('./shared/baseModel');

module.exports = (sequelize) => {
  const UserProfile = sequelize.define('UserProfile', {
    ...baseFields,
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50],
        is: /^[a-zA-Z0-9_]+$/ // Solo letras, números y guiones bajos
      }
    },
    display_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    avatar_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    // Stats
    follower_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    following_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    outfit_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    // Preferences
    theme: {
      type: DataTypes.STRING(20),
      defaultValue: 'light',
      validate: {
        isIn: [['light', 'dark', 'system']]
      }
    },
    language: {
      type: DataTypes.STRING(10),
      defaultValue: 'es',
      validate: {
        isIn: [['es', 'en', 'pt', 'fr']]
      }
    },
    // Social links
    instagram_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    twitter_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    website_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    // Seller info
    is_seller: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    shop_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    shop_description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    seller_rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
      validate: {
        min: 0,
        max: 5
      }
    },
    total_sales: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    }
  }, {
    ...baseOptions,
    tableName: 'user_profiles',
    hooks: {
      beforeValidate: (user) => {
        // Asegurar que username esté en minúsculas
        if (user.username) {
          user.username = user.username.toLowerCase();
        }
      }
    },
    indexes: [
      {
        unique: true,
        fields: ['username']
      },
      {
        fields: ['is_seller'],
        where: { is_seller: true }
      }
    ]
  });

  return UserProfile;
};