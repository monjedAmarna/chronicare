import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';
import { User } from '../../models/index.js';
import bcrypt from 'bcryptjs';
import jwt from '../../utils/jwt.js';

describe('Auth Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'patient'
      };

      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        id: 1,
        ...userData,
        password: 'hashed-password'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: userData.email } });
      expect(User.create).toHaveBeenCalled();
    });

    it('should return error if user already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'patient'
      };

      User.findOne.mockResolvedValue({ id: 1, email: userData.email });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User already exists');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/signin', () => {
    it('should sign in user successfully', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        id: 1,
        email: credentials.email,
        password: 'hashed-password',
        firstName: 'John',
        lastName: 'Doe',
        role: 'patient'
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.generateToken.mockReturnValue('mock-jwt-token');

      const response = await request(app)
        .post('/api/auth/signin')
        .send(credentials)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBe('mock-jwt-token');
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: credentials.email } });
      expect(bcrypt.compare).toHaveBeenCalledWith(credentials.password, mockUser.password);
      expect(jwt.generateToken).toHaveBeenCalledWith({ userId: 1, role: 'patient' });
    });

    it('should return error for invalid credentials', async () => {
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      };

      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/signin')
        .send(credentials)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return error for incorrect password', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const mockUser = {
        id: 1,
        email: credentials.email,
        password: 'hashed-password'
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/signin')
        .send(credentials)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return user profile with valid token', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'patient',
        dateOfBirth: '1990-01-01',
        phone: '1234567890',
        address: '123 Main St'
      };

      jwt.verifyToken.mockReturnValue({ userId: 1 });
      User.findByPk.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockUser);
      expect(jwt.verifyToken).toHaveBeenCalledWith('valid-token');
      expect(User.findByPk).toHaveBeenCalledWith(1);
    });

    it('should return error without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('No token provided');
    });

    it('should return error with invalid token', async () => {
      jwt.verifyToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid token');
    });

    it('should return error if user not found', async () => {
      jwt.verifyToken.mockReturnValue({ userId: 999 });
      User.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer valid-token')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });
  });

  describe('PUT /api/auth/profile', () => {
    it('should update user profile successfully', async () => {
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '9876543210'
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'patient'
      };

      const updatedUser = {
        ...mockUser,
        ...updateData
      };

      jwt.verifyToken.mockReturnValue({ userId: 1 });
      User.findByPk.mockResolvedValue(mockUser);
      User.update.mockResolvedValue([1]);
      User.findByPk.mockResolvedValueOnce(updatedUser);

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', 'Bearer valid-token')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Profile updated successfully');
      expect(response.body.data).toEqual(updatedUser);
      expect(User.update).toHaveBeenCalledWith(updateData, { where: { id: 1 } });
    });

    it('should return error if user not found', async () => {
      const updateData = {
        firstName: 'Jane'
      };

      jwt.verifyToken.mockReturnValue({ userId: 999 });
      User.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', 'Bearer valid-token')
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });
  });

  describe('POST /api/auth/signout', () => {
    it('should return success message for signout', async () => {
      const response = await request(app)
        .post('/api/auth/signout')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logged out successfully');
    });
  });
}); 