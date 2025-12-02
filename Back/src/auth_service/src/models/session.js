import { DataTypes } from "sequelize";
import sequelize from "../config/supabase.js";

const Session = sequelize.define("Session", {
  id: { type: DataTypes.UUID, primaryKey: true },
  user_id: DataTypes.UUID,
  device: DataTypes.STRING,
  ip_address: DataTypes.STRING,
  user_agent: DataTypes.STRING,
  is_valid: DataTypes.BOOLEAN,
  invalidated_at: DataTypes.DATE
}, {
  tableName: "sessions",
  schema: "auth_service",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false
});

export default Session;
