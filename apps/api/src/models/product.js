const { DataTypes } = require('sequelize');
const { baseFields } = require('./shared/baseModel');
const { ProductType, ProductStatus } = require('./shared/enums');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    ...baseFields,
    seller_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'user_profiles',
        key: 'id'
      }
    },
    name: {
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
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    product_type: {
      type: DataTypes.ENUM(...Object.values(ProductType)),
      allowNull: false,
      defaultValue: ProductType.DIGITAL
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    // 3D Model data
    model_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    model_preview_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    model_scale: {
      type: DataTypes.DECIMAL(5, 3),
      defaultValue: 1.0,
      validate: {
        min: 0.01,
        max: 10
      }
    },
    model_rotation: {
      type: DataTypes.JSONB,
      defaultValue: { x: 0, y: 0, z: 0 },
      validate: {
        isValidRotation(value) {
          if (typeof value !== 'object') return false;
          if (value.x === undefined || value.y === undefined || value.z === undefined) return false;
          return true;
        }
      }
    },
    // Physical product info
    sku: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true
    },
    stock_quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    weight_kg: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    dimensions: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: { width: 0, height: 0, depth: 0 }
    },
    // Digital product info
    file_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    file_size_mb: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0
      }
    },
    // Status
    status: {
      type: DataTypes.ENUM(...Object.values(ProductStatus)),
      defaultValue: ProductStatus.DRAFT
    },
    is_featured: {
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
    purchase_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    // SEO
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    }
  }, {
    tableName: 'products',
    hooks: {
      beforeValidate: (product) => {
        // Generar slug automáticamente si no existe
        if (!product.slug && product.name) {
          const slug = product.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
          product.slug = `${slug}-${Date.now().toString(36)}`;
        }
        
        // Validaciones condicionales
        if (product.product_type === ProductType.PHYSICAL || product.product_type === ProductType.BOTH) {
          if (!product.sku) {
            throw new Error('SKU es requerido para productos físicos');
          }
        }
        
        if (product.product_type === ProductType.DIGITAL || product.product_type === ProductType.BOTH) {
          if (!product.file_url) {
            throw new Error('File URL es requerido para productos digitales');
          }
        }
      }
    },
    indexes: [
      {
        fields: ['seller_id']
      },
      {
        fields: ['category_id']
      },
      {
        fields: ['price']
      },
      {
        fields: ['status'],
        where: { status: ProductStatus.PUBLISHED }
      },
      {
        fields: ['created_at']
      }
    ]
  });

  return Product;
};