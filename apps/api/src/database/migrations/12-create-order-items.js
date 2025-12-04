'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('order_items', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      order_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      product_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      seller_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'user_profiles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      unit_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      total_price: {
        type: Sequelize.VIRTUAL,
        get() {
          return this.quantity * this.unit_price;
        }
      },
      digital_download_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      digital_download_expires_at: {
        type: Sequelize.DATE,
        allowNull: true
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
    await queryInterface.addIndex('order_items', ['order_id']);
    await queryInterface.addIndex('order_items', ['product_id']);
    await queryInterface.addIndex('order_items', ['seller_id']);

    // Constraints
    await queryInterface.addConstraint('order_items', {
      fields: ['quantity', 'unit_price'],
      type: 'check',
      name: 'order_items_positive_values',
      where: {
        quantity: { [Sequelize.Op.gt]: 0 },
        unit_price: { [Sequelize.Op.gte]: 0 }
      }
    });

    // Columna calculada (generated column) para total_price
    // En PostgreSQL podemos usar stored generated column
    await queryInterface.sequelize.query(`
      ALTER TABLE order_items 
      ADD COLUMN total_price_calculated DECIMAL(10,2) 
      GENERATED ALWAYS AS (quantity * unit_price) STORED;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('order_items');
  }
};
