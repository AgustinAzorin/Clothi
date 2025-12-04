'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_profiles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      display_name: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      avatar_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      // Stats
      follower_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      following_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      outfit_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      // Preferences
      theme: {
        type: Sequelize.STRING(20),
        defaultValue: 'light',
        allowNull: false
      },
      language: {
        type: Sequelize.STRING(10),
        defaultValue: 'es',
        allowNull: false
      },
      // Social links
      instagram_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      twitter_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      website_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      // Seller info
      is_seller: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      shop_name: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      shop_description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      seller_rating: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0,
        allowNull: false
      },
      total_sales: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Índices
    await queryInterface.addIndex('user_profiles', ['username'], {
      unique: true,
      name: 'user_profiles_username_unique'
    });
    
    await queryInterface.addIndex('user_profiles', ['is_seller'], {
      where: { is_seller: true },
      name: 'user_profiles_is_seller_index'
    });

    // Constraints
    await queryInterface.addConstraint('user_profiles', {
      fields: ['username'],
      type: 'check',
      name: 'username_min_length',
      where: Sequelize.where(
        Sequelize.fn('char_length', Sequelize.col('username')),
        '>=',
        3
      )
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_profiles');
  }
};