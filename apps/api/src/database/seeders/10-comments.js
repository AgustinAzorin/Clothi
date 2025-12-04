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

    const comments = [
      // Comentarios en productos
      {
        id: uuidv4(),
        user_id: userMap['carlos_fashion'],
        product_id: products[0].id, // Neon Circuit Jacket
        outfit_id: null,
        post_id: null,
        content: '¡Increíble! ¿Los efectos de neón funcionan en todos los entornos virtuales?',
        parent_comment_id: null,
        like_count: 3,
        created_at: new Date('2023-10-26 15:30:00'),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        user_id: userMap['techwear_labs'], // Vendedor responde
        product_id: products[0].id,
        outfit_id: null,
        post_id: null,
        content: '¡Hola Carlos! Sí, los efectos están optimizados para la mayoría de plataformas VR y metaversos. Incluimos configuraciones para diferentes motores gráficos.',
        parent_comment_id: null, // Esto se actualizará después
        like_count: 5,
        created_at: new Date('2023-10-26 16:45:00'),
        updated_at: new Date()
      },
      // Comentarios en outfits
      {
        id: uuidv4(),
        user_id: userMap['gamer_fashion'],
        outfit_id: outfits[0].id, // Cyberpunk Night Out
        product_id: null,
        post_id: null,
        content: 'Este outfit sería perfecto para mi stream de cyberpunk 2077! ¿Se puede integrar con OBS?',
        parent_comment_id: null,
        like_count: 2,
        created_at: new Date('2023-10-22 20:15:00'),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        user_id: userMap['lina_styler'], // Creadora del outfit
        outfit_id: outfits[0].id,
        product_id: null,
        post_id: null,
        content: '¡Hola Alex! Sí, los efectos se pueden capturar con OBS usando el plugin de captura 3D. Te paso el tutorial por DM!',
        parent_comment_id: null,
        like_count: 4,
        created_at: new Date('2023-10-22 21:30:00'),
        updated_at: new Date()
      },
      // Comentarios en posts
      {
        id: uuidv4(),
        user_id: userMap['sophie_paris'],
        post_id: posts[4].id, // Post de Sophie
        product_id: null,
        outfit_id: null,
        content: 'Magnifique! Les cristaux sont tellement réalistes. Bravo pour ce travail! 💎',
        parent_comment_id: null,
        like_count: 7,
        created_at: new Date('2023-11-09 18:20:00'),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        user_id: userMap['digital_couture'], // Vendedor del vestido
        post_id: posts[4].id,
        product_id: null,
        outfit_id: null,
        content: 'Merci Sophie! Nous avons travaillé des mois sur le système de réfraction de lumière. Ravi que ça te plaise!',
        parent_comment_id: null,
        like_count: 3,
        created_at: new Date('2023-11-09 19:15:00'),
        updated_at: new Date()
      },
      // Comentario con respuesta
      {
        id: uuidv4(),
        user_id: userMap['metaverse_explorer'],
        post_id: posts[5].id, // Post de Rio
        product_id: null,
        outfit_id: null,
        content: 'Love how the backpack changes texture! Does it work with geolocation in all metaverses?',
        parent_comment_id: null,
        like_count: 2,
        created_at: new Date('2023-10-17 10:30:00'),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        user_id: userMap['street_urban'], // Vendedor de la mochila
        post_id: posts[5].id,
        product_id: null,
        outfit_id: null,
        content: 'Currently works with Decentraland, Cryptovoxels, and Sandbox! Adding more platforms soon.',
        parent_comment_id: null, // Esto se actualizará como respuesta
        like_count: 1,
        created_at: new Date('2023-10-17 11:45:00'),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('comments', comments, {});

    // Actualizar parent_comment_id para respuestas
    const commentIds = await queryInterface.sequelize.query(
      `SELECT id, user_id, content FROM comments ORDER BY created_at`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Hacer que algunos comentarios sean respuestas
    for (let i = 1; i < commentIds.length; i += 2) {
      if (i < commentIds.length - 1) {
        await queryInterface.sequelize.query(`
          UPDATE comments 
          SET parent_comment_id = '${commentIds[i-1].id}'
          WHERE id = '${commentIds[i].id}'
        `);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('comments', null, {});
  }
};