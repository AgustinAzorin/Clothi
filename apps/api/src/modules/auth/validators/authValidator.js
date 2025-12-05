const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  username: Joi.string().min(3).max(50).required(),
  display_name: Joi.string().max(100).optional(),
  bio: Joi.string().max(500).optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const updateProfileSchema = Joi.object({
  display_name: Joi.string().max(100).optional(),
  bio: Joi.string().max(500).optional(),
  avatar_url: Joi.string().uri().optional(),
  theme: Joi.string().valid('light', 'dark', 'system').optional(),
  language: Joi.string().valid('es', 'en', 'fr', 'pt').optional(),
  instagram_url: Joi.string().uri().optional(),
  twitter_url: Joi.string().uri().optional(),
  website_url: Joi.string().uri().optional(),
});

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));
    
    return res.status(400).json({
      error: 'Validation failed',
      details: errors,
    });
  }
  
  next();
};

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  validate,
};