const { DataTypes } = require('sequelize');
const { baseFields } = require('../shared/baseModel');

module.exports = (sequelize) => {
  const ProductTag = sequelize.define('ProductTag', {
    ...baseFields,
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    tag_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'tags',
        key: 'id'
      }
    }
  }, {
    tableName: 'product_tags',
    indexes: [
      {
        unique: true,
        fields: ['product_id', 'tag_id']
      },
      {
        fields: ['product_id']
      },
      {
        fields: ['tag_id']
      }
    ]
  });

  return ProductTag;
};
