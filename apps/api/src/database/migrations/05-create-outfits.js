'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('outfits', {
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
      title: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      style_tags: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
        allowNull: false
      },
      color_palette: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
        allowNull: false
      },
      total_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      scene_data: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {}
      },
      thumbnail_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      visibility: {
        type: Sequelize.ENUM('public', 'private', 'unlisted'),
        defaultValue: 'public',
        allowNull: false
      },
      is_template: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      // Stats
      view_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      like_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      save_count: {
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
    await queryInterface.addIndex('outfits', ['user_id']);
    await queryInterface.addIndex('outfits', ['visibility'], {
      where: { visibility: 'public' },
      name: 'outfits_visibility_public_index'
    });
    await queryInterface.addIndex('outfits', ['created_at']);

    // Índice GIN para style_tags
    await queryInterface.sequelize.query(`
      CREATE INDEX outfits_style_tags_idx ON outfits USING GIN(style_tags);
    `);

    // Constraints
    await queryInterface.addConstraint('outfits', {
      fields: ['total_price'],
      type: 'check',
      name: 'outfits_total_price_non_negative',
      where: {
        total_price: {
          [Sequelize.Op.gte]: 0
        }
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('outfits');
  }
};