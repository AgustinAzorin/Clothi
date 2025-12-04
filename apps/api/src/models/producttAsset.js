const { DataTypes } = require('sequelize');
const { baseFields } = require('./shared/baseModel');
const { AssetType } = require('./shared/enums');

module.exports = (sequelize) => {
  const ProductAsset = sequelize.define('ProductAsset', {
    ...baseFields,
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    asset_type: {
      type: DataTypes.ENUM(...Object.values(AssetType)),
      allowNull: false
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        isUrl: true,
        notEmpty: true
      }
    },
    order_index: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    material_data: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {}
    }
  }, {
    tableName: 'product_assets',
    hooks: {
      beforeCreate: async (asset) => {
        // Si no hay order_index, asignar el siguiente disponible
        if (asset.order_index === 0) {
          const maxOrder = await sequelize.models.ProductAsset.max('order_index', {
            where: { product_id: asset.product_id }
          });
          asset.order_index = (maxOrder || 0) + 1;
        }
      }
    },
    indexes: [
      {
        fields: ['product_id']
      },
      {
        fields: ['product_id', 'order_index']
      }
    ]
  });

  return ProductAsset;
};