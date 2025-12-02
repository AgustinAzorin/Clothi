import { DataTypes } from "sequelize";
import sequelize from "../config/supabase.js";

const RolePermission = sequelize.define("RolePermission", {
  id: { type: DataTypes.UUID, primaryKey: true },
  role_id: DataTypes.UUID,
  permission_id: DataTypes.UUID
}, {
  tableName: "role_permissions",
  schema: "auth_service",
  timestamps: false
});

export default RolePermission;
