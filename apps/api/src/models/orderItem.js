const { DataTypes } = require('sequelize');
const { baseFields } = require('./shared/baseModel');

module.exports = (sequelize) => {
  const OrderItem = sequelize.define('OrderItem', {
    ...baseFields,
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id'
      }
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    seller_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'user_profiles',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    total_price: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.quantity * this.unit_price;
      }
    },
    digital_download_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    digital_download_expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'order_items',
    hooks: {
      beforeCreate: async (orderItem) => {
        // Verificar stock si es producto físico
        const product = await sequelize.models.Product.findByPk(orderItem.product_id);
        
        if (product.product_type !== 'digital') {
          if (product.stock_quantity < orderItem.quantity) {
            throw new Error(`Stock insuficiente para ${product.name}. Disponible: ${product.stock_quantity}`);
          }
          
          // Reservar stock (se actualizará cuando se complete el pago)
          // Esto se manejará mejor con un sistema de reservas
        }
        
        // Obtener seller_id del producto
        if (!orderItem.seller_id) {
          orderItem.seller_id = product.seller_id;
        }
      },
      afterCreate: async (orderItem) => {
        // Si el producto es digital, generar link de descarga
        const product = await sequelize.models.Product.findByPk(orderItem.product_id);
        
        if (product.product_type === 'digital' || product.product_type === 'both') {
          // Generar URL de descarga temporal
          // Esto sería mejor con un servicio dedicado
          const token = require('crypto').randomBytes(32).toString('hex');
          const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días
          
          await orderItem.update({
            digital_download_url: `${process.env.APP_URL}/download/${token}`,
            digital_download_expires_at: expiresAt
          });
          
          // Aquí guardaríamos el token en otra tabla/cache
        }
      }
    },
    indexes: [
      {
        fields: ['order_id']
      },
      {
        fields: ['product_id']
      },
      {
        fields: ['seller_id']
      }
    ]
  });

  return OrderItem;
};