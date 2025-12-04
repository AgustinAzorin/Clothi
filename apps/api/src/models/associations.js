module.exports = (models) => {
  const {
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
  } = models;

  // UserProfile associations
  UserProfile.hasMany(Product, { foreignKey: 'seller_id', as: 'products' });
  UserProfile.hasMany(Outfit, { foreignKey: 'user_id', as: 'outfits' });
  UserProfile.hasMany(Post, { foreignKey: 'user_id', as: 'posts' });
  UserProfile.hasMany(Like, { foreignKey: 'user_id', as: 'likes' });
  UserProfile.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });
  UserProfile.hasMany(Order, { foreignKey: 'buyer_id', as: 'orders' });
  
  // Follow associations (self-referential)
  UserProfile.belongsToMany(UserProfile, {
    through: Follow,
    as: 'followers',
    foreignKey: 'following_id',
    otherKey: 'follower_id'
  });
  
  UserProfile.belongsToMany(UserProfile, {
    through: Follow,
    as: 'following',
    foreignKey: 'follower_id',
    otherKey: 'following_id'
  });

  // Product associations
  Product.belongsTo(UserProfile, { foreignKey: 'seller_id', as: 'seller' });
  Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
  Product.hasMany(ProductAsset, { foreignKey: 'product_id', as: 'assets' });
  Product.hasMany(OutfitItem, { foreignKey: 'product_id', as: 'outfitItems' });
  Product.hasMany(Like, { foreignKey: 'product_id', as: 'likes' });
  Product.hasMany(Comment, { foreignKey: 'product_id', as: 'comments' });
  Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'orderItems' });

  // ProductAsset associations
  ProductAsset.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

  // Category associations
  Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
  Category.belongsTo(Category, { foreignKey: 'parent_category_id', as: 'parent' });
  Category.hasMany(Category, { foreignKey: 'parent_category_id', as: 'subcategories' });

  // Outfit associations
  Outfit.belongsTo(UserProfile, { foreignKey: 'user_id', as: 'user' });
  Outfit.hasMany(OutfitItem, { foreignKey: 'outfit_id', as: 'items' });
  Outfit.hasMany(Like, { foreignKey: 'outfit_id', as: 'likes' });
  Outfit.hasMany(Comment, { foreignKey: 'outfit_id', as: 'comments' });
  Outfit.hasOne(Post, { foreignKey: 'outfit_id', as: 'post' });

  // OutfitItem associations
  OutfitItem.belongsTo(Outfit, { foreignKey: 'outfit_id', as: 'outfit' });
  OutfitItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

  // Post associations
  Post.belongsTo(UserProfile, { foreignKey: 'user_id', as: 'user' });
  Post.belongsTo(Outfit, { foreignKey: 'outfit_id', as: 'outfit' });
  Post.hasMany(Like, { foreignKey: 'post_id', as: 'likes' });
  Post.hasMany(Comment, { foreignKey: 'post_id', as: 'comments' });

  // Like associations
  Like.belongsTo(UserProfile, { foreignKey: 'user_id', as: 'user' });
  Like.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
  Like.belongsTo(Outfit, { foreignKey: 'outfit_id', as: 'outfit' });
  Like.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

  // Comment associations
  Comment.belongsTo(UserProfile, { foreignKey: 'user_id', as: 'user' });
  Comment.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
  Comment.belongsTo(Outfit, { foreignKey: 'outfit_id', as: 'outfit' });
  Comment.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });
  Comment.belongsTo(Comment, { foreignKey: 'parent_comment_id', as: 'parent' });
  Comment.hasMany(Comment, { foreignKey: 'parent_comment_id', as: 'replies' });

  // Order associations
  Order.belongsTo(UserProfile, { foreignKey: 'buyer_id', as: 'buyer' });
  Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });

  // OrderItem associations
  OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
  OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
  OrderItem.belongsTo(UserProfile, { foreignKey: 'seller_id', as: 'seller' });

  console.log('✅ Todas las asociaciones de modelos configuradas');
};