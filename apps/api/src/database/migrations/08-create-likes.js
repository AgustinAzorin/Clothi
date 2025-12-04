'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('likes', {
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

    // Índices únicos para evitar likes duplicados
    await queryInterface.addIndex('likes', ['user_id', 'product_id'], {
      unique: true,
      where: { product_id: { [Sequelize.Op.ne]: null } },
      name: 'likes_user_product_unique'
    });

    await queryInterface.addIndex('likes', ['user_id', 'outfit_id'], {
      unique: true,
      where: { outfit_id: { [Sequelize.Op.ne]: null } },
      name: 'likes_user_outfit_unique'
    });

    await queryInterface.addIndex('likes', ['user_id', 'post_id'], {
      unique: true,
      where: { post_id: { [Sequelize.Op.ne]: null } },
      name: 'likes_user_post_unique'
    });

    // Índices para búsqueda rápida
    await queryInterface.addIndex('likes', ['product_id'], {
      where: { product_id: { [Sequelize.Op.ne]: null } }
    });

    await queryInterface.addIndex('likes', ['outfit_id'], {
      where: { outfit_id: { [Sequelize.Op.ne]: null } }
    });

    await queryInterface.addIndex('likes', ['post_id'], {
      where: { post_id: { [Sequelize.Op.ne]: null } }
    });

    // Constraint para asegurar solo un objetivo
    await queryInterface.addConstraint('likes', {
      fields: ['product_id', 'outfit_id', 'post_id'],
      type: 'check',
      name: 'likes_single_target',
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('likes');
  }
};