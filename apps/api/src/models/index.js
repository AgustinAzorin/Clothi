const { Sequelize } = require('sequelize');
const { baseOptions } = require('../shared/baseModel');

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
const UserProfile = require('./userProfile')(sequelize, Sequelize);
const Product = require('./product')(sequelize, Sequelize);
const ProductAsset = require('./productAsset')(sequelize, Sequelize);
const Category = require('./category')(sequelize, Sequelize);
const Outfit = require('./outfit')(sequelize, Sequelize);
const OutfitItem = require('./outfitItem')(sequelize, Sequelize);
const Post = require('./post')(sequelize, Sequelize);
const Like = require('./like')(sequelize, Sequelize);
const Comment = require('./comment')(sequelize, Sequelize);
const Follow = require('./follow')(sequelize, Sequelize);
const Order = require('./order')(sequelize, Sequelize);
const OrderItem = require('./orderItem')(sequelize, Sequelize);

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