import { DataTypes } from "sequelize";
import sequelize from "../config/supabase.js";

const Permission = sequelize.define("Permission", {
  id: { type: DataTypes.UUID, primaryKey: true },
  name: DataTypes.STRING,
  description: DataTypes.STRING
}, {
  tableName: "permissions",
  schema: "auth_service",
  timestamps: false
});

export default Permission;
