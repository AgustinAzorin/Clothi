const { DataTypes } = require('sequelize');
const { baseFields } = require('../shared/baseModel');

module.exports = (sequelize) => {
  const Tag = sequelize.define('Tag', {
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
    color: {
      type: DataTypes.STRING(7),
      allowNull: true,
      validate: {
        is: /^#[0-9A-F]{6}$/i
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    usage_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    }
  }, {
    tableName: 'tags',
    hooks: {
      beforeValidate: (tag) => {
        // Generar slug si no existe
        if (!tag.slug && tag.name) {
          tag.slug = tag.name
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
        fields: ['usage_count']
      }
    ]
  });

  return Tag;
};
