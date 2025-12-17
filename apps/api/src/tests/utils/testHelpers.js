/**
 * Test Helpers and Utilities
 * Reusable functions for testing
 */

const { v4: uuidv4 } = require('uuid');

/**
 * Generate mock product data
 */
const generateMockProduct = (overrides = {}) => ({
  id: uuidv4(),
  name: 'Test Product',
  description: 'A test product description',
  price: 99.99,
  product_type: 'physical',
  status: 'available',
  user_id: uuidv4(),
  category_id: uuidv4(),
  like_count: 0,
  comment_count: 0,
  share_count: 0,
  view_count: 0,
  average_rating: 0,
  rating_count: 0,
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

/**
 * Generate mock user data
 */
const generateMockUser = (overrides = {}) => ({
  id: uuidv4(),
  email: `user-${Date.now()}@test.com`,
  username: `user-${Date.now()}`,
  first_name: 'Test',
  last_name: 'User',
  avatar_url: 'https://example.com/avatar.jpg',
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

/**
 * Generate mock like data
 */
const generateMockLike = (overrides = {}) => ({
  id: uuidv4(),
  user_id: uuidv4(),
  product_id: uuidv4(),
  created_at: new Date(),
  ...overrides,
});

/**
 * Generate mock comment data
 */
const generateMockComment = (overrides = {}) => ({
  id: uuidv4(),
  content: 'Great product!',
  user_id: uuidv4(),
  product_id: uuidv4(),
  parent_comment_id: null,
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

/**
 * Generate mock rating data
 */
const generateMockRating = (overrides = {}) => ({
  id: uuidv4(),
  score: 5,
  review: 'Excellent product!',
  user_id: uuidv4(),
  product_id: uuidv4(),
  helpful_count: 0,
  unhelpful_count: 0,
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

/**
 * Generate mock share data
 */
const generateMockShare = (overrides = {}) => ({
  id: uuidv4(),
  user_id: uuidv4(),
  product_id: uuidv4(),
  shared_to: 'whatsapp',
  shared_with_user_id: null,
  message: null,
  created_at: new Date(),
  ...overrides,
});

/**
 * Create mock request object for Express tests
 */
const createMockRequest = (overrides = {}) => ({
  params: {},
  query: {},
  body: {},
  headers: {},
  user: { id: uuidv4() },
  ...overrides,
});

/**
 * Create mock response object for Express tests
 */
const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  res.header = jest.fn().mockReturnValue(res);
  res.set = jest.fn().mockReturnValue(res);
  return res;
};

/**
 * Create mock next function
 */
const createMockNext = () => jest.fn();

/**
 * Verify successful response
 */
const verifySuccessResponse = (mockRes, expectedStatus = 200, expectedData = null) => {
  expect(mockRes.status).toHaveBeenCalledWith(expectedStatus);
  
  const callArgs = mockRes.json.mock.calls[0][0];
  expect(callArgs).toHaveProperty('success', true);
  
  if (expectedData !== null) {
    expect(callArgs.data).toEqual(expectedData);
  }
};

/**
 * Verify error response
 */
const verifyErrorResponse = (mockRes, expectedStatus = 400, expectedMessage = null) => {
  expect(mockRes.status).toHaveBeenCalledWith(expectedStatus);
  
  const callArgs = mockRes.json.mock.calls[0][0];
  expect(callArgs).toHaveProperty('success', false);
  
  if (expectedMessage !== null) {
    expect(callArgs.message).toContain(expectedMessage);
  }
};

/**
 * Create database mock
 */
const createDatabaseMock = () => ({
  Product: {
    findByPk: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    count: jest.fn(),
    increment: jest.fn(),
    decrement: jest.fn(),
  },
  UserProfile: {
    findByPk: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
  },
  Like: {
    create: jest.fn(),
    destroy: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    count: jest.fn(),
  },
  Comment: {
    create: jest.fn(),
    findByPk: jest.fn(),
    destroy: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
  },
  Rating: {
    create: jest.fn(),
    findByPk: jest.fn(),
    destroy: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    max: jest.fn(),
    min: jest.fn(),
  },
  Share: {
    create: jest.fn(),
    findAll: jest.fn(),
    count: jest.fn(),
  },
});

/**
 * Test pagination parameters
 */
const testPaginationParams = {
  page: 1,
  limit: 10,
  offset: 0,
};

/**
 * Test filter parameters
 */
const testFilterParams = {
  search: 'test',
  minPrice: 0,
  maxPrice: 1000,
  category: 'electronics',
  status: 'available',
  tags: ['tag1', 'tag2'],
  brands: ['brand1', 'brand2'],
  sortBy: 'created_at',
  sortOrder: 'DESC',
};

/**
 * Test product creation data
 */
const testProductData = {
  name: 'Test Product',
  description: 'A test product for unit tests',
  price: 99.99,
  product_type: 'physical',
  status: 'available',
  category_id: uuidv4(),
};

/**
 * Test comment data
 */
const testCommentData = {
  content: 'This is a test comment',
  parentCommentId: null,
};

/**
 * Test rating data
 */
const testRatingData = {
  score: 5,
  review: 'Excellent product! Highly recommended.',
};

/**
 * Test share data
 */
const testShareData = {
  shared_to: 'whatsapp',
  message: 'Check out this amazing product!',
};

/**
 * Verify mock was called with specific arguments
 */
const verifyMockCall = (mockFn, expectedArgs) => {
  expect(mockFn).toHaveBeenCalled();
  const actualArgs = mockFn.mock.calls[0];
  expect(actualArgs).toEqual(expect.arrayContaining(expectedArgs));
};

/**
 * Sleep for testing async operations
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
  generateMockProduct,
  generateMockUser,
  generateMockLike,
  generateMockComment,
  generateMockRating,
  generateMockShare,
  createMockRequest,
  createMockResponse,
  createMockNext,
  verifySuccessResponse,
  verifyErrorResponse,
  createDatabaseMock,
  testPaginationParams,
  testFilterParams,
  testProductData,
  testCommentData,
  testRatingData,
  testShareData,
  verifyMockCall,
  sleep,
};
