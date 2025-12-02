import { DataTypes } from "sequelize";
import sequelize from "../config/supabase.js";

const User = sequelize.define("User", {
  id: { type: DataTypes.UUID, primaryKey: true },
  email: DataTypes.STRING,
  password: DataTypes.STRING
}, {
  tableName: "users",
  schema: "auth",
  timestamps: false
});

export default User;
