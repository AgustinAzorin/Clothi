'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Obtener usuarios y outfits
    const [users, outfits] = await Promise.all([
      queryInterface.sequelize.query(
        `SELECT id, username FROM user_profiles`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      ),
      queryInterface.sequelize.query(
        `SELECT id, title FROM outfits`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      )
    ]);

    const userMap = {};
    const outfitMap = {};

    users.forEach(user => {
      userMap[user.username] = user.id;
    });

    outfits.forEach(outfit => {
      const key = outfit.title.toLowerCase().replace(/\s+/g, '-');
      outfitMap[key] = outfit.id;
    });

    const posts = [
      // Posts de Lina
      {
        id: uuidv4(),
        user_id: userMap['lina_styler'],
        outfit_id: outfitMap['cyberpunk-night-out'],
        content: '¿Listos para una noche en Neo-Tokyo? 🏙️ Este outfit con efectos de neón es perfecto para los clubs virtuales más exclusivos. ¿Qué opinan? #CyberpunkFashion #DigitalStyle',
        media_urls: [
          'https://images.clothi.online/posts/lina/cyberpunk-night-1.jpg',
          'https://images.clothi.online/posts/lina/cyberpunk-night-2.jpg',
          'https://images.clothi.online/posts/lina/cyberpunk-night-3.gif'
        ],
        like_count: 245,
        comment_count: 42,
        share_count: 18,
        visibility: 'public',
        created_at: new Date('2023-10-21 14:30:00'),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        user_id: userMap['lina_styler'],
        outfit_id: outfitMap['vintage-synthwave-day'],
        content: 'Throwback to the 80s with a digital twist! 🎮🌈 Loving these retro vibes with modern tech. The sunglasses have a slow wave animation that syncs with synthwave music! #Synthwave #RetroFuturism',
        media_urls: [
          'https://images.clothi.online/posts/lina/synthwave-day-1.jpg',
          'https://images.clothi.online/posts/lina/synthwave-day-2.gif'
        ],
        like_count: 189,
        comment_count: 31,
        share_count: 12,
        visibility: 'public',
        created_at: new Date('2023-11-06 11:15:00'),
        updated_at: new Date()
      },
      // Posts de Marta (vendedora)
      {
        id: uuidv4(),
        user_id: userMap['marta_design'],
        outfit_id: null,
        content: '🎨 NUEVA COLECCIÓN: "Urban Pixel" ya disponible en mi tienda! Esta chaqueta de graffiti animado cambia según tu entorno virtual. Link en bio! #NewCollection #DigitalFashion #Streetwear',
        media_urls: [
          'https://images.clothi.online/posts/marta/new-collection-1.jpg',
          'https://images.clothi.online/posts/marta/new-collection-2.jpg'
        ],
        like_count: 320,
        comment_count: 67,
        share_count: 45,
        visibility: 'public',
        created_at: new Date('2023-09-21 10:00:00'),
        updated_at: new Date()
      },
      // Posts de Alex Gamer
      {
        id: uuidv4(),
        user_id: userMap['gamer_fashion'],
        outfit_id: outfitMap['streamer-gaming-setup'],
        content: 'Live now wearing my new streaming outfit! 🎮⚡ The jacket has real-time viewer count integration and particle effects that react to chat activity. Game changer for streams! #GamingFashion #StreamerLife',
        media_urls: [
          'https://images.clothi.online/posts/alex/streaming-live-1.jpg',
          'https://images.clothi.online/posts/alex/streaming-live-2.gif'
        ],
        like_count: 890,
        comment_count: 156,
        share_count: 89,
        visibility: 'public',
        created_at: new Date('2023-10-29 20:30:00'),
        updated_at: new Date()
      },
      // Posts de Sophie
      {
        id: uuidv4(),
        user_id: userMap['sophie_paris'],
        outfit_id: outfitMap['parisian-elegance'],
        content: 'Un peu de Paris dans le métavers. ✨ Cette robe en cristaux numériques reflète la lumière virtuelle d\'une manière magique. L\'élégance n\'a pas de frontières, même digitales. #ParisianStyle #DigitalElegance',
        media_urls: [
          'https://images.clothi.online/posts/sophie/parisian-1.jpg',
          'https://images.clothi.online/posts/sophie/parisian-2.jpg'
        ],
        like_count: 310,
        comment_count: 45,
        share_count: 23,
        visibility: 'public',
        created_at: new Date('2023-11-09 16:45:00'),
        updated_at: new Date()
      },
      // Posts de Rio
      {
        id: uuidv4(),
        user_id: userMap['metaverse_explorer'],
        outfit_id: outfitMap['digital-nomad-explorer'],
        content: 'From mountain peaks to virtual streets 🌄➡️🏙️ This explorer outfit adapts to any environment. The backpack texture changes based on location! Perfect for my metaverse travels. #DigitalNomad #MetaverseExplorer',
        media_urls: [
          'https://images.clothi.online/posts/rio/explorer-1.jpg',
          'https://images.clothi.online/posts/rio/explorer-2.jpg',
          'https://images.clothi.online/posts/rio/explorer-3.gif'
        ],
        like_count: 567,
        comment_count: 89,
        share_count: 67,
        visibility: 'public',
        created_at: new Date('2023-10-16 09:20:00'),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('posts', posts, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('posts', null, {});
  }
};