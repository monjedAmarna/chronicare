import { jest } from '@jest/globals';
import { register, signin, getProfile, updateProfile, signout } from '../../controllers/auth.controller.js';
import { User } from '../../models/index.js';
import bcrypt from 'bcryptjs';
import jwt from '../../utils/jwt.js';

// Mock request and response objects
const mockRequest = (body = {}, params = {}, query = {}, headers = {}) => ({
  body,
  params,
  query,
  headers,
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Auth Controller Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const req = mockRequest({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'patient'
      });
      const res = mockResponse();

      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'patient'
      });

      await register(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(User.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'User registered successfully'
        })
      );
    });

    it('should return error if user already exists', async () => {
      const req = mockRequest({
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'patient'
      });
      const res = mockResponse();

      User.findOne.mockResolvedValue({ id: 1, email: 'existing@example.com' });

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User already exists'
      });
    });

    it('should handle database errors', async () => {
      const req = mockRequest({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'patient'
      });
      const res = mockResponse();

      User.findOne.mockRejectedValue(new Error('Database error'));

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error'
      });
    });
  });

  describe('signin', () => {
    it('should sign in user successfully', async () => {
      const req = mockRequest({
        email: 'test@example.com',
        password: 'password123'
      });
      const res = mockResponse();

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed-password',
        firstName: 'John',
        lastName: 'Doe',
        role: 'patient'
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.generateToken.mockReturnValue('mock-jwt-token');

      await signin(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
      expect(jwt.generateToken).toHaveBeenCalledWith({ userId: 1, role: 'patient' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Login successful',
          token: 'mock-jwt-token'
        })
      );
    });

    it('should return error for invalid credentials', async () => {
      const req = mockRequest({
        email: 'test@example.com',
        password: 'wrongpassword'
      });
      const res = mockResponse();

      User.findOne.mockResolvedValue(null);

      await signin(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid credentials'
      });
    });

    it('should return error for incorrect password', async () => {
      const req = mockRequest({
        email: 'test@example.com',
        password: 'wrongpassword'
      });
      const res = mockResponse();

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed-password'
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await signin(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid credentials'
      });
    });
  });

  describe('getProfile', () => {
    it('should return user profile successfully', async () => {
      const req = mockRequest({}, {}, {}, { authorization: 'Bearer mock-token' });
      const res = mockResponse();

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

      await getProfile(req, res);

      expect(jwt.verifyToken).toHaveBeenCalledWith('mock-token');
      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockUser
        })
      );
    });

    it('should return error if user not found', async () => {
      const req = mockRequest({}, {}, {}, { authorization: 'Bearer mock-token' });
      const res = mockResponse();

      jwt.verifyToken.mockReturnValue({ userId: 999 });
      User.findByPk.mockResolvedValue(null);

      await getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found'
      });
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      const req = mockRequest({
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '9876543210'
      }, {}, {}, { authorization: 'Bearer mock-token' });
      const res = mockResponse();

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'patient'
      };

      const updatedUser = {
        ...mockUser,
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '9876543210'
      };

      jwt.verifyToken.mockReturnValue({ userId: 1 });
      User.findByPk.mockResolvedValue(mockUser);
      User.update.mockResolvedValue([1]);
      User.findByPk.mockResolvedValueOnce(updatedUser);

      await updateProfile(req, res);

      expect(jwt.verifyToken).toHaveBeenCalledWith('mock-token');
      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(User.update).toHaveBeenCalledWith(
        {
          firstName: 'Jane',
          lastName: 'Smith',
          phone: '9876543210'
        },
        { where: { id: 1 } }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Profile updated successfully',
          data: updatedUser
        })
      );
    });

    it('should return error if user not found', async () => {
      const req = mockRequest({
        firstName: 'Jane'
      }, {}, {}, { authorization: 'Bearer mock-token' });
      const res = mockResponse();

      jwt.verifyToken.mockReturnValue({ userId: 999 });
      User.findByPk.mockResolvedValue(null);

      await updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found'
      });
    });
  });

  describe('signout', () => {
    it('should return success message for signout', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await signout(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logged out successfully'
      });
    });
  });
}); 