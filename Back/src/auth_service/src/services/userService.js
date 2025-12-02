// src/services/userService.js

import bcrypt from 'bcrypt';
import userRepository from '../repositories/userRepository.js';
import userProfileRepository from '../repositories/userProfileRepository.js';
import roleRepository from '../repositories/roleRepository.js';
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
}

export default new UserService();
