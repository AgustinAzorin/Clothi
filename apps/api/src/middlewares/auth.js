const { supabaseAdmin } = require('../config/supabase');
const { AuthenticationError, AuthorizationError } = require('./errorHandler');

// Middleware para verificar token JWT de Supabase
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    
    // Verificar token con Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      throw new AuthenticationError('Invalid or expired token');
    }

    // Adjuntar usuario a la request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role || 'user'
    };

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware para verificar rol de usuario
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AuthorizationError(
        `Required roles: ${roles.join(', ')}. Your role: ${req.user.role}`
      ));
    }

    next();
  };
};

// Middleware para verificar propiedad (usuario es dueño del recurso)
const isOwner = (model, idField = 'userId') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      const userId = req.user.id;

      // Buscar el recurso en la base de datos
      const Model = require(`../models/${model}`);
      const resource = await Model.findByPk(resourceId);

      if (!resource) {
        return next(new NotFoundError(`${model} not found`));
      }

      // Verificar que el usuario sea el dueño
      if (resource[idField] !== userId && req.user.role !== 'admin') {
        return next(new AuthorizationError(
          `You don't have permission to access this ${model}`
        ));
      }

      // Adjuntar recurso a la request para reutilizar
      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  authenticate,
  authorize,
  isOwner
};