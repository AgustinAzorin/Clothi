'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Obtener todos los usuarios
    const users = await queryInterface.sequelize.query(
      `SELECT id, username FROM user_profiles`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const userMap = {};
    users.forEach(user => {
      userMap[user.username] = user.id;
    });

    const follows = [
      // Carlos sigue a creadores
      {
        id: uuidv4(),
        follower_id: userMap['carlos_fashion'],
        following_id: userMap['marta_design'],
        created_at: new Date('2023-06-20'),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        follower_id: userMap['carlos_fashion'],
        following_id: userMap['techwear_labs'],
        created_at: new Date('2023-06-22'),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        follower_id: userMap['carlos_fashion'],
        following_id: userMap['lina_styler'],
        created_at: new Date('2023-06-25'),
        updated_at: new Date()
      },
      // Lina sigue a varios
      {
        id: uuidv4(),
        follower_id: userMap['lina_styler'],
        following_id: userMap['digital_couture'],
        created_at: new Date('2023-03-05'),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        follower_id: userMap['lina_styler'],
        following_id: userMap['neo_vintage'],
        created_at: new Date('2023-03-10'),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        follower_id: userMap['lina_styler'],
        following_id: userMap['metaverse_explorer'],
        created_at: new Date('2023-03-15'),
        updated_at: new Date()
      },
      // Alex Gamer sigue creadores
      {
        id: uuidv4(),
        follower_id: userMap['gamer_fashion'],
        following_id: userMap['techwear_labs'],
        created_at: new Date('2023-04-10'),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        follower_id: userMap['gamer_fashion'],
        following_id: userMap['street_urban'],
        created_at: new Date('2023-04-12'),
        updated_at: new Date()
      },
      // Sophie sigue moda de lujo
      {
        id: uuidv4(),
        follower_id: userMap['sophie_paris'],
        following_id: userMap['digital_couture'],
        created_at: new Date('2023-03-20'),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        follower_id: userMap['sophie_paris'],
        following_id: userMap['neo_vintage'],
        created_at: new Date('2023-03-22'),
        updated_at: new Date()
      },
      // Rio sigue a todos los exploradores
      {
        id: uuidv4(),
        follower_id: userMap['metaverse_explorer'],
        following_id: userMap['techwear_labs'],
        created_at: new Date('2022-12-15'),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        follower_id: userMap['metaverse_explorer'],
        following_id: userMap['marta_design'],
        created_at: new Date('2022-12-20'),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        follower_id: userMap['metaverse_explorer'],
        following_id: userMap['lina_styler'],
        created_at: new Date('2023-01-05'),
        updated_at: new Date()
      },
      // Creadores se siguen entre sí
      {
        id: uuidv4(),
        follower_id: userMap['marta_design'],
        following_id: userMap['techwear_labs'],
        created_at: new Date('2023-02-10'),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        follower_id: userMap['techwear_labs'],
        following_id: userMap['digital_couture'],
        created_at: new Date('2022-11-15'),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        follower_id: userMap['digital_couture'],
        following_id: userMap['neo_vintage'],
        created_at: new Date('2022-09-20'),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('follows', follows, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('follows', null, {});
  }
};
