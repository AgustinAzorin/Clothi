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

Role.associate = (models) => {
    Role.belongsToMany(models.Permission, {
        through: models.RolePermission,
        foreignKey: 'role_id',
        as: 'permissions'
    });
    Role.belongsToMany(models.User, {
        through: models.UserRole,
        foreignKey: 'role_id',
        as: 'users'
    });
};

// Permission.js (añade al final)
Permission.associate = (models) => {
    Permission.belongsToMany(models.Role, {
        through: models.RolePermission,
        foreignKey: 'permission_id',
        as: 'roles'
    });
};

// RolePermission.js (añade al final)
RolePermission.associate = (models) => {
    RolePermission.belongsTo(models.Role, {
        foreignKey: 'role_id',
        as: 'role'
    });
    RolePermission.belongsTo(models.Permission, {
        foreignKey: 'permission_id',
        as: 'permission'
    });
};

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

export default Role;