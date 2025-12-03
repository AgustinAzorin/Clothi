// src/repositories/roleRepository.js
import Role from '../models/role.js';
import Permission from '../models/permission.js';
import RolePermission from '../models/rolePermission.js';

class RoleRepository {
    
    // Crear rol
    async create(data) {
        try {
            const role = await Role.create(data);
            return role;
        } catch (error) {
            throw new Error(`Error creating role: ${error.message}`);
        }
    }

    // Obtener todos los roles
    async findAll() {
        try {
            const roles = await Role.findAll({
                include: [{
                    model: Permission,
                    as: 'permissions',
                    through: { attributes: [] }
                }],
                order: [['created_at', 'DESC']]
            });
            return roles;
        } catch (error) {
            throw new Error(`Error finding roles: ${error.message}`);
        }
    }

    // Obtener rol por ID
    async findById(id) {
        try {
            const role = await Role.findByPk(id, {
                include: [{
                    model: Permission,
                    as: 'permissions',
                    through: { attributes: [] }
                }]
            });
            return role;
        } catch (error) {
            throw new Error(`Error finding role by ID: ${error.message}`);
        }
    }

    // Obtener rol por nombre
    async findByName(name) {
        try {
            const role = await Role.findOne({
                where: { name }
            });
            return role;
        } catch (error) {
            throw new Error(`Error finding role by name: ${error.message}`);
        }
    }

    // Actualizar rol
    async update(id, data) {
        try {
            const role = await Role.findByPk(id);
            if (!role) {
                throw new Error('Role not found');
            }
            
            await role.update(data);
            return role;
        } catch (error) {
            throw new Error(`Error updating role: ${error.message}`);
        }
    }

    // Eliminar rol
    async delete(id) {
        try {
            const role = await Role.findByPk(id);
            if (!role) {
                throw new Error('Role not found');
            }
            
            await role.destroy();
            return true;
        } catch (error) {
            throw new Error(`Error deleting role: ${error.message}`);
        }
    }

    // Asignar permiso a rol
    async assignPermission(roleId, permissionId) {
        try {
            const existing = await RolePermission.findOne({
                where: {
                    role_id: roleId,
                    permission_id: permissionId
                }
            });
            
            if (existing) {
                throw new Error('Permission already assigned to this role');
            }
            
            const rolePermission = await RolePermission.create({
                role_id: roleId,
                permission_id: permissionId
            });
            
            return rolePermission;
        } catch (error) {
            throw new Error(`Error assigning permission to role: ${error.message}`);
        }
    }

    // Remover permiso de rol
    async removePermission(roleId, permissionId) {
        try {
            const deleted = await RolePermission.destroy({
                where: {
                    role_id: roleId,
                    permission_id: permissionId
                }
            });
            
            if (deleted === 0) {
                throw new Error('Permission not found for this role');
            }
            
            return true;
        } catch (error) {
            throw new Error(`Error removing permission from role: ${error.message}`);
        }
    }

    // Obtener permisos de un rol
    async getRolePermissions(roleId) {
        try {
            const role = await Role.findByPk(roleId, {
                include: [{
                    model: Permission,
                    as: 'permissions',
                    through: { attributes: [] }
                }]
            });
            
            return role?.permissions || [];
        } catch (error) {
            throw new Error(`Error getting role permissions: ${error.message}`);
        }
    }

    // Obtener roles de un usuario (para el service)
    async getUserRoles(userId) {
        try {
            // Esto necesitaría una asociación directa User-Role
            // O usarías userRoleRepository
            // Por ahora devolvemos empty array
            return [];
        } catch (error) {
            throw new Error(`Error getting user roles: ${error.message}`);
        }
    }
}

export default new RoleRepository();