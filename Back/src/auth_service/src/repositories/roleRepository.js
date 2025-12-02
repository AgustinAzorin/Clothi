import Role from "../models/role.js";
import UserRole from "../models/userRole.js";

export default {
  getAllRoles: () => Role.findAll(),
  assignRole: (data) => UserRole.create(data),
  getUserRoles: (userId) => UserRole.findAll({ where: { user_id: userId } }),
};
