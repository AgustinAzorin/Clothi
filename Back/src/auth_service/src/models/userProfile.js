import { DataTypes } from "sequelize";
import sequelize from "../config/supabase.js";

const UserProfile = sequelize.define("UserProfile", {
  id: { type: DataTypes.UUID, primaryKey: true },
  full_name: DataTypes.STRING,
  avatar_url: DataTypes.STRING,
  phone: DataTypes.STRING,
  genre: DataTypes.STRING,
  age: DataTypes.INTEGER
}, {
  tableName: "user_profiles",
  schema: "auth_service",
  timestamps: true,
  updatedAt: "updated_at",
  createdAt: "created_at"
});

export default UserProfile;
