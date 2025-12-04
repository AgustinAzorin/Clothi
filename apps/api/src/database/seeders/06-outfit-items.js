'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Obtener outfits y productos
    const [outfits, products] = await Promise.all([
      queryInterface.sequelize.query(
        `SELECT id, title FROM outfits`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      ),
      queryInterface.sequelize.query(
        `SELECT id, name FROM products`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      )
    ]);

    const outfitMap = {};
    const productMap = {};

    outfits.forEach(outfit => {
      const key = outfit.title.toLowerCase().replace(/\s+/g, '-');
      outfitMap[key] = outfit.id;
    });

    products.forEach(product => {
      const key = product.name.toLowerCase().replace(/\s+/g, '-');
      productMap[key] = product.id;
    });

    const outfitItems = [
      // Items para "Cyberpunk Night Out"
      {
        id: uuidv4(),
        outfit_id: outfitMap['cyberpunk-night-out'],
        product_id: productMap['neon-circuit-jacket'],
        position: { x: 0, y: 0.5, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        custom_material: { emissive_intensity: 3.0 },
        order_index: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        outfit_id: outfitMap['cyberpunk-night-out'],
        product_id: productMap['quantum-glitch-pants'],
        position: { x: 0, y: -0.5, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        order_index: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        outfit_id: outfitMap['cyberpunk-night-out'],
        product_id: productMap['pixel-art-sneakers'],
        position: { x: 0, y: -1.2, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 0.9, y: 0.9, z: 0.9 },
        order_index: 3,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Items para "Vintage Synthwave Day"
      {
        id: uuidv4(),
        outfit_id: outfitMap['vintage-synthwave-day'],
        product_id: productMap['90s-denim-jacket-retro'],
        position: { x: 0, y: 0.5, z: 0 },
        rotation: { x: 0, y: 90, z: 0 },
        scale: { x: 1.05, y: 1.05, z: 1.05 },
        order_index: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        outfit_id: outfitMap['vintage-synthwave-day'],
        product_id: productMap['retro-wave-sunglasses'],
        position: { x: 0, y: 1.7, z: 0.1 },
        rotation: { x: 0, y: 180, z: 0 },
        scale: { x: 0.8, y: 0.8, z: 0.8 },
        order_index: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Items para "Parisian Elegance"
      {
        id: uuidv4(),
        outfit_id: outfitMap['parisian-elegance'],
        product_id: productMap['crystal-evening-gown'],
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 0.9, y: 0.9, z: 0.9 },
        custom_material: { crystal_intensity: 1.5 },
        order_index: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        outfit_id: outfitMap['parisian-elegance'],
        product_id: productMap['holographic-blazer'],
        position: { x: 0, y: 0.5, z: 0 },
        rotation: { x: 0, y: 270, z: 0 },
        scale: { x: 1.0, y: 1.0, z: 1.0 },
        order_index: 2,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('outfit_items', outfitItems, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('outfit_items', null, {});
  }
};