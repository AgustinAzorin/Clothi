'use strict';

const { v4: uuidv4 } = require('uuid');
const slugify = require('slugify');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Obtener IDs de usuarios vendedores
    const sellers = await queryInterface.sequelize.query(
      `SELECT id FROM user_profiles WHERE is_seller = true`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Obtener IDs de categorías
    const categories = await queryInterface.sequelize.query(
      `SELECT id, name FROM categories`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name.toLowerCase()] = cat.id;
    });

    const products = [
      // Productos digitales de Techwear Labs
      {
        id: uuidv4(),
        seller_id: sellers[1].id, // techwear_labs
        name: 'Neon Circuit Jacket',
        description: 'Chaqueta digital con circuitos de neón animados que reaccionan al movimiento. Perfecta para ambientes cyberpunk.',
        price: 29.99,
        product_type: 'digital',
        category_id: categoryMap['outerwear'],
        model_url: 'https://models.clothi.online/techwear/neon-circuit.glb',
        model_preview_url: 'https://images.clothi.online/techwear/neon-circuit-preview.jpg',
        model_scale: 1.0,
        model_rotation: { x: 0, y: 0, z: 0 },
        status: 'published',
        is_featured: true,
        view_count: 2450,
        like_count: 320,
        purchase_count: 89,
        slug: 'neon-circuit-jacket-digital',
        tags: ['techwear', 'cyberpunk', 'neon', 'jacket', 'digital', 'animated'],
        created_at: new Date('2023-10-15'),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        seller_id: sellers[1].id,
        name: 'Quantum Glitch Pants',
        description: 'Pantalones con efecto glitch que distorsionan la realidad alrededor. Incluye efectos de partículas.',
        price: 24.99,
        product_type: 'digital',
        category_id: categoryMap['bottoms'],
        model_url: 'https://models.clothi.online/techwear/quantum-glitch.glb',
        model_preview_url: 'https://images.clothi.online/techwear/quantum-glitch-preview.jpg',
        model_scale: 1.0,
        model_rotation: { x: 0, y: 90, z: 0 },
        status: 'published',
        is_featured: false,
        view_count: 1870,
        like_count: 210,
        purchase_count: 56,
        slug: 'quantum-glitch-pants-digital',
        tags: ['techwear', 'glitch', 'futuristic', 'pants', 'digital', 'effects'],
        created_at: new Date('2023-11-02'),
        updated_at: new Date()
      },
      // Productos de Marta Design
      {
        id: uuidv4(),
        seller_id: sellers[0].id, // marta_design
        name: 'Urban Graffiti Hoodie',
        description: 'Sudadera con graffiti digital animado que cambia de color según el entorno virtual.',
        price: 19.99,
        product_type: 'both',
        category_id: categoryMap['tops'],
        model_url: 'https://models.clothi.online/marta/graffiti-hoodie.glb',
        model_preview_url: 'https://images.clothi.online/marta/graffiti-hoodie-preview.jpg',
        model_scale: 0.95,
        model_rotation: { x: 0, y: 180, z: 0 },
        sku: 'MD-URB-001',
        stock_quantity: 50,
        weight_kg: 0.8,
        dimensions: { width: 30, height: 40, depth: 5 },
        file_url: 'https://downloads.clothi.online/marta/graffiti-hoodie.zip',
        file_size_mb: 45,
        status: 'published',
        is_featured: true,
        view_count: 3120,
        like_count: 450,
        purchase_count: 123,
        slug: 'urban-graffiti-hoodie-digital-physical',
        tags: ['streetwear', 'graffiti', 'hoodie', 'urban', 'animated', 'unisex'],
        created_at: new Date('2023-09-20'),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        seller_id: sellers[0].id,
        name: 'Pixel Art Sneakers',
        description: 'Zapatillas con diseño de pixel art 8-bit. Los pixeles brillan en la oscuridad virtual.',
        price: 34.99,
        product_type: 'digital',
        category_id: categoryMap['footwear'],
        model_url: 'https://models.clothi.online/marta/pixel-sneakers.glb',
        model_preview_url: 'https://images.clothi.online/marta/pixel-sneakers-preview.jpg',
        model_scale: 1.1,
        model_rotation: { x: 0, y: 45, z: 0 },
        status: 'published',
        is_featured: false,
        view_count: 2890,
        like_count: 380,
        purchase_count: 98,
        slug: 'pixel-art-sneakers-digital',
        tags: ['sneakers', 'pixel-art', '8bit', 'retro', 'glow', 'digital'],
        created_at: new Date('2023-10-05'),
        updated_at: new Date()
      },
      // Productos de Digital Couture
      {
        id: uuidv4(),
        seller_id: sellers[3].id, // digital_couture
        name: 'Crystal Evening Gown',
        description: 'Vestido de noche con cristales digitales que refractan la luz virtual. Edición limitada.',
        price: 89.99,
        product_type: 'digital',
        category_id: categoryMap['dresses'],
        model_url: 'https://models.clothi.online/couture/crystal-gown.glb',
        model_preview_url: 'https://images.clothi.online/couture/crystal-gown-preview.jpg',
        model_scale: 0.9,
        model_rotation: { x: 0, y: 0, z: 0 },
        status: 'published',
        is_featured: true,
        view_count: 5670,
        like_count: 890,
        purchase_count: 45,
        slug: 'crystal-evening-gown-limited',
        tags: ['couture', 'crystal', 'evening', 'gown', 'luxury', 'limited'],
        created_at: new Date('2023-08-30'),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        seller_id: sellers[3].id,
        name: 'Holographic Blazer',
        description: 'Blazer holográfico que muestra diferentes texturas según el ángulo de visión.',
        price: 49.99,
        product_type: 'both',
        category_id: categoryMap['outerwear'],
        model_url: 'https://models.clothi.online/couture/holographic-blazer.glb',
        model_preview_url: 'https://images.clothi.online/couture/holographic-blazer-preview.jpg',
        model_scale: 1.0,
        model_rotation: { x: 0, y: 270, z: 0 },
        sku: 'DC-HOL-001',
        stock_quantity: 25,
        weight_kg: 1.2,
        dimensions: { width: 35, height: 55, depth: 8 },
        file_url: 'https://downloads.clothi.online/couture/holographic-blazer.zip',
        file_size_mb: 60,
        status: 'published',
        is_featured: false,
        view_count: 3210,
        like_count: 420,
        purchase_count: 67,
        slug: 'holographic-blazer-digital-physical',
        tags: ['blazer', 'holographic', 'business', 'luxury', 'metallic'],
        created_at: new Date('2023-09-15'),
        updated_at: new Date()
      },
      // Productos de Neo Vintage
      {
        id: uuidv4(),
        seller_id: sellers[2].id, // neo_vintage
        name: '90s Denim Jacket Retro',
        description: 'Chaqueta de denim digital con parches vintage animados. Cada parche cuenta una historia.',
        price: 27.99,
        product_type: 'digital',
        category_id: categoryMap['outerwear'],
        model_url: 'https://models.clothi.online/neo-vintage/denim-jacket.glb',
        model_preview_url: 'https://images.clothi.online/neo-vintage/denim-jacket-preview.jpg',
        model_scale: 1.05,
        model_rotation: { x: 0, y: 90, z: 0 },
        status: 'published',
        is_featured: false,
        view_count: 1980,
        like_count: 230,
        purchase_count: 78,
        slug: '90s-denim-jacket-retro-digital',
        tags: ['vintage', 'denim', '90s', 'retro', 'jacket', 'patches'],
        created_at: new Date('2023-10-22'),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        seller_id: sellers[2].id,
        name: 'Retro Wave Sunglasses',
        description: 'Gafas de sol con efecto de ola retro que se mueve lentamente. Inspirado en el synthwave.',
        price: 14.99,
        product_type: 'digital',
        category_id: categoryMap['accessories'],
        model_url: 'https://models.clothi.online/neo-vintage/retro-sunglasses.glb',
        model_preview_url: 'https://images.clothi.online/neo-vintage/retro-sunglasses-preview.jpg',
        model_scale: 0.8,
        model_rotation: { x: 0, y: 180, z: 0 },
        status: 'published',
        is_featured: true,
        view_count: 2560,
        like_count: 310,
        purchase_count: 145,
        slug: 'retro-wave-sunglasses-digital',
        tags: ['sunglasses', 'retro', 'synthwave', 'accessories', 'vintage'],
        created_at: new Date('2023-11-10'),
        updated_at: new Date()
      },
      // Productos de Street Urban
      {
        id: uuidv4(),
        seller_id: sellers[4].id, // street_urban
        name: 'Basketball Street Jersey',
        description: 'Jersey de baloncesto con números animados que muestran estadísticas en tiempo real.',
        price: 22.99,
        product_type: 'both',
        category_id: categoryMap['sportswear'],
        model_url: 'https://models.clothi.online/street-urban/basketball-jersey.glb',
        model_preview_url: 'https://images.clothi.online/street-urban/basketball-jersey-preview.jpg',
        model_scale: 1.0,
        model_rotation: { x: 0, y: 0, z: 0 },
        sku: 'SU-BSK-001',
        stock_quantity: 100,
        weight_kg: 0.5,
        dimensions: { width: 25, height: 35, depth: 2 },
        file_url: 'https://downloads.clothi.online/street-urban/basketball-jersey.zip',
        file_size_mb: 35,
        status: 'published',
        is_featured: false,
        view_count: 1780,
        like_count: 190,
        purchase_count: 56,
        slug: 'basketball-street-jersey-digital-physical',
        tags: ['sportswear', 'basketball', 'jersey', 'street', 'animated'],
        created_at: new Date('2023-10-30'),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        seller_id: sellers[4].id,
        name: 'Graffiti Backpack',
        description: 'Mochila con graffiti que cambia de diseño según la ubicación virtual.',
        price: 32.99,
        product_type: 'digital',
        category_id: categoryMap['accessories'],
        model_url: 'https://models.clothi.online/street-urban/graffiti-backpack.glb',
        model_preview_url: 'https://images.clothi.online/street-urban/graffiti-backpack-preview.jpg',
        model_scale: 0.9,
        model_rotation: { x: 0, y: 45, z: 0 },
        status: 'published',
        is_featured: true,
        view_count: 2340,
        like_count: 280,
        purchase_count: 89,
        slug: 'graffiti-backpack-digital',
        tags: ['backpack', 'graffiti', 'streetwear', 'accessories', 'dynamic'],
        created_at: new Date('2023-11-05'),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('products', products, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('products', null, {});
  }
};
