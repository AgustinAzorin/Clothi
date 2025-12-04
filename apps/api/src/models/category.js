const { DataTypes } = require('sequelize');
const { baseFields } = require('./shared/baseModel');

module.exports = (sequelize) => {
  const Category = sequelize.define('Category', {
    ...baseFields,
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    parent_category_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    icon_url: {
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
    tableName: 'categories',
    hooks: {
      beforeValidate: (category) => {
        // Generar slug si no existe
        if (!category.slug && category.name) {
          category.slug = category.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        }
      }
    },
    indexes: [
      {
        fields: ['parent_category_id']
      },
      {
        fields: ['slug']
      },
      {
        fields: ['order_index']
      }
    ]
  });

  return Category;
};