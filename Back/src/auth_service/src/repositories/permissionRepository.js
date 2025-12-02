import Permission from "../models/permission.js";
import RolePermission from "../models/rolePermission.js";

export default {
  getPermissionsByRole: (roleId) =>
    RolePermission.findAll({ where: { role_id: roleId } })
};
