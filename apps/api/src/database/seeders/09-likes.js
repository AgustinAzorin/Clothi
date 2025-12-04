'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Obtener datos
    const [users, products, outfits, posts] = await Promise.all([
      queryInterface.sequelize.query(
        `SELECT id, username FROM user_profiles`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      ),
      queryInterface.sequelize.query(
        `SELECT id, name FROM products WHERE status = 'published'`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      ),
      queryInterface.sequelize.query(
        `SELECT id, title FROM outfits WHERE visibility = 'public'`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      ),
      queryInterface.sequelize.query(
        `SELECT id FROM posts WHERE visibility = 'public'`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      )
    ]);

    const userMap = {};
    users.forEach(user => {
      userMap[user.username] = user.id;
    });

    const likes = [];

    // Likes de Carlos
    likes.push(
      {
        id: uuidv4(),
        user_id: userMap['carlos_fashion'],
        product_id: products[0].id, // Neon Circuit Jacket
        outfit_id: null,
        post_id: null,
        created_at: new Date('2023-10-25')
      },
      {
        id: uuidv4(),
        user_id: userMap['carlos_fashion'],
        product_id: products[2].id, // Urban Graffiti Hoodie
        outfit_id: null,
        post_id: null,
        created_at: new Date('2023-10-26')
      },
      {
        id: uuidv4(),
        user_id: userMap['carlos_fashion'],
        outfit_id: outfits[0].id, // Cyberpunk Night Out
        product_id: null,
        post_id: null,
        created_at: new Date('2023-10-22')
      }
    );

    // Likes de Lina
    likes.push(
      {
        id: uuidv4(),
        user_id: userMap['lina_styler'],
        product_id: products[4].id, // Crystal Evening Gown
        outfit_id: null,
        post_id: null,
        created_at: new Date('2023-09-05')
      },
      {
        id: uuidv4(),
        user_id: userMap['lina_styler'],
        outfit_id: outfits[4].id, // Parisian Elegance
        product_id: null,
        post_id: null,
        created_at: new Date('2023-11-10')
      },
      {
        id: uuidv4(),
        user_id: userMap['lina_styler'],
        post_id: posts[3].id, // Post de Alex Gamer
        product_id: null,
        outfit_id: null,
        created_at: new Date('2023-10-30')
      }
    );

    // Likes de Alex Gamer
    likes.push(
      {
        id: uuidv4(),
        user_id: userMap['gamer_fashion'],
        product_id: products[1].id, // Quantum Glitch Pants
        outfit_id: null,
        post_id: null,
        created_at: new Date('2023-11-03')
      },
      {
        id: uuidv4(),
        user_id: userMap['gamer_fashion'],
        outfit_id: outfits[0].id, // Cyberpunk Night Out
        product_id: null,
        post_id: null,
        created_at: new Date('2023-10-21')
      },
      {
        id: uuidv4(),
        user_id: userMap['gamer_fashion'],
        post_id: posts[0].id, // Post de Lina cyberpunk
        product_id: null,
        outfit_id: null,
        created_at: new Date('2023-10-22')
      }
    );

    // Likes de Sophie
    likes.push(
      {
        id: uuidv4(),
        user_id: userMap['sophie_paris'],
        product_id: products[4].id, // Crystal Evening Gown
        outfit_id: null,
        post_id: null,
        created_at: new Date('2023-09-10')
      },
      {
        id: uuidv4(),
        user_id: userMap['sophie_paris'],
        outfit_id: outfits[4].id, // Parisian Elegance
        product_id: null,
        post_id: null,
        created_at: new Date('2023-11-09')
      }
    );

    // Likes de Rio
    likes.push(
      {
        id: uuidv4(),
        user_id: userMap['metaverse_explorer'],
        product_id: products[9].id, // Graffiti Backpack
        outfit_id: null,
        post_id: null,
        created_at: new Date('2023-11-06')
      },
      {
        id: uuidv4(),
        user_id: userMap['metaverse_explorer'],
        outfit_id: outfits[5].id, // Digital Nomad Explorer
        product_id: null,
        post_id: null,
        created_at: new Date('2023-10-16')
      },
      {
        id: uuidv4(),
        user_id: userMap['metaverse_explorer'],
        post_id: posts[5].id, // Post de Rio
        product_id: null,
        outfit_id: null,
        created_at: new Date('2023-10-17')
      }
    );

    await queryInterface.bulkInsert('likes', likes, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('likes', null, {});
  }
};