// Enums reutilizables en toda la aplicación
const ProductType = {
  DIGITAL: 'digital',
  PHYSICAL: 'physical',
  BOTH: 'both'
};

const ProductStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
  SOLD_OUT: 'sold_out'
};

const OutfitVisibility = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  UNLISTED: 'unlisted'
};

const PostVisibility = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  FOLLOWERS: 'followers'
};

const OrderStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

const PaymentStatus = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

const AssetType = {
  IMAGE: 'image',
  TEXTURE: 'texture',
  MATERIAL: 'material',
  THUMBNAIL: 'thumbnail'
};

module.exports = {
  ProductType,
  ProductStatus,
  OutfitVisibility,
  PostVisibility,
  OrderStatus,
  PaymentStatus,
  AssetType
};