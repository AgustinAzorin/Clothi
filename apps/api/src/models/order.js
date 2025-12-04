const { DataTypes } = require('sequelize');
const { baseFields } = require('./shared/baseModel');
const { OrderStatus, PaymentStatus } = require('./shared/enums');

module.exports = (sequelize) => {
  const Order = sequelize.define('Order', {
    ...baseFields,
    order_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    buyer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'user_profiles',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      defaultValue: OrderStatus.PENDING
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD',
      validate: {
        len: [3, 3]
      }
    },
    shipping_address: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    shipping_method: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    shipping_cost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    payment_status: {
      type: DataTypes.ENUM(...Object.values(PaymentStatus)),
      defaultValue: PaymentStatus.PENDING
    },
    stripe_payment_intent_id: {
      type: DataTypes.TEXT,
      allowNull: true,
      unique: true
    },
    digital_delivery_status: {
      type: DataTypes.STRING(20),
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'delivered', 'failed']]
      }
    }
  }, {
    tableName: 'orders',
    hooks: {
      beforeCreate: (order) => {
        // Generar order_number si no existe
        if (!order.order_number) {
          const timestamp = Date.now().toString(36);
          const random = Math.random().toString(36).substr(2, 5);
          order.order_number = `CLTH-${timestamp}-${random}`.toUpperCase();
        }
        
        // Asegurar que total_amount incluya shipping_cost
        if (order.shipping_cost && order.total_amount) {
          order.total_amount = parseFloat(order.total_amount) + parseFloat(order.shipping_cost);
        }
      },
      afterUpdate: async (order) => {
        // Si el pago se completa, actualizar contadores de ventas
        if (order.changed('payment_status') && order.payment_status === PaymentStatus.PAID) {
          // Esto se manejará mejor con un job en background
        }
      }
    },
    indexes: [
      {
        fields: ['buyer_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['payment_status']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  return Order;
};