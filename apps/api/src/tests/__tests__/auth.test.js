/**
 * Tests para el módulo de Autenticación
 * Pruebas unitarias con mocks de dependencias externas
 */

jest.mock('../../config/supabase', () => ({
  supabase: {
    auth: {
      signOut: jest.fn(),
    }
  },
  supabaseAdmin: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      admin: {
        deleteUser: jest.fn(),
      }
    }
  }
}));

jest.mock('../../modules/auth/repositories/userRepository', () => ({
  create: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
}));

const AuthService = require('../../modules/auth/services/authService');
const UserRepository = require('../../modules/auth/repositories/userRepository');
const { supabaseAdmin } = require('../../config/supabase');

describe('Auth Service - Crear Usuarios', () => {
  const mockUserData = {
    email: 'test@example.com',
    password: 'Password123!',
    username: 'testuser',
    display_name: 'Test User',
    bio: 'Mi biografía'
  };

  const mockSupabaseUser = {
    id: 'user-uuid-123',
    email: 'test@example.com',
  };

  const mockProfile = {
    id: 'user-uuid-123',
    email: 'test@example.com',
    username: 'testuser',
    display_name: 'Test User',
    bio: 'Mi biografía',
    avatar_url: null,
    created_at: '2025-12-17T10:00:00Z',
  };

  const mockSession = {
    access_token: 'token_jwt_123',
    refresh_token: 'refresh_token_456',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Registrar Usuario - Casos de Éxito', () => {
    it('debe crear un usuario correctamente con todos los datos', async () => {
      // Arrange
      supabaseAdmin.auth.signUp.mockResolvedValueOnce({
        data: { user: mockSupabaseUser },
        error: null
      });

      UserRepository.create.mockResolvedValueOnce(mockProfile);

      supabaseAdmin.auth.signInWithPassword.mockResolvedValueOnce({
        data: { session: mockSession },
        error: null
      });

      // Act
      const result = await AuthService.register(mockUserData);

      // Assert
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refresh_token');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.username).toBe('testuser');
      expect(result.token).toBe('token_jwt_123');
    });

    it('debe crear perfil en BD después de registrar en Supabase', async () => {
      // Arrange
      supabaseAdmin.auth.signUp.mockResolvedValueOnce({
        data: { user: mockSupabaseUser },
        error: null
      });

      UserRepository.create.mockResolvedValueOnce(mockProfile);

      supabaseAdmin.auth.signInWithPassword.mockResolvedValueOnce({
        data: { session: mockSession },
        error: null
      });

      // Act
      await AuthService.register(mockUserData);

      // Assert
      expect(UserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'user-uuid-123',
          email: 'test@example.com',
          username: 'testuser'
        })
      );
    });

    it('debe usar display_name por defecto si no se proporciona', async () => {
      // Arrange
      const userData = {
        ...mockUserData,
        display_name: undefined
      };

      supabaseAdmin.auth.signUp.mockResolvedValueOnce({
        data: { user: mockSupabaseUser },
        error: null
      });

      UserRepository.create.mockResolvedValueOnce({
        ...mockProfile,
        display_name: 'testuser' // Usa username como display_name
      });

      supabaseAdmin.auth.signInWithPassword.mockResolvedValueOnce({
        data: { session: mockSession },
        error: null
      });

      // Act
      await AuthService.register(userData);

      // Assert
      expect(UserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          display_name: 'testuser'
        })
      );
    });
  });

  describe('Registrar Usuario - Casos de Error', () => {
    it('debe lanzar error si Supabase Auth falla', async () => {
      // Arrange
      supabaseAdmin.auth.signUp.mockResolvedValueOnce({
        data: null,
        error: new Error('Email already registered')
      });

      // Act & Assert
      await expect(AuthService.register(mockUserData)).rejects.toThrow('Email already registered');
    });

    it('debe lanzar error si falla la creación del perfil', async () => {
      // Arrange
      supabaseAdmin.auth.signUp.mockResolvedValueOnce({
        data: { user: mockSupabaseUser },
        error: null
      });

      UserRepository.create.mockRejectedValueOnce(
        new Error('Database error: unique constraint violation')
      );

      // Act & Assert
      await expect(AuthService.register(mockUserData)).rejects.toThrow('Database error');
    });

    it('debe lanzar error si falla la autenticación después del registro', async () => {
      // Arrange
      supabaseAdmin.auth.signUp.mockResolvedValueOnce({
        data: { user: mockSupabaseUser },
        error: null
      });

      UserRepository.create.mockResolvedValueOnce(mockProfile);

      supabaseAdmin.auth.signInWithPassword.mockResolvedValueOnce({
        data: null,
        error: new Error('Invalid credentials')
      });

      // Act & Assert
      await expect(AuthService.register(mockUserData)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('Validación de Datos de Entrada', () => {
    it('debe validar que email sea requerido', async () => {
      // Arrange
      const invalidData = { ...mockUserData, email: undefined };

      // Act & Assert
      await expect(AuthService.register(invalidData)).rejects.toThrow();
    });

    it('debe validar que password sea requerido', async () => {
      // Arrange
      const invalidData = { ...mockUserData, password: undefined };

      // Act & Assert
      await expect(AuthService.register(invalidData)).rejects.toThrow();
    });

    it('debe validar que username sea requerido', async () => {
      // Arrange
      const invalidData = { ...mockUserData, username: undefined };

      // Act & Assert
      await expect(AuthService.register(invalidData)).rejects.toThrow();
    });
  });

  describe('Recuperación de Errores', () => {
    it('debe limpiar usuario en Supabase si falla la creación del perfil', async () => {
      // Arrange
      supabaseAdmin.auth.signUp.mockResolvedValueOnce({
        data: { user: mockSupabaseUser },
        error: null
      });

      UserRepository.create.mockRejectedValueOnce(
        new Error('Profile creation failed')
      );

      // Act
      try {
        await AuthService.register(mockUserData);
      } catch (error) {
        // Error esperado
      }

      // Assert - Verify cleanup attempt
      expect(supabaseAdmin.auth.admin.deleteUser).toHaveBeenCalledWith('user-uuid-123');
    });
  });
});