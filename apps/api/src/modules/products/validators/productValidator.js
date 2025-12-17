const Joi = require('joi');

const createProductSchema = Joi.object({
  name: Joi.string().min(2).max(200).required().messages({
    'string.empty': 'Product name is required',
    'string.min': 'Product name must be at least 2 characters',
    'string.max': 'Product name must not exceed 200 characters'
  }),
  description: Joi.string().max(5000).messages({
    'string.max': 'Description must not exceed 5000 characters'
  }),
  price: Joi.number().positive().precision(2).required().messages({
    'number.positive': 'Price must be a positive number',
    'any.required': 'Price is required'
  }),
  product_type: Joi.string()
    .valid('digital', 'physical', 'both')
    .default('digital')
    .messages({
      'any.only': 'Product type must be digital, physical, or both'
    }),
  category_id: Joi.string().uuid().messages({
    'string.guid': 'Invalid category ID'
  }),
  model_url: Joi.string().uri().messages({
    'string.uri': 'Invalid model URL'
  }),
  model_preview_url: Joi.string().uri().messages({
    'string.uri': 'Invalid model preview URL'
  }),
  model_scale: Joi.number().min(0.01).max(10).messages({
    'number.min': 'Model scale must be at least 0.01',
    'number.max': 'Model scale must not exceed 10'
  }),
  sku: Joi.string().max(100).messages({
    'string.max': 'SKU must not exceed 100 characters'
  }),
  stock_quantity: Joi.number().integer().min(0).messages({
    'number.min': 'Stock quantity must be at least 0'
  }),
  file_url: Joi.string().uri().messages({
    'string.uri': 'Invalid file URL'
  }),
  file_size_mb: Joi.number().positive().messages({
    'number.positive': 'File size must be a positive number'
  }),
  status: Joi.string()
    .valid('draft', 'published', 'archived')
    .default('draft')
    .messages({
      'any.only': 'Status must be draft, published, or archived'
    }),
  is_featured: Joi.boolean().default(false),
  tags: Joi.array().items(Joi.string().uuid()).messages({
    'string.guid': 'Invalid tag ID'
  }),
  brands: Joi.array().items(Joi.string().uuid()).messages({
    'string.guid': 'Invalid brand ID'
  })
}).min(3);

const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(200),
  description: Joi.string().max(5000),
  price: Joi.number().positive().precision(2),
  product_type: Joi.string().valid('digital', 'physical', 'both'),
  category_id: Joi.string().uuid(),
  model_url: Joi.string().uri(),
  model_preview_url: Joi.string().uri(),
  model_scale: Joi.number().min(0.01).max(10),
  sku: Joi.string().max(100),
  stock_quantity: Joi.number().integer().min(0),
  file_url: Joi.string().uri(),
  file_size_mb: Joi.number().positive(),
  status: Joi.string().valid('draft', 'published', 'archived'),
  is_featured: Joi.boolean(),
  tags: Joi.array().items(Joi.string().uuid()),
  brands: Joi.array().items(Joi.string().uuid())
}).min(1);

const addCommentSchema = Joi.object({
  content: Joi.string().min(1).max(1000).required().messages({
    'string.empty': 'Comment content is required',
    'string.max': 'Comment must not exceed 1000 characters'
  }),
  parentCommentId: Joi.string().uuid().optional().messages({
    'string.guid': 'Invalid parent comment ID'
  })
});

const addRatingSchema = Joi.object({
  score: Joi.number().integer().min(1).max(5).required().messages({
    'number.min': 'Rating must be at least 1',
    'number.max': 'Rating must not exceed 5',
    'any.required': 'Rating score is required'
  }),
  review: Joi.string().max(2000).messages({
    'string.max': 'Review must not exceed 2000 characters'
  })
});

const shareProductSchema = Joi.object({
  shared_to: Joi.string()
    .valid('whatsapp', 'facebook', 'twitter', 'instagram', 'email', 'direct_link', 'copy_link')
    .required()
    .messages({
      'any.required': 'Share platform is required',
      'any.only': 'Invalid share platform'
    }),
  shared_with_user_id: Joi.string().uuid().optional().messages({
    'string.guid': 'Invalid user ID'
  }),
  message: Joi.string().max(500).messages({
    'string.max': 'Message must not exceed 500 characters'
  })
});

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const messages = error.details.map(detail => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    req.body = value;
    next();
  };
};

module.exports = {
  createProductSchema,
  updateProductSchema,
  addCommentSchema,
  addRatingSchema,
  shareProductSchema,
  validate
};
