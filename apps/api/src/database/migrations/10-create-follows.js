'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('follows', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      follower_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'user_profiles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      following_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'user_profiles',
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

    // Índice único compuesto
    await queryInterface.addIndex('follows', ['follower_id', 'following_id'], {
      unique: true,
      name: 'follows_follower_following_unique'
    });

    // Índices individuales
    await queryInterface.addIndex('follows', ['follower_id']);
    await queryInterface.addIndex('follows', ['following_id']);

    // Constraint para evitar seguirse a sí mismo
    await queryInterface.addConstraint('follows', {
      fields: ['follower_id', 'following_id'],
      type: 'check',
      name: 'follows_no_self_follow',
      where: {
        follower_id: {
          [Sequelize.Op.ne]: Sequelize.col('following_id')
        }
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('follows');
  }
};