'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('outfit_items', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      outfit_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'outfits',
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
        onDelete: 'CASCADE'
      },
      position: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: { x: 0, y: 0, z: 0 }
      },
      rotation: {
        type: Sequelize.JSONB,
        defaultValue: { x: 0, y: 0, z: 0 },
        allowNull: false
      },
      scale: {
        type: Sequelize.JSONB,
        defaultValue: { x: 1, y: 1, z: 1 },
        allowNull: false
      },
      custom_material: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      custom_texture_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      order_index: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
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
    await queryInterface.addIndex('outfit_items', ['outfit_id']);
    await queryInterface.addIndex('outfit_items', ['product_id']);
    
    // Índice único compuesto
    await queryInterface.addIndex('outfit_items', ['outfit_id', 'product_id'], {
      unique: true,
      name: 'outfit_items_outfit_product_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('outfit_items');
  }
};