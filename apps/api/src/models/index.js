const { Sequelize } = require('sequelize');
const { baseOptions } = require('./shared/baseModel');

// Configuración de Sequelize para Supabase
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  define: baseOptions
});

// Importar todos los modelos
const UserProfile = require('./UserProfile')(sequelize, Sequelize);
const Product = require('./Product')(sequelize, Sequelize);
const ProductAsset = require('./ProductAsset')(sequelize, Sequelize);
const Category = require('./Category')(sequelize, Sequelize);
const Outfit = require('./Outfit')(sequelize, Sequelize);
const OutfitItem = require('./OutfitItem')(sequelize, Sequelize);
const Post = require('./Post')(sequelize, Sequelize);
const Like = require('./Like')(sequelize, Sequelize);
const Comment = require('./Comment')(sequelize, Sequelize);
const Follow = require('./Follow')(sequelize, Sequelize);
const Order = require('./Order')(sequelize, Sequelize);
const OrderItem = require('./OrderItem')(sequelize, Sequelize);

// Configurar relaciones
require('./associations')({
  UserProfile,
  Product,
  ProductAsset,
  Category,
  Outfit,
  OutfitItem,
  Post,
  Like,
  Comment,
  Follow,
  Order,
  OrderItem,
  sequelize
});

module.exports = {
  sequelize,
  Sequelize,
  UserProfile,
  Product,
  ProductAsset,
  Category,
  Outfit,
  OutfitItem,
  Post,
  Like,
  Comment,
  Follow,
  Order,
  OrderItem
};