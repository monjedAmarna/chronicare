import { jest } from '@jest/globals';

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key';
process.env.DB_HOST = 'localhost';
process.env.DB_USER = 'test';
process.env.DB_PASS = 'test';
process.env.DB_NAME = 'chronicare_test';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test timeout
jest.setTimeout(10000);

// Mock Sequelize
jest.mock('../models/index.js', () => ({
  User: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  HealthMetric: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  Medication: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  Appointment: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  Alert: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  CarePlan: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  Report: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
}));

// Mock JWT
jest.mock('../utils/jwt.js', () => ({
  generateToken: jest.fn(() => 'mock-jwt-token'),
  verifyToken: jest.fn(() => ({ userId: 1, role: 'patient' })),
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(() => 'hashed-password'),
  compare: jest.fn(() => true),
})); 