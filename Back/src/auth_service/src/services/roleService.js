// src/services/roleService.js
import roleRepository from "../repositories/roleRepository.js";
import userRoleRepository from "../repositories/userRoleRepository.js";
import permissionRepository from "../repositories/permissionRepository.js"; // Necesitarás crearlo

class RoleService {
    
    // Crear rol
    async createRole(data) {
        const { name } = data;
        
        // Verificar si el rol ya existe
        const existingRole = await roleRepository.findByName(name);
        if (existingRole) {
            const err = new Error(`Role '${name}' already exists`);
            err.status = 400;
            throw err;
        }
        
        return await roleRepository.create(data);
    }

    // Obtener todos los roles (alias para getAllRoles)
    async getRoles() {
        return await roleRepository.findAll();
    }

    // Alias para getAllRoles
    async getAllRoles() {
        return await this.getRoles();
    }

    // Obtener rol por ID
    async getRoleById(id) {
        const role = await roleRepository.findById(id);
        if (!role) {
            const err = new Error("Role not found");
            err.status = 404;
            throw err;
        }
        return role;
    }

    // Actualizar rol
    async updateRole(id, data) {
        const role = await roleRepository.findById(id);
        if (!role) {
            const err = new Error("Role not found");
            err.status = 404;
            throw err;
        }
        
        // Si se cambia el nombre, verificar que no exista otro con ese nombre
        if (data.name && data.name !== role.name) {
            const existing = await roleRepository.findByName(data.name);
            if (existing) {
                const err = new Error(`Role '${data.name}' already exists`);
                err.status = 400;
                throw err;
            }
        }
        
        return await roleRepository.update(id, data);
    }

    // Eliminar rol
    async deleteRole(id) {
        const role = await roleRepository.findById(id);
        if (!role) {
            const err = new Error("Role not found");
            err.status = 404;
            throw err;
        }
        
        // Verificar si el rol está asignado a algún usuario
        // Esto requeriría un método en userRoleRepository
        // Por ahora asumimos que se puede eliminar
        
        return await roleRepository.delete(id);
    }

    // Asignar permiso a rol
    async assignPermission(roleId, permissionId) {
        // Verificar que exista el rol
        const role = await roleRepository.findById(roleId);
        if (!role) {
            const err = new Error("Role not found");
            err.status = 404;
            throw err;
        }
        
        // Verificar que exista el permiso (necesitas permissionRepository)
        // const permission = await permissionRepository.findById(permissionId);
        // if (!permission) {
        //     const err = new Error("Permission not found");
        //     err.status = 404;
        //     throw err;
        // }
        
        return await roleRepository.assignPermission(roleId, permissionId);
    }

    // Remover permiso de rol
    async removePermission(roleId, permissionId) {
        // Verificar que exista el rol
        const role = await roleRepository.findById(roleId);
        if (!role) {
            const err = new Error("Role not found");
            err.status = 404;
            throw err;
        }
        
        return await roleRepository.removePermission(roleId, permissionId);
    }

    // Obtener permisos de un rol
    async getRolePermissions(roleId) {
        const role = await roleRepository.findById(roleId);
        if (!role) {
            const err = new Error("Role not found");
            err.status = 404;
            throw err;
        }
        
        return await roleRepository.getRolePermissions(roleId);
    }

    // ========== MÉTODOS PARA AUTHORIZE MIDDLEWARE ==========
    
    // Devuelve los nombres de los roles que tiene un usuario
    async getUserRolesNames(userId) {
        try {
            const userRoles = await userRoleRepository.getRolesByUser(userId);
            
            if (!userRoles || userRoles.length === 0) {
                return [];
            }
            
            // userRoles es un array de objetos con Role incluido
            return userRoles
                .filter(ur => ur.Role) // Filtrar solo los que tienen Role
                .map(ur => ur.Role.name);
        } catch (error) {
            console.error("Error getting user roles names:", error);
            return [];
        }
    }

    // Verifica si el usuario tiene un rol específico
    async userHasRole(userId, roleName) {
        const names = await this.getUserRolesNames(userId);
        return names.includes(roleName);
    }

    // Obtener todos los roles de un usuario con detalles
    async getUserRolesWithDetails(userId) {
        return await userRoleRepository.getRolesByUser(userId);
    }
}

export default new RoleService();