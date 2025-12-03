// src/services/permissionService.js
import permissionRepository from "../repositories/permissionRepository.js";
import roleRepository from "../repositories/roleRepository.js";
import userRoleRepository from "../repositories/userRoleRepository.js";

class PermissionService {
    
    async createPermission(data) {
        const existing = await permissionRepository.findByName(data.name);
        if (existing) {
            const err = new Error(`Permission '${data.name}' already exists`);
            err.status = 400;
            throw err;
        }
        return await permissionRepository.create(data);
    }
    
    async getAllPermissions() {
        return await permissionRepository.findAll();
    }
    
    async getPermissionById(id) {
        const permission = await permissionRepository.findById(id);
        if (!permission) {
            const err = new Error("Permission not found");
            err.status = 404;
            throw err;
        }
        return permission;
    }
    
    async getPermissionsByModule(module) {
        return await permissionRepository.findByModule(module);
    }
    
    async updatePermission(id, data) {
        const permission = await permissionRepository.findById(id);
        if (!permission) {
            const err = new Error("Permission not found");
            err.status = 404;
            throw err;
        }
        
        if (data.name && data.name !== permission.name) {
            const existing = await permissionRepository.findByName(data.name);
            if (existing) {
                const err = new Error(`Permission '${data.name}' already exists`);
                err.status = 400;
                throw err;
            }
        }
        
        return await permissionRepository.update(id, data);
    }
    
    async deletePermission(id) {
        const permission = await permissionRepository.findById(id);
        if (!permission) {
            const err = new Error("Permission not found");
            err.status = 404;
            throw err;
        }
        
        // Verificar si el permiso está asignado a algún rol
        // Esto requeriría un método en roleRepository
        
        return await permissionRepository.delete(id);
    }
    
    // Para el authorize middleware
    async getPermissionsForUser(userId) {
        try {
            const userPermissions = await userRoleRepository.getUserPermissions(userId);
            
            if (!userPermissions || userPermissions.length === 0) {
                return [];
            }
            
            // userPermissions es un array de objetos Permission
            return userPermissions
                .filter(p => p && p.name) // Filtrar solo los que tienen name
                .map(p => p.name);
        } catch (error) {
            console.error("Error getting user permissions:", error);
            return [];
        }
    }
    
    // Verificar si usuario tiene un permiso específico
    async userHasPermission(userId, permissionName) {
        const permissions = await this.getPermissionsForUser(userId);
        return permissions.includes(permissionName);
    }
}

export default new PermissionService();