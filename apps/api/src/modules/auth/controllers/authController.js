const AuthService = require('../services/authService');
const { AppError } = require('../../../middleware/errorHandler');

class AuthController {
  /**
   * @desc    Registrar nuevo usuario
   * @route   POST /api/auth/register
   * @access  Public
   */
  static async register(req, res, next) {
    try {
      const userData = req.body;
      
      const result = await AuthService.register(userData);
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result
      });
    } catch (error) {
      // Manejar errores específicos
      if (error.message.includes('User already registered')) {
        return next(new AppError('Email already registered', 400));
      }
      if (error.message.includes('Password should be at least')) {
        return next(new AppError('Password too weak', 400));
      }
      if (error.message.includes('duplicate key') || error.message.includes('username')) {
        return next(new AppError('Username already taken', 400));
      }
      next(error);
    }
  }

  /**
   * @desc    Iniciar sesión
   * @route   POST /api/auth/login
   * @access  Public
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      
      const result = await AuthService.login(email, password);
      
      res.json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      if (error.message.includes('Invalid login credentials')) {
        return next(new AppError('Invalid email or password', 401));
      }
      next(error);
    }
  }

  /**
   * @desc    Obtener perfil del usuario actual
   * @route   GET /api/auth/me
   * @access  Private
   */
  static async getMe(req, res, next) {
    try {
      const profile = await AuthService.getCurrentProfile(req.user.id);
      
      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc    Actualizar perfil
   * @route   PUT /api/auth/profile
   * @access  Private
   */
  static async updateProfile(req, res, next) {
    try {
      const updatedProfile = await AuthService.updateProfile(req.user.id, req.body);
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedProfile
      });
    } catch (error) {
      if (error.message.includes('Username already taken')) {
        return next(new AppError('Username already taken', 400));
      }
      next(error);
    }
  }

  /**
   * @desc    Cerrar sesión
   * @route   POST /api/auth/logout
   * @access  Private
   */
  static async logout(req, res, next) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (token) {
        await AuthService.logout(token);
      }
      
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc    Refrescar token
   * @route   POST /api/auth/refresh
   * @access  Public
   */
  static async refreshToken(req, res, next) {
    try {
      const { refresh_token } = req.body;
      
      if (!refresh_token) {
        throw new AppError('Refresh token is required', 400);
      }
      
      const result = await AuthService.refreshToken(refresh_token);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      if (error.message.includes('Refresh token not found')) {
        return next(new AppError('Invalid refresh token', 401));
      }
      next(error);
    }
  }

  /**
   * @desc    Verificar si username está disponible
   * @route   GET /api/auth/check-username/:username
   * @access  Public
   */
  static async checkUsername(req, res, next) {
    try {
      const { username } = req.params;
      
      const isAvailable = await AuthService.checkUsernameAvailability(username);
      
      res.json({
        success: true,
        available: isAvailable,
        message: isAvailable ? 'Username available' : 'Username already taken'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc    Convertirse en vendedor
   * @route   POST /api/auth/become-seller
   * @access  Private
   */
  static async becomeSeller(req, res, next) {
    try {
      const { shop_name, shop_description } = req.body;
      
      if (!shop_name) {
        throw new AppError('Shop name is required', 400);
      }
      
      const updatedProfile = await AuthService.becomeSeller(req.user.id, {
        shop_name,
        shop_description
      });
      
      res.json({
        success: true,
        message: 'You are now a seller!',
        data: updatedProfile
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc    Buscar usuarios
   * @route   GET /api/auth/users
   * @access  Private/Admin
   */
  static async searchUsers(req, res, next) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        is_seller,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = req.query;
      
      const filters = {};
      if (is_seller !== undefined) {
        filters.is_seller = is_seller === 'true';
      }
      
      const result = await AuthService.searchUsers({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        filters,
        sortBy,
        sortOrder
      });
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc    Obtener vendedores destacados
   * @route   GET /api/auth/featured-sellers
   * @access  Public
   */
  static async getFeaturedSellers(req, res, next) {
    try {
      const limit = req.query.limit || 10;
      
      const sellers = await AuthService.getFeaturedSellers(parseInt(limit));
      
      res.json({
        success: true,
        data: sellers
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc    Obtener usuario por ID
   * @route   GET /api/auth/users/:id
   * @access  Public
   */
  static async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      
      const profile = await AuthService.getCurrentProfile(id);
      
      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return next(new AppError('User not found', 404));
      }
      next(error);
    }
  }
}

// Añadir método faltante al AuthService
AuthService.checkUsernameAvailability = async (username) => {
  const UserRepository = require('../repositories/userRepository');
  return await UserRepository.isUsernameAvailable(username);
};

module.exports = AuthController;