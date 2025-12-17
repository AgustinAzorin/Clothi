const { supabase, supabaseAdmin } = require('../../../config/supabase');
const UserRepository = require('../repositories/userRepository');

class AuthService {
  /**
   * Registrar nuevo usuario
   */
  static async register(userData) {
    let authData = null;
    try {
      // 1. Registrar en Supabase Auth
      const { data: authDataResponse, error: authError } = await supabaseAdmin.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            username: userData.username,
            display_name: userData.display_name || userData.username,
          }
        }
      });

      authData = authDataResponse;

      if (authError) {
        throw new Error(authError.message);
      }

      // 2. Crear perfil usando Repository
      const profile = await UserRepository.create({
        id: authData.user.id,
        email: userData.email,
        username: userData.username,
        display_name: userData.display_name || userData.username,
        bio: userData.bio || '',
        avatar_url: userData.avatar_url || null
      });

      // 3. Generar token JWT
      const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.signInWithPassword({
        email: userData.email,
        password: userData.password,
      });

      if (sessionError) {
        throw new Error(sessionError.message);
      }

      return {
        user: profile,
        token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
      };
    } catch (error) {
      // Si hay error, intentar limpiar
      if (authData?.user?.id) {
        try {
          await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        } catch (cleanupError) {
          console.error('Error cleaning up failed registration:', cleanupError);
        }
      }
      throw error;
    }
  }

  /**
   * Iniciar sesión
   */
  static async login(email, password) {
    try {
      const { data: { session, user }, error } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      // Obtener perfil usando Repository
      const profile = await UserRepository.findById(user.id);

      if (!profile) {
        throw new Error('User profile not found');
      }

      return {
        user: profile,
        token: session.access_token,
        refresh_token: session.refresh_token,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener perfil de usuario actual
   */
  static async getCurrentProfile(userId) {
    try {
      const profile = await UserRepository.findById(userId);
      
      if (!profile) {
        throw new Error('Profile not found');
      }

      return profile;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar perfil
   */
  static async updateProfile(userId, updateData) {
    try {
      // Filtrar campos que no se pueden actualizar directamente
      const { email, username, ...allowedUpdates } = updateData;
      
      // Si intentan cambiar username, verificar disponibilidad
      if (username) {
        const isAvailable = await UserRepository.isUsernameAvailable(username);
        if (!isAvailable) {
          throw new Error('Username already taken');
        }
        allowedUpdates.username = username;
      }
      
      const updatedProfile = await UserRepository.update(userId, allowedUpdates);
      return updatedProfile;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cerrar sesión
   */
  static async logout(token) {
    try {
      const { error } = await supabaseAdmin.auth.signOut(token);
      
      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Refrescar token
   */
  static async refreshToken(refreshToken) {
    try {
      const { data: { session }, error } = await supabaseAdmin.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        token: session.access_token,
        refresh_token: session.refresh_token,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Convertirse en vendedor
   */
  static async becomeSeller(userId, sellerData) {
    try {
      const updateData = {
        is_seller: true,
        shop_name: sellerData.shop_name,
        shop_description: sellerData.shop_description || '',
        seller_rating: 0,
        total_sales: 0
      };
      
      const updatedProfile = await UserRepository.update(userId, updateData);
      return updatedProfile;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buscar usuarios
   */
  static async searchUsers(searchParams) {
    try {
      const result = await UserRepository.findAllPaginated(searchParams);
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener vendedores destacados
   */
  static async getFeaturedSellers(limit = 10) {
    try {
      const sellers = await UserRepository.findFeaturedSellers(limit);
      return sellers;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar estadísticas
   */
  static async updateUserStats(userId, stats) {
    try {
      const updatedUser = await UserRepository.updateStats(userId, stats);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AuthService;