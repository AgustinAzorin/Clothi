'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Obtener IDs de usuarios
    const users = await queryInterface.sequelize.query(
      `SELECT id, username FROM user_profiles`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const userMap = {};
    users.forEach(user => {
      userMap[user.username] = user.id;
    });

    const outfits = [
      // Outfits de Lina (content creator)
      {
        id: uuidv4(),
        user_id: userMap['lina_styler'],
        title: 'Cyberpunk Night Out',
        description: 'Look completo para una noche en Neo-Tokyo. Perfecto para clubs virtuales y eventos cyberpunk.',
        style_tags: ['cyberpunk', 'techwear', 'night', 'club', 'futuristic'],
        color_palette: ['#00FF88', '#8800FF', '#000000', '#222222'],
        total_price: 84.97,
        scene_data: {
          lighting: 'neon',
          background: 'city_night',
          camera: { position: { x: 0, y: 1.5, z: 3 }, target: { x: 0, y: 1, z: 0 } }
        },
        thumbnail_url: 'https://images.clothi.online/outfits/cyberpunk-night-thumb.jpg',
        visibility: 'public',
        is_template: true,
        view_count: 3450,
        like_count: 420,
        save_count: 156,
        created_at: new Date('2023-10-20'),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        user_id: userMap['lina_styler'],
        title: 'Vintage Synthwave Day',
        description: 'Inspirado en los 80s con un toque digital. Colores vibrantes y efectos retro.',
        style_tags: ['vintage', 'retro', 'synthwave', '80s', 'colorful'],
        color_palette: ['#FF0080', '#00FFFF', '#FFFF00', '#8000FF'],
        total_price: 42.98,
        scene_data: {
          lighting: 'sunset',
          background: 'desert_road',
          camera: { position: { x: 2, y: 1.2, z: 2 }, target: { x: 0, y: 1, z: 0 } }
        },
        thumbnail_url: 'https://images.clothi.online/outfits/synthwave-day-thumb.jpg',
        visibility: 'public',
        is_template: true,
        view_count: 2890,
        like_count: 310,
        save_count: 98,
        created_at: new Date('2023-11-05'),
        updated_at: new Date()
      },
      // Outfits de Carlos
      {
        id: uuidv4(),
        user_id: userMap['carlos_fashion'],
        title: 'Urban Street Style',
        description: 'Look casual pero con estilo para el día a día en la ciudad digital.',
        style_tags: ['streetwear', 'casual', 'urban', 'daily'],
        color_palette: ['#000000', '#FFFFFF', '#808080', '#FF0000'],
        total_price: 56.97,
        scene_data: {
          lighting: 'daylight',
          background: 'urban_street',
          camera: { position: { x: 1, y: 1.5, z: 2 }, target: { x: 0, y: 1, z: 0 } }
        },
        thumbnail_url: 'https://images.clothi.online/outfits/urban-street-thumb.jpg',
        visibility: 'public',
        is_template: false,
        view_count: 1230,
        like_count: 145,
        save_count: 45,
        created_at: new Date('2023-11-12'),
        updated_at: new Date()
      },
      // Outfits de Alex Gamer
      {
        id: uuidv4(),
        user_id: userMap['gamer_fashion'],
        title: 'Streamer Gaming Setup',
        description: 'Outfit perfecto para streaming. Con efectos especiales que reaccionan a los viewers.',
        style_tags: ['gaming', 'streamer', 'tech', 'animated'],
        color_palette: ['#00AAFF', '#FF5500', '#000000', '#00FF00'],
        total_price: 67.97,
        scene_data: {
          lighting: 'studio',
          background: 'gaming_setup',
          camera: { position: { x: 0, y: 1.2, z: 1.5 }, target: { x: 0, y: 1, z: 0 } }
        },
        thumbnail_url: 'https://images.clothi.online/outfits/gaming-streamer-thumb.jpg',
        visibility: 'public',
        is_template: true,
        view_count: 4560,
        like_count: 560,
        save_count: 210,
        created_at: new Date('2023-10-28'),
        updated_at: new Date()
      },
      // Outfits de Sophie
      {
        id: uuidv4(),
        user_id: userMap['sophie_paris'],
        title: 'Parisian Elegance',
        description: 'Élégance parisienne adaptée au monde digital. Chic et sophistiqué.',
        style_tags: ['elegant', 'chic', 'parisian', 'luxury', 'sophisticated'],
        color_palette: ['#000000', '#FFFFFF', '#C0C0C0', '#FFD700'],
        total_price: 137.97,
        scene_data: {
          lighting: 'golden_hour',
          background: 'paris_streets',
          camera: { position: { x: -1, y: 1.3, z: 2 }, target: { x: 0, y: 1, z: 0 } }
        },
        thumbnail_url: 'https://images.clothi.online/outfits/parisian-elegance-thumb.jpg',
        visibility: 'public',
        is_template: false,
        view_count: 3780,
        like_count: 490,
        save_count: 123,
        created_at: new Date('2023-11-08'),
        updated_at: new Date()
      },
      // Outfits de Rio
      {
        id: uuidv4(),
        user_id: userMap['metaverse_explorer'],
        title: 'Digital Nomad Explorer',
        description: 'Perfecto para explorar diferentes mundos virtuales. Versátil y con múltiples funciones.',
        style_tags: ['travel', 'explorer', 'versatile', 'adventure', 'functional'],
        color_palette: ['#4A90E2', '#50E3C2', '#F5A623', '#7B61FF'],
        total_price: 95.96,
        scene_data: {
          lighting: 'natural',
          background: 'mountain_view',
          camera: { position: { x: 0, y: 1.8, z: 3 }, target: { x: 0, y: 1.5, z: 0 } }
        },
        thumbnail_url: 'https://images.clothi.online/outfits/digital-nomad-thumb.jpg',
        visibility: 'public',
        is_template: true,
        view_count: 5120,
        like_count: 670,
        save_count: 289,
        created_at: new Date('2023-10-15'),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('outfits', outfits, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('outfits', null, {});
  }
};