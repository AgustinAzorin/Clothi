'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_assets', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      product_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      asset_type: {
        type: Sequelize.ENUM('image', 'texture', 'material', 'thumbnail'),
        allowNull: false
      },
      url: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      order_index: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      material_data: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {}
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
    await queryInterface.addIndex('product_assets', ['product_id']);
    await queryInterface.addIndex('product_assets', ['product_id', 'order_index']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('product_assets');
  }
};