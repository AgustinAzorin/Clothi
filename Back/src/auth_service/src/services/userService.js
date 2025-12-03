import bcrypt from 'bcrypt';
import userRepository from '../repositories/userRepository.js';
import userProfileRepository from '../repositories/userProfileRepository.js';
import userRoleRepository from '../repositories/userRoleRepository.js';
import roleRepository from '../repositories/roleRepository.js';
// import sessionService from './sessionService.js'; // Descomenta cuando lo tengas

class UserService {
    // Crear usuario + perfil + roles
    async createUser(data) {
        const { email, password, full_name, phone, genre, age, roles = ['user'] } = data;

        // Validaciones básicas
        if (!email || !password) {
            throw { message: "Email and password are required", status: 400 };
        }

        // Verificar email único
        const existing = await userRepository.findByEmail(email);
        if (existing) {
            throw { message: "Email is already in use", status: 400 };
        }

        // Hashear contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // 1. Crear usuario en auth.users
        const user = await userRepository.create({
            email,
            password: hashedPassword
        });

        // 2. Crear perfil en user_profiles
        await userProfileRepository.createProfile({
            id: user.id,
            full_name: full_name || null,
            phone: phone || null,
            genre: genre || null,
            age: age || null
        });

        // 3. Asignar roles
        for (const roleName of roles) {
            await this.assignRole(user.id, roleName);
        }

        return {
            user: {
                id: user.id,
                email: user.email,
                created_at: user.created_at
            },
            profile: await userProfileRepository.getProfileByUserId(user.id)
        };
    }

    // Validar credenciales (login)
    async validateCredentials(email, password) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw { message: "Invalid email or password", status: 401 };
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            throw { message: "Invalid email or password", status: 401 };
        }

        return {
            id: user.id,
            email: user.email
        };
    }

    // Obtener usuario completo
    async getUserById(userId) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw { message: "User not found", status: 404 };
        }

        const profile = await userProfileRepository.getProfileByUserId(userId);
        const roles = await userRoleRepository.getRolesByUser(userId);

        return {
            user: {
                id: user.id,
                email: user.email,
                created_at: user.created_at
            },
            profile,
            roles
        };
    }

    // Obtener usuario por email
    async getUserByEmail(email) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw { message: "User not found", status: 404 };
        }
        
        return {
            id: user.id,
            email: user.email
        };
    }

    // Actualizar usuario y/o perfil
    async updateUser(userId, data) {
        // Separar campos de usuario y perfil
        const userFields = {};
        const profileFields = {};

        if (data.email !== undefined) userFields.email = data.email;
        // NOTA: La contraseña se cambia con updatePassword()

        if (data.full_name !== undefined) profileFields.full_name = data.full_name;
        if (data.phone !== undefined) profileFields.phone = data.phone;
        if (data.genre !== undefined) profileFields.genre = data.genre;
        if (data.age !== undefined) profileFields.age = data.age;
        if (data.avatar_url !== undefined) profileFields.avatar_url = data.avatar_url;

        // Actualizar solo si hay campos
        let updatedUser = null;
        if (Object.keys(userFields).length > 0) {
            updatedUser = await userRepository.update(userId, userFields);
        }

        let updatedProfile = null;
        if (Object.keys(profileFields).length > 0) {
            updatedProfile = await userProfileRepository.updateProfile(userId, profileFields);
        }

        return {
            updatedUser,
            updatedProfile: updatedProfile || await userProfileRepository.getProfileByUserId(userId)
        };
    }

    // Cambiar contraseña
    async updatePassword(userId, oldPassword, newPassword) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw { message: "User not found", status: 404 };
        }

        // Verificar contraseña actual
        const isValid = await bcrypt.compare(oldPassword, user.password);
        if (!isValid) {
            throw { message: "Current password is incorrect", status: 401 };
        }

        // Validar nueva contraseña
        if (newPassword.length < 6) {
            throw { message: "Password must be at least 6 characters", status: 400 };
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await userRepository.update(userId, { password: hashedPassword });

        // Invalidar sesiones (descomenta cuando tengas sessionService)
        // await sessionService.invalidateAllForUser(userId);

        return { success: true };
    }

    // ASIGNAR ROL (versión única)
    async assignRole(userId, roleIdentifier) {
        let role;
        
        // Verificar si es UUID o nombre
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(roleIdentifier);
        
        if (isUUID) {
            role = await roleRepository.findById(roleIdentifier);
        } else {
            role = await roleRepository.findByName(roleIdentifier);
        }

        if (!role) {
            throw { message: "Role not found", status: 404 };
        }

        // Verificar si ya tiene el rol
        const existing = await userRoleRepository.hasRole(userId, role.id);
        if (existing) {
            return { message: "User already has this role", role };
        }

        await userRoleRepository.assignRole(userId, role.id);
        return { message: "Role assigned successfully", role };
    }

    // REMOVER ROL (versión única)
    async removeRole(userId, roleIdentifier) {
        let role;
        
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(roleIdentifier);
        
        if (isUUID) {
            role = await roleRepository.findById(roleIdentifier);
        } else {
            role = await roleRepository.findByName(roleIdentifier);
        }

        if (!role) {
            throw { message: "Role not found", status: 404 };
        }

        await userRoleRepository.removeRole(userId, role.id);
        return { message: "Role removed successfully" };
    }

    // Obtener roles del usuario
    async getUserRoles(userId) {
        return await userRoleRepository.getRolesByUser(userId);
    }

    // Obtener permisos del usuario
    async getUserPermissions(userId) {
        return await userRoleRepository.getUserPermissions(userId);
    }

    // Listar usuarios con paginación
    async getAllUsers(options = {}) {
        const { page = 1, limit = 20, role } = options;
        const offset = (page - 1) * limit;

        const users = await userRepository.findAll({ limit, offset, role });
        const total = await userRepository.count({ role });

        return {
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    // Buscar usuarios
    async searchUsers(searchTerm) {
        return await userRepository.search(searchTerm);
    }

    // Eliminar usuario completamente
    async deleteUser(userId) {
        // 1. Eliminar perfil
        await userProfileRepository.deleteProfile(userId);
        
        // 2. Eliminar relaciones de roles
        await userRoleRepository.deleteUserRoles(userId);
        
        // 3. Eliminar usuario
        await userRepository.delete(userId);

        return { message: "User deleted successfully" };
    }
}

export default new UserService();