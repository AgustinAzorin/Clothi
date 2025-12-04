'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('comments', {
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
      product_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'products',
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
        onDelete: 'CASCADE'
      },
      post_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'posts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      parent_comment_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'comments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      like_count: {
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
    await queryInterface.addIndex('comments', ['product_id'], {
      where: { product_id: { [Sequelize.Op.ne]: null } }
    });

    await queryInterface.addIndex('comments', ['outfit_id'], {
      where: { outfit_id: { [Sequelize.Op.ne]: null } }
    });

    await queryInterface.addIndex('comments', ['post_id'], {
      where: { post_id: { [Sequelize.Op.ne]: null } }
    });

    await queryInterface.addIndex('comments', ['parent_comment_id'], {
      where: { parent_comment_id: { [Sequelize.Op.ne]: null } }
    });

    await queryInterface.addIndex('comments', ['created_at']);

    // Constraint para asegurar solo un objetivo
    await queryInterface.addConstraint('comments', {
      fields: ['product_id', 'outfit_id', 'post_id'],
      type: 'check',
      name: 'comments_single_target',
      where: Sequelize.where(
        Sequelize.fn(
          'num_nonnulls',
          Sequelize.col('product_id'),
          Sequelize.col('outfit_id'),
          Sequelize.col('post_id')
        ),
        '=',
        1
      )
    });

    // Constraint para contenido no vacío
    await queryInterface.addConstraint('comments', {
      fields: ['content'],
      type: 'check',
      name: 'comments_content_not_empty',
      where: Sequelize.where(
        Sequelize.fn('length', Sequelize.col('content')),
        '>',
        0
      )
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('comments');
  }
};
