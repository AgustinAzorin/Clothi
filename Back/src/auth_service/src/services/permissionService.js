// services/permissionService.js
import RolePermission from "../models/rolePermission.js";
import Permission from "../models/permission.js";
import roleRepository from "../repositories/roleRepository.js";

const permissionService = {
  /**
   * Obtiene una lista de permisos por nombre para un usuario.
   * Devuelve algo como: ['create_user', 'delete_user', ...]
   */
  async getPermissionsForUser(userId) {
    // 1) Obtener roles del usuario (IDs)
    const userRoles = await roleRepository.getUserRoles(userId); // [{ role_id }]
    if (!userRoles || userRoles.length === 0) return [];

    const roleIds = userRoles.map(r => r.role_id);

    // 2) Obtener registros de role_permissions
    const rolePerms = await RolePermission.findAll({
      where: { role_id: roleIds }
    });

    if (!rolePerms || rolePerms.length === 0) return [];

    const permIds = rolePerms.map(rp => rp.permission_id);

    // 3) Obtener permisos por ID
    const perms = await Permission.findAll({
      where: { id: permIds }
    });

    return perms.map(p => p.name);
  },

  /**
   * Verifica si el usuario tiene un permiso
   */
  async userHasPermission(userId, permissionName) {
    const perms = await this.getPermissionsForUser(userId);
    return perms.includes(permissionName);
  }
};

export default permissionService;
