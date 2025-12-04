'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Obtener IDs de productos
    const products = await queryInterface.sequelize.query(
      `SELECT id, name FROM products`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const productAssets = [];

    products.forEach(product => {
      const productName = product.name.toLowerCase();
      const productId = product.id;

      // Assets para cada producto (variedades de colores/texturas)
      const baseAssets = [
        {
          id: uuidv4(),
          product_id: productId,
          asset_type: 'thumbnail',
          url: `https://images.clothi.online/products/${productName.replace(/\s+/g, '-')}/thumbnail.jpg`,
          order_index: 1,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          product_id: productId,
          asset_type: 'image',
          url: `https://images.clothi.online/products/${productName.replace(/\s+/g, '-')}/front.jpg`,
          order_index: 2,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          product_id: productId,
          asset_type: 'image',
          url: `https://images.clothi.online/products/${productName.replace(/\s+/g, '-')}/back.jpg`,
          order_index: 3,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          product_id: productId,
          asset_type: 'image',
          url: `https://images.clothi.online/products/${productName.replace(/\s+/g, '-')}/detail.jpg`,
          order_index: 4,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      // Assets especiales para productos específicos
      if (productName.includes('neon')) {
        baseAssets.push({
          id: uuidv4(),
          product_id: productId,
          asset_type: 'texture',
          url: 'https://textures.clothi.online/neon-circuit/emissive.png',
          order_index: 5,
          material_data: {
            emissive_intensity: 2.5,
            emissive_color: '#00FF88'
          },
          created_at: new Date(),
          updated_at: new Date()
        });
      }

      if (productName.includes('holographic')) {
        baseAssets.push({
          id: uuidv4(),
          product_id: productId,
          asset_type: 'material',
          url: 'https://textures.clothi.online/holographic/iridescent.exr',
          order_index: 5,
          material_data: {
            ior: 1.45,
            roughness: 0.1,
            metalness: 0.8
          },
          created_at: new Date(),
          updated_at: new Date()
        });
      }

      productAssets.push(...baseAssets);
    });

    await queryInterface.bulkInsert('product_assets', productAssets, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('product_assets', null, {});
  }
};