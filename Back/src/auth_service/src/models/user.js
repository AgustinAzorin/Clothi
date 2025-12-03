// En src/models/user.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/supabase.js';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'users', // Tabla en Supabase: auth.users
    schema: 'auth',     // Schema de Supabase Auth
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default User;