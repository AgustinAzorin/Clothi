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

// UserRole.js (añade al final)
UserRole.associate = (models) => {
    UserRole.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
    });
    UserRole.belongsTo(models.Role, {
        foreignKey: 'role_id',
        as: 'role'
    });
};

export default UserRole;
