'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      order_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      buyer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'user_profiles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM(
          'pending',
          'processing',
          'shipped',
          'delivered',
          'cancelled',
          'refunded'
        ),
        defaultValue: 'pending',
        allowNull: false
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING(3),
        defaultValue: 'USD',
        allowNull: false
      },
      shipping_address: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      shipping_method: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      shipping_cost: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false
      },
      payment_method: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      payment_status: {
        type: Sequelize.ENUM('pending', 'paid', 'failed', 'refunded'),
        defaultValue: 'pending',
        allowNull: false
      },
      stripe_payment_intent_id: {
        type: Sequelize.TEXT,
        allowNull: true,
        unique: true
      },
      digital_delivery_status: {
        type: Sequelize.STRING(20),
        defaultValue: 'pending',
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
    await queryInterface.addIndex('orders', ['buyer_id']);
    await queryInterface.addIndex('orders', ['status']);
    await queryInterface.addIndex('orders', ['payment_status']);
    await queryInterface.addIndex('orders', ['created_at']);
    await queryInterface.addIndex('orders', ['order_number'], {
      unique: true,
      name: 'orders_order_number_unique'
    });

    // Constraints
    await queryInterface.addConstraint('orders', {
      fields: ['total_amount', 'shipping_cost'],
      type: 'check',
      name: 'orders_amounts_non_negative',
      where: {
        total_amount: { [Sequelize.Op.gte]: 0 },
        shipping_cost: { [Sequelize.Op.gte]: 0 }
      }
    });

    await queryInterface.addConstraint('orders', {
      fields: ['currency'],
      type: 'check',
      name: 'orders_currency_length',
      where: Sequelize.where(
        Sequelize.fn('length', Sequelize.col('currency')),
        '=',
        3
      )
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('orders');
  }
};