import { DataTypes } from "sequelize";
import sequelize from "../config/supabase.js";

const Role = sequelize.define("Role", {
  id: { type: DataTypes.UUID, primaryKey: true },
  name: DataTypes.STRING,
  description: DataTypes.STRING
}, {
  tableName: "roles",
  schema: "auth_service",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false
});

export default Role;
