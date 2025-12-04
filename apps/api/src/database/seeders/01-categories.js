'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const categories = [
      // Categorías principales
      {
        id: uuidv4(),
        name: 'Tops',
        slug: 'tops',
        description: 'Camisetas, blusas, camisas y polos',
        icon_url: 'https://img.icons8.com/color/96/t-shirt.png',
        order_index: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Bottoms',
        slug: 'bottoms',
        description: 'Pantalones, faldas, shorts y leggings',
        icon_url: 'https://img.icons8.com/color/96/denim-shorts.png',
        order_index: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Dresses',
        slug: 'dresses',
        description: 'Vestidos de todo tipo y estilo',
        icon_url: 'https://img.icons8.com/color/96/dress.png',
        order_index: 3,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Outerwear',
        slug: 'outerwear',
        description: 'Chaquetas, abrigos y blazers',
        icon_url: 'https://img.icons8.com/color/96/jacket.png',
        order_index: 4,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Footwear',
        slug: 'footwear',
        description: 'Zapatos, zapatillas y botas',
        icon_url: 'https://img.icons8.com/color/96/sneakers.png',
        order_index: 5,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Accessories',
        slug: 'accessories',
        description: 'Bolsos, joyería, gafas y más',
        icon_url: 'https://img.icons8.com/color/96/handbag.png',
        order_index: 6,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Digital Fashion',
        slug: 'digital-fashion',
        description: 'Ropa exclusivamente digital para avatares',
        icon_url: 'https://img.icons8.com/color/96/virtual-reality.png',
        order_index: 7,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Sportswear',
        slug: 'sportswear',
        description: 'Ropa deportiva y de entrenamiento',
        icon_url: 'https://img.icons8.com/color/96/sportswear.png',
        order_index: 8,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Subcategorías de Tops
      {
        id: uuidv4(),
        name: 'T-Shirts',
        slug: 't-shirts',
        description: 'Camisetas básicas y estampadas',
        parent_category_id: null, // Se actualizará después
        icon_url: 'https://img.icons8.com/color/96/t-shirt.png',
        order_index: 9,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Shirts',
        slug: 'shirts',
        description: 'Camisas formales e informales',
        parent_category_id: null,
        icon_url: 'https://img.icons8.com/color/96/shirt.png',
        order_index: 10,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Sweaters',
        slug: 'sweaters',
        description: 'Suéteres y jerséis',
        parent_category_id: null,
        icon_url: 'https://img.icons8.com/color/96/sweater.png',
        order_index: 11,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Insertar categorías principales
    await queryInterface.bulkInsert('categories', categories, {});

    // Actualizar parent_category_id para subcategorías
    const topsCategory = await queryInterface.sequelize.query(
      `SELECT id FROM categories WHERE slug = 'tops'`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (topsCategory && topsCategory[0]) {
      const topsId = topsCategory[0].id;
      
      await queryInterface.sequelize.query(`
        UPDATE categories 
        SET parent_category_id = '${topsId}'
        WHERE slug IN ('t-shirts', 'shirts', 'sweaters')
      `);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categories', null, {});
  }
};