// src/models/permission.js
import { DataTypes } from "sequelize";
import sequelize from "../config/supabase.js";

const Permission = sequelize.define("Permission", {
    id: { 
        type: DataTypes.UUID, 
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true 
    },
    name: { 
        type: DataTypes.STRING, 
        allowNull: false,
        unique: true
    },
    description: { 
        type: DataTypes.STRING 
    },
    module: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    action: { 
        type: DataTypes.STRING, 
        allowNull: false 
    }
}, {
    tableName: "permissions",
    schema: "auth_service",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
});

export default Permission;