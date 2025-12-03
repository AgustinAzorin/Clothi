// src/models/rolePermission.js
import { DataTypes } from "sequelize";
import sequelize from "../config/supabase.js";

const RolePermission = sequelize.define("RolePermission", {
    id: { 
        type: DataTypes.UUID, 
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true 
    },
    role_id: { 
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'roles',
            key: 'id'
        }
    },
    permission_id: { 
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'permissions',
            key: 'id'
        }
    }
}, {
    tableName: "role_permissions",
    schema: "auth_service",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
});
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
export default RolePermission;