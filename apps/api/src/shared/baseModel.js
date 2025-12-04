const { DataTypes } = require('sequelize');

// Opciones comunes para todos los modelos
const baseOptions = {
  underscored: true, // user_id en lugar de userId
  timestamps: true, // created_at, updated_at
  paranoid: false, // No usar deleted_at (lo manejamos con status)
};

// Campos comunes para todos los modelos
const baseFields = {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
};

module.exports = {
  baseOptions,
  baseFields
};