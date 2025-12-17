const { DataTypes } = require('sequelize');
const { baseFields } = require('../shared/baseModel');

module.exports = (sequelize) => {
  const ProductBrand = sequelize.define('ProductBrand', {
    ...baseFields,
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    brand_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'brands',
        key: 'id'
      }
    }
  }, {
    tableName: 'product_brands',
    indexes: [
      {
        unique: true,
        fields: ['product_id', 'brand_id']
      },
      {
        fields: ['product_id']
      },
      {
        fields: ['brand_id']
      }
    ]
  });

  return ProductBrand;
};
