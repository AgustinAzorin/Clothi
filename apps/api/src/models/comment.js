const { DataTypes, Op } = require('sequelize');
const { baseFields } = require('../shared/baseModel');

module.exports = (sequelize) => {
  const Comment = sequelize.define('Comment', {
    ...baseFields,
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'user_profiles',
        key: 'id'
      }
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    outfit_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'outfits',
        key: 'id'
      }
    },
    post_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'posts',
        key: 'id'
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 1000]
      }
    },
    parent_comment_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'comments',
        key: 'id'
      }
    },
    like_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    }
  }, {
    tableName: 'comments',
    hooks: {
      beforeValidate: (comment) => {
        // Validar que solo un campo objetivo esté lleno
        const targetCount = [comment.product_id, comment.outfit_id, comment.post_id]
          .filter(Boolean).length;
        
        if (targetCount !== 1) {
          throw new Error('Comment debe tener exactamente un objetivo');
        }
        
        // Validar que no sea respuesta de respuesta (máximo 1 nivel)
        if (comment.parent_comment_id) {
          // Esto se manejará mejor en el controlador
        }
      },
      afterCreate: async (comment) => {
        // Actualizar contador de comentarios en el objetivo
        await updateCommentCount(comment, 'increment');
      },
      afterDestroy: async (comment) => {
        // Actualizar contador de comentarios
        await updateCommentCount(comment, 'decrement');
      }
    },
    indexes: [
      {
        fields: ['product_id'],
        where: { product_id: { [Op.ne]: null } }
      },
      {
        fields: ['outfit_id'],
        where: { outfit_id: { [Op.ne]: null } }
      },
      {
        fields: ['post_id'],
        where: { post_id: { [Op.ne]: null } }
      },
      {
        fields: ['parent_comment_id'],
        where: { parent_comment_id: { [Op.ne]: null } }
      },
      {
        fields: ['created_at']
      }
    ]

  });

  // Función helper para actualizar contadores
  async function updateCommentCount(comment, operation) {
    const increment = operation === 'increment' ? 1 : -1;
    
    if (comment.product_id) {
      await sequelize.models.Product.increment('comment_count', {
        by: increment,
        where: { id: comment.product_id }
      });
    } else if (comment.outfit_id) {
      // Nota: outfits no tiene comment_count, se maneja en el feed
    } else if (comment.post_id) {
      await sequelize.models.Post.increment('comment_count', {
        by: increment,
        where: { id: comment.post_id }
      });
    }
  }

  return Comment;
};