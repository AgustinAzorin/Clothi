'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Obtener datos
    const [users, products] = await Promise.all([
      queryInterface.sequelize.query(
        `SELECT id, username FROM user_profiles`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      ),
      queryInterface.sequelize.query(
        `SELECT id, seller_id, name, price FROM products WHERE status = 'published'`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      )
    ]);

    const userMap = {};
    users.forEach(user => {
      userMap[user.username] = user.id;
    });

    const productMap = {};
    products.forEach(product => {
      productMap[product.name] = product;
    });

    const orders = [
      // Orden de Carlos
      {
        id: uuidv4(),
        order_number: 'CLTH-202311-001',
        buyer_id: userMap['carlos_fashion'],
        status: 'delivered',
        total_amount: 54.98,
        currency: 'USD',
        shipping_address: {
          name: 'Carlos Martínez',
          street: 'Calle Digital 123',
          city: 'Madrid',
          country: 'Spain',
          zip_code: '28001'
        },
        shipping_method: 'standard',
        shipping_cost: 5.99,
        payment_method: 'stripe',
        payment_status: 'paid',
        stripe_payment_intent_id: 'pi_' + Math.random().toString(36).substr(2, 24),
        digital_delivery_status: 'delivered',
        created_at: new Date('2023-10-27 14:30:00'),
        updated_at: new Date('2023-10-30 09:15:00')
      },
      // Orden de Lina
      {
        id: uuidv4(),
        order_number: 'CLTH-202311-002',
        buyer_id: userMap['lina_styler'],
        status: 'processing',
        total_amount: 89.99,
        currency: 'USD',
        shipping_address: null, // Producto digital solamente
        shipping_method: null,
        shipping_cost: 0,
        payment_method: 'stripe',
        payment_status: 'paid',
        stripe_payment_intent_id: 'pi_' + Math.random().toString(36).substr(2, 24),
        digital_delivery_status: 'delivered',
        created_at: new Date('2023-11-07 10:15:00'),
        updated_at: new Date()
      },
      // Orden de Alex Gamer
      {
        id: uuidv4(),
        order_number: 'CLTH-202311-003',
        buyer_id: userMap['gamer_fashion'],
        status: 'shipped',
        total_amount: 77.97,
        currency: 'USD',
        shipping_address: {
          name: 'Alex Gamer',
          street: 'Gaming Street 456',
          city: 'Los Angeles',
          country: 'USA',
          zip_code: '90001'
        },
        shipping_method: 'express',
        shipping_cost: 12.99,
        payment_method: 'paypal',
        payment_status: 'paid',
        stripe_payment_intent_id: null,
        digital_delivery_status: 'delivered',
        created_at: new Date('2023-11-04 16:45:00'),
        updated_at: new Date('2023-11-06 11:30:00')
      }
    ];

    await queryInterface.bulkInsert('orders', orders, {});

    // Crear items de las órdenes
    const orderItems = [
      // Items de la orden de Carlos
      {
        id: uuidv4(),
        order_id: (await queryInterface.sequelize.query(
          `SELECT id FROM orders WHERE order_number = 'CLTH-202311-001'`,
          { type: queryInterface.sequelize.QueryTypes.SELECT }
        ))[0].id,
        product_id: productMap['Urban Graffiti Hoodie'].id,
        seller_id: productMap['Urban Graffiti Hoodie'].seller_id,
        quantity: 1,
        unit_price: 19.99,
        digital_download_url: 'https://downloads.clothi.online/orders/clth-202311-001-hoodie.zip',
        digital_download_expires_at: new Date('2024-11-27'),
        created_at: new Date('2023-10-27 14:30:00'),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        order_id: (await queryInterface.sequelize.query(
          `SELECT id FROM orders WHERE order_number = 'CLTH-202311-001'`,
          { type: queryInterface.sequelize.QueryTypes.SELECT }
        ))[0].id,
        product_id: productMap['Pixel Art Sneakers'].id,
        seller_id: productMap['Pixel Art Sneakers'].seller_id,
        quantity: 1,
        unit_price: 34.99,
        digital_download_url: 'https://downloads.clothi.online/orders/clth-202311-001-sneakers.zip',
        digital_download_expires_at: new Date('2024-11-27'),
        created_at: new Date('2023-10-27 14:30:00'),
        updated_at: new Date()
      },
      // Items de la orden de Lina
      {
        id: uuidv4(),
        order_id: (await queryInterface.sequelize.query(
          `SELECT id FROM orders WHERE order_number = 'CLTH-202311-002'`,
          { type: queryInterface.sequelize.QueryTypes.SELECT }
        ))[0].id,
        product_id: productMap['Crystal Evening Gown'].id,
        seller_id: productMap['Crystal Evening Gown'].seller_id,
        quantity: 1,
        unit_price: 89.99,
        digital_download_url: 'https://downloads.clothi.online/orders/clth-202311-002-gown.zip',
        digital_download_expires_at: new Date('2024-11-07'),
        created_at: new Date('2023-11-07 10:15:00'),
        updated_at: new Date()
      },
      // Items de la orden de Alex
      {
        id: uuidv4(),
        order_id: (await queryInterface.sequelize.query(
          `SELECT id FROM orders WHERE order_number = 'CLTH-202311-003'`,
          { type: queryInterface.sequelize.QueryTypes.SELECT }
        ))[0].id,
        product_id: productMap['Quantum Glitch Pants'].id,
        seller_id: productMap['Quantum Glitch Pants'].seller_id,
        quantity: 1,
        unit_price: 24.99,
        digital_download_url: 'https://downloads.clothi.online/orders/clth-202311-003-pants.zip',
        digital_download_expires_at: new Date('2024-11-04'),
        created_at: new Date('2023-11-04 16:45:00'),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        order_id: (await queryInterface.sequelize.query(
          `SELECT id FROM orders WHERE order_number = 'CLTH-202311-003'`,
          { type: queryInterface.sequelize.QueryTypes.SELECT }
        ))[0].id,
        product_id: productMap['Basketball Street Jersey'].id,
        seller_id: productMap['Basketball Street Jersey'].seller_id,
        quantity: 1,
        unit_price: 22.99,
        digital_download_url: 'https://downloads.clothi.online/orders/clth-202311-003-jersey.zip',
        digital_download_expires_at: new Date('2024-11-04'),
        created_at: new Date('2023-11-04 16:45:00'),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        order_id: (await queryInterface.sequelize.query(
          `SELECT id FROM orders WHERE order_number = 'CLTH-202311-003'`,
          { type: queryInterface.sequelize.QueryTypes.SELECT }
        ))[0].id,
        product_id: productMap['Graffiti Backpack'].id,
        seller_id: productMap['Graffiti Backpack'].seller_id,
        quantity: 1,
        unit_price: 32.99,
        digital_download_url: 'https://downloads.clothi.online/orders/clth-202311-003-backpack.zip',
        digital_download_expires_at: new Date('2024-11-04'),
        created_at: new Date('2023-11-04 16:45:00'),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('order_items', orderItems, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('order_items', null, {});
    await queryInterface.bulkDelete('orders', null, {});
  }
};