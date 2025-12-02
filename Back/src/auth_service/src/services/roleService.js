// services/roleService.js
import roleRepository from "../repositories/roleRepository.js";
import Role from "../models/role.js";

class RoleService {
  /**
   * Devuelve los nombres de los roles que tiene un usuario
   * Ej: ["admin", "user"]
   */
  async getUserRolesNames(userId) {
    const userRoles = await roleRepository.getUserRoles(userId);
    if (!userRoles || userRoles.length === 0) return [];

    const roleIds = userRoles.map(r => r.role_id);

    const roles = await Role.findAll({
      where: { id: roleIds }
    });

    return roles.map(r => r.name);
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  async userHasRole(userId, roleName) {
    const names = await this.getUserRolesNames(userId);
    return names.includes(roleName);
  }

  /**
   * Crear rol
   */
  async createRole(data) {
    return roleRepository.create(data);
  }

  /**
   * Obtener todos los roles
   */
  async getAllRoles() {
    return roleRepository.findAll();
  }

  /**
   * Obtener rol por ID
   */
  async getRoleById(id) {
    return roleRepository.findById(id);
  }

  /**
   * Actualizar rol
   */
  async updateRole(id, data) {
    return roleRepository.update(id, data);
  }

  /**
   * Eliminar rol
   */
  async deleteRole(id) {
    return roleRepository.delete(id);
  }
}

export default new RoleService();
