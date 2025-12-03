// src/repositories/userRoleRepository.js
import UserRole from '../models/userRole.js';
import Role from '../models/role.js';
import Permission from '../models/permission.js';
import RolePermission from '../models/rolePermission.js';

class UserRoleRepository {

    // Asignar un rol a un usuario
    async assignRole(userId, roleId) {
        return await UserRole.create({
            user_id: userId,
            role_id: roleId
        });
    }

    // Remover un rol especifico del usuario
    async removeRole(userId, roleId) {
        return await UserRole.destroy({
            where: {
                user_id: userId,
                role_id: roleId
            }
        });
    }

    // Obtener roles de un usuario
    async getRolesByUser(userId) {
        return await UserRole.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: Role,
                    attributes: ['id', 'name', 'description']
                }
            ]
        });
    }

    // Obtener permisos totales de un usuario (por sus roles)
    async getUserPermissions(userId) {
        const userRoles = await UserRole.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: Role,
                    include: [
                        {
                            model: RolePermission,
                            include: [
                                { model: Permission }
                            ]
                        }
                    ]
                }
            ]
        });

        // Normalizamos todos los permisos en un array simple
        const permissions = [];

        userRoles.forEach(ur => {
            ur.Role?.RolePermissions?.forEach(rp => {
                permissions.push(rp.Permission);
            });
        });

        return permissions;
    }

    // Eliminar todos los roles de un usuario
    async deleteUserRoles(userId) {
        return await UserRole.destroy({
            where: { user_id: userId }
        });
    }
        async findById(roleId) {
        return await Role.findByPk(roleId);
    }
}

export default new UserRoleRepository();
