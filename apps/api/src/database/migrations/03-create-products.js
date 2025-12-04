'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      seller_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'user_profiles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      product_type: {
        type: Sequelize.ENUM('digital', 'physical', 'both'),
        allowNull: false,
        defaultValue: 'digital'
      },
      category_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      // 3D Model data
      model_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      model_preview_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      model_scale: {
        type: Sequelize.DECIMAL(5, 3),
        defaultValue: 1.0,
        allowNull: false
      },
      model_rotation: {
        type: Sequelize.JSONB,
        defaultValue: { x: 0, y: 0, z: 0 },
        allowNull: false
      },
      // Physical product info
      sku: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true
      },
      stock_quantity: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      weight_kg: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true
      },
      dimensions: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: { width: 0, height: 0, depth: 0 }
      },
      // Digital product info
      file_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      file_size_mb: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      // Status
      status: {
        type: Sequelize.ENUM('draft', 'published', 'archived', 'sold_out'),
        defaultValue: 'draft',
        allowNull: false
      },
      is_featured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      // Stats
      view_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      like_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      purchase_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      // SEO
      slug: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      tags: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Índices
    await queryInterface.addIndex('products', ['seller_id']);
    await queryInterface.addIndex('products', ['category_id']);
    await queryInterface.addIndex('products', ['price']);
    await queryInterface.addIndex('products', ['status'], {
      where: { status: 'published' },
      name: 'products_status_published_index'
    });
    await queryInterface.addIndex('products', ['created_at']);
    await queryInterface.addIndex('products', ['slug'], {
      unique: true,
      name: 'products_slug_unique'
    });

    // Índice GIN para tags (búsqueda en arrays)
    await queryInterface.sequelize.query(`
      CREATE INDEX products_tags_idx ON products USING GIN(tags);
    `);

    // Constraints
    await queryInterface.addConstraint('products', {
      fields: ['price'],
      type: 'check',
      name: 'products_price_non_negative',
      where: {
        price: {
          [Sequelize.Op.gte]: 0
        }
      }
    });

    await queryInterface.addConstraint('products', {
      fields: ['stock_quantity'],
      type: 'check',
      name: 'products_stock_non_negative',
      where: {
        stock_quantity: {
          [Sequelize.Op.gte]: 0
        }
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('products');
  }
};