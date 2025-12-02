import { DataTypes } from "sequelize";
import sequelize from "../config/supabase.js";

const UserRole = sequelize.define("UserRole", {
  id: { type: DataTypes.UUID, primaryKey: true },
  user_id: DataTypes.UUID,
  role_id: DataTypes.UUID
}, {
  tableName: "user_roles",
  schema: "auth_service",
  timestamps: false
});

export default UserRole;
