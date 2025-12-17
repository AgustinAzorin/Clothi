const { DataTypes } = require('sequelize');
const { baseFields } = require('../shared/baseModel');

module.exports = (sequelize) => {
  const Brand = sequelize.define('Brand', {
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
    logo_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    official_website: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    product_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    }
  }, {
    tableName: 'brands',
    hooks: {
      beforeValidate: (brand) => {
        // Generar slug si no existe
        if (!brand.slug && brand.name) {
          brand.slug = brand.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        }
      }
    },
    indexes: [
      {
        fields: ['name']
      },
      {
        fields: ['slug']
      },
      {
        fields: ['verified']
      },
      {
        fields: ['product_count']
      }
    ]
  });

  return Brand;
};
