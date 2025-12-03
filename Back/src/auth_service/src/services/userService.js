// src/services/userService.js

import bcrypt from 'bcrypt';
import userRepository from '../repositories/userRepository.js';
import userProfileRepository from '../repositories/userProfileRepository.js';
import userRoleRepository from '../repositories/userRoleRepository.js';

class UserService {

    // Crear usuario + perfil + roles opcionales
    async createUser(data) {
        const { email, password, full_name, phone, genre, age, roles = [] } = data;

        const existing = await userRepository.findByEmail(email);
        if (existing) {
            const err = new Error("Email is already in use");
            err.status = 400;
            throw err;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear usuario en "auth.users" (Supabase table)
        const user = await userRepository.create({
            email,
            password: hashedPassword
        });

        // Crear perfil en "auth_service.user_profiles"
        await userProfileRepository.createProfile({
            id: user.id,
            full_name,
            phone,
            genre,
            age
        });

        // Crear roles si vienen
        if (roles.length > 0) {
            for (const roleName of roles) {
                let role = await roleRepository.findByName(roleName);

                if (!role) {
                    role = await roleRepository.create({ name: roleName });
                }

                await userRoleRepository.assignRole(user.id, role.id);
            }
        }

        return {
            user,
            profile: await userProfileRepository.getProfileByUserId(user.id)
        };
    }

    // Login (sin generar token)
    async validateCredentials(email, password) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            const err = new Error("Invalid email or password");
            err.status = 401;
            throw err;
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            const err = new Error("Invalid email or password");
            err.status = 401;
            throw err;
        }

        return user;
    }

    // Obetener usuario + perfil + roles
    async getUserById(userId) {
        const user = await userRepository.findById(userId);
        if (!user) {
            const err = new Error("User not found");
            err.status = 404;
            throw err;
        }

        const profile = await userProfileRepository.getProfileByUserId(userId);
        const roles = await userRoleRepository.getRolesByUser(userId);

        return { user, profile, roles };
    }

    // Actualizar datos del usuario
    async updateUser(userId, data) {
        const updated = await userRepository.update(userId, data);
        const profile = await userProfileRepository.updateProfile(userId, data);

        return {
            updatedUser: updated,
            updatedProfile: profile
        };
    }

    // Asignar nuevo rol
    async assignRole(userId, roleName) {
        let role = await roleRepository.findByName(roleName);

        if (!role) {
            role = await roleRepository.create({ name: roleName });
        }

        await userRoleRepository.assignRole(userId, role.id);

        return { message: "Role assigned successfully" };
    }

    // Quitar un rol
    async removeRole(userId, roleName) {
        const role = await roleRepository.findByName(roleName);
        if (!role) {
            const err = new Error("Role not found");
            err.status = 404;
            throw err;
        }

        await userRoleRepository.removeRole(userId, role.id);

        return { message: "Role removed successfully" };
    }

    // Obtener permisos totales (roles → permissions)
    async getUserPermissions(userId) {
        const permissions = await userRoleRepository.getUserPermissions(userId);
        return permissions;
    }

    // Eliminar usuario y todo lo relacionado
    async deleteUser(userId) {
        await userProfileRepository.deleteProfile(userId);
        await userRoleRepository.deleteUserRoles(userId);
        await userRepository.delete(userId);

        return { message: "User deleted successfully" };
    }
        // Método nuevo: Cambiar contraseña
    async updatePassword(userId, oldPassword, newPassword) {
        const user = await userRepository.findById(userId);
        if (!user) {
            const err = new Error("User not found");
            err.status = 404;
            throw err;
        }

        // Verificar contraseña actual
        const isValid = await bcrypt.compare(oldPassword, user.password);
        if (!isValid) {
            const err = new Error("Current password is incorrect");
            err.status = 401;
            throw err;
        }

        // Hashear nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Actualizar contraseña
        await userRepository.update(userId, { password: hashedPassword });

        // Invalidar todas las sesiones del usuario por seguridad
        await sessionService.invalidateAllForUser(userId);

        return { success: true };
    }

    // Método nuevo: Obtener roles del usuario
    async getUserRoles(userId) {
        const roles = await userRoleRepository.getRolesByUser(userId);
        return roles;
    }

    // Actualizar método assignRole para aceptar roleId o roleName
    async assignRole(userId, roleIdentifier) {
        let role;
        
        // Verificar si es UUID (roleId) o string (roleName)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(roleIdentifier);
        
        if (isUUID) {
            role = await roleRepository.findById(roleIdentifier);
        } else {
            role = await roleRepository.findByName(roleIdentifier);
        }

        if (!role) {
            const err = new Error("Role not found");
            err.status = 404;
            throw err;
        }

        await userRoleRepository.assignRole(userId, role.id);
        return { message: "Role assigned successfully", role };
    }

    // Actualizar método removeRole para aceptar roleId o roleName
    async removeRole(userId, roleIdentifier) {
        let role;
        
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(roleIdentifier);
        
        if (isUUID) {
            role = await roleRepository.findById(roleIdentifier);
        } else {
            role = await roleRepository.findByName(roleIdentifier);
        }

        if (!role) {
            const err = new Error("Role not found");
            err.status = 404;
            throw err;
        }

        await userRoleRepository.removeRole(userId, role.id);
        return { message: "Role removed successfully" };
    }

    // Método adicional útil: Listar todos los usuarios
    async getAllUsers(options = {}) {
        const { page = 1, limit = 20, role } = options;
        const offset = (page - 1) * limit;

        // Lógica para obtener usuarios con filtros
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

    // Método adicional: Buscar usuarios por email o nombre
    async searchUsers(searchTerm) {
        return await userRepository.search(searchTerm);
    }
}

export default new UserService();
