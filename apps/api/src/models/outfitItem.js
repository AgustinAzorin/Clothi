const { DataTypes } = require('sequelize');
const { baseFields } = require('../shared/baseModel');

module.exports = (sequelize) => {
  const OutfitItem = sequelize.define('OutfitItem', {
    ...baseFields,
    outfit_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'outfits',
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
    position: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: { x: 0, y: 0, z: 0 },
      validate: {
        isValidPosition(value) {
          if (typeof value !== 'object') return false;
          return value.x !== undefined && value.y !== undefined && value.z !== undefined;
        }
      }
    },
    rotation: {
      type: DataTypes.JSONB,
      defaultValue: { x: 0, y: 0, z: 0 },
      validate: {
        isValidRotation(value) {
          if (typeof value !== 'object') return false;
          return value.x !== undefined && value.y !== undefined && value.z !== undefined;
        }
      }
    },
    scale: {
      type: DataTypes.JSONB,
      defaultValue: { x: 1, y: 1, z: 1 },
      validate: {
        isValidScale(value) {
          if (typeof value !== 'object') return false;
          return value.x !== undefined && value.y !== undefined && value.z !== undefined;
        }
      }
    },
    custom_material: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    custom_texture_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    order_index: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    }
  }, {
    tableName: 'outfit_items',
    hooks: {
      beforeCreate: async (item) => {
        // Si no hay order_index, asignar el siguiente disponible
        if (item.order_index === 0) {
          const maxOrder = await sequelize.models.OutfitItem.max('order_index', {
            where: { outfit_id: item.outfit_id }
          });
          item.order_index = (maxOrder || 0) + 1;
        }
      }
    },
    indexes: [
      {
        fields: ['outfit_id']
      },
      {
        fields: ['product_id']
      },
      {
        unique: true,
        fields: ['outfit_id', 'product_id']
      }
    ]
  });

  return OutfitItem;
};