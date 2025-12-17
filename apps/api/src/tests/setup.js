// Setup file for Jest tests
// Este archivo se ejecuta antes de que Jest inicialice el framework de testing

// Configurar variables de entorno para tests
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/clothi_test';

// Aumentar el timeout global para tests que hacen queries a BD
jest.setTimeout(10000);
