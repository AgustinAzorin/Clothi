const { DataTypes } = require('sequelize');
const { baseFields } = require('../shared/baseModel');
const { OutfitVisibility } = require('../shared/enums');

module.exports = (sequelize) => {
  const Outfit = sequelize.define('Outfit', {
    ...baseFields,
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'user_profiles',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 200]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    style_tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    color_palette: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      validate: {
        isValidColors(value) {
          if (!Array.isArray(value)) return false;
          return value.every(color => /^#[0-9A-F]{6}$/i.test(color));
        }
      }
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    scene_data: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {}
    },
    thumbnail_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    visibility: {
      type: DataTypes.ENUM(...Object.values(OutfitVisibility)),
      defaultValue: OutfitVisibility.PUBLIC
    },
    is_template: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    // Stats
    view_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    like_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    save_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    }
  }, {
    tableName: 'outfits',
    hooks: {
      beforeValidate: (outfit) => {
        // Asegurar que style_tags esté en minúsculas
        if (outfit.style_tags && Array.isArray(outfit.style_tags)) {
          outfit.style_tags = outfit.style_tags.map(tag => tag.toLowerCase().trim());
        }
        
        // Limpiar color_palette
        if (outfit.color_palette && Array.isArray(outfit.color_palette)) {
          outfit.color_palette = outfit.color_palette
            .map(color => color.toUpperCase())
            .filter(color => /^#[0-9A-F]{6}$/.test(color));
        }
      }
    },
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['visibility'],
        where: { visibility: OutfitVisibility.PUBLIC }
      },
      {
        fields: ['created_at']
      },
      {
        using: 'gin',
        fields: ['style_tags']
      }
    ]
  });

  return Outfit;
};