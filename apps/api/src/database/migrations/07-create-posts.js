'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('posts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'user_profiles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      outfit_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'outfits',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      media_urls: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        defaultValue: [],
        allowNull: false
      },
      // Engagement stats
      like_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      comment_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      share_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      visibility: {
        type: Sequelize.ENUM('public', 'private', 'followers'),
        defaultValue: 'public',
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
    await queryInterface.addIndex('posts', ['user_id']);
    await queryInterface.addIndex('posts', ['outfit_id'], {
      where: { outfit_id: { [Sequelize.Op.ne]: null } }
    });
    await queryInterface.addIndex('posts', ['created_at']);

    // Constraints
    await queryInterface.addConstraint('posts', {
      fields: ['like_count', 'comment_count', 'share_count'],
      type: 'check',
      name: 'posts_counts_non_negative',
      where: {
        like_count: { [Sequelize.Op.gte]: 0 },
        comment_count: { [Sequelize.Op.gte]: 0 },
        share_count: { [Sequelize.Op.gte]: 0 }
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('posts');
  }
};