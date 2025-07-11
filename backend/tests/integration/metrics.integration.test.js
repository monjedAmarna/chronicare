import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';
import { HealthMetric, User } from '../../models/index.js';
import jwt from '../../utils/jwt.js';

describe('Health Metrics Integration Tests', () => {
  let authToken;
  let mockUser;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUser = {
      id: 1,
      email: 'patient@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'patient'
    };

    authToken = 'valid-jwt-token';
    jwt.verifyToken.mockReturnValue({ userId: 1 });
    User.findByPk.mockResolvedValue(mockUser);
  });

  describe('POST /api/metrics', () => {
    it('should create a new health metric successfully', async () => {
      const metricData = {
        type: 'blood_pressure',
        value: '120/80',
        unit: 'mmHg',
        recordedAt: '2024-01-15T10:00:00Z'
      };

      const mockMetric = {
        id: 1,
        userId: 1,
        ...metricData
      };

      HealthMetric.create.mockResolvedValue(mockMetric);

      const response = await request(app)
        .post('/api/metrics')
        .set('Authorization', `Bearer ${authToken}`)
        .send(metricData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Health metric created successfully');
      expect(response.body.data).toEqual(mockMetric);
      expect(HealthMetric.create).toHaveBeenCalledWith({
        userId: 1,
        ...metricData
      });
    });

    it('should return error for invalid user', async () => {
      User.findByPk.mockResolvedValue(null);

      const metricData = {
        type: 'blood_pressure',
        value: '120/80'
      };

      const response = await request(app)
        .post('/api/metrics')
        .set('Authorization', `Bearer ${authToken}`)
        .send(metricData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        type: '',
        value: ''
      };

      const response = await request(app)
        .post('/api/metrics')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should return error without authentication', async () => {
      const metricData = {
        type: 'blood_pressure',
        value: '120/80'
      };

      const response = await request(app)
        .post('/api/metrics')
        .send(metricData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('No token provided');
    });
  });

  describe('GET /api/metrics', () => {
    it('should return user metrics successfully', async () => {
      const mockMetrics = [
        {
          id: 1,
          userId: 1,
          type: 'blood_pressure',
          value: '120/80',
          unit: 'mmHg',
          recordedAt: '2024-01-15T10:00:00Z'
        },
        {
          id: 2,
          userId: 1,
          type: 'weight',
          value: '70',
          unit: 'kg',
          recordedAt: '2024-01-15T09:00:00Z'
        }
      ];

      HealthMetric.findAll.mockResolvedValue(mockMetrics);

      const response = await request(app)
        .get('/api/metrics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockMetrics);
      expect(HealthMetric.findAll).toHaveBeenCalledWith({
        where: { userId: 1 },
        order: [['recordedAt', 'DESC']]
      });
    });

    it('should return empty array when no metrics found', async () => {
      HealthMetric.findAll.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/metrics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should return error without authentication', async () => {
      const response = await request(app)
        .get('/api/metrics')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('No token provided');
    });
  });

  describe('GET /api/metrics/:id', () => {
    it('should return single metric successfully', async () => {
      const mockMetric = {
        id: 1,
        userId: 1,
        type: 'blood_pressure',
        value: '120/80',
        unit: 'mmHg',
        recordedAt: '2024-01-15T10:00:00Z'
      };

      HealthMetric.findOne.mockResolvedValue(mockMetric);

      const response = await request(app)
        .get('/api/metrics/1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockMetric);
      expect(HealthMetric.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 }
      });
    });

    it('should return error if metric not found', async () => {
      HealthMetric.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/metrics/999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Health metric not found');
    });

    it('should return error for invalid metric ID', async () => {
      const response = await request(app)
        .get('/api/metrics/invalid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid metric ID');
    });
  });

  describe('PUT /api/metrics/:id', () => {
    it('should update metric successfully', async () => {
      const updateData = {
        value: '130/85',
        unit: 'mmHg'
      };

      const mockMetric = {
        id: 1,
        userId: 1,
        type: 'blood_pressure',
        value: '120/80',
        unit: 'mmHg',
        recordedAt: '2024-01-15T10:00:00Z'
      };

      const updatedMetric = {
        ...mockMetric,
        ...updateData
      };

      HealthMetric.findOne.mockResolvedValue(mockMetric);
      HealthMetric.update.mockResolvedValue([1]);
      HealthMetric.findOne.mockResolvedValueOnce(updatedMetric);

      const response = await request(app)
        .put('/api/metrics/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Health metric updated successfully');
      expect(response.body.data).toEqual(updatedMetric);
      expect(HealthMetric.update).toHaveBeenCalledWith(updateData, { where: { id: 1, userId: 1 } });
    });

    it('should return error if metric not found for update', async () => {
      HealthMetric.findOne.mockResolvedValue(null);

      const updateData = {
        value: '130/85'
      };

      const response = await request(app)
        .put('/api/metrics/999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Health metric not found');
    });

    it('should validate update data', async () => {
      const invalidData = {
        value: ''
      };

      const response = await request(app)
        .put('/api/metrics/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('DELETE /api/metrics/:id', () => {
    it('should delete metric successfully', async () => {
      const mockMetric = {
        id: 1,
        userId: 1,
        type: 'blood_pressure',
        value: '120/80',
        unit: 'mmHg'
      };

      HealthMetric.findOne.mockResolvedValue(mockMetric);
      HealthMetric.destroy.mockResolvedValue(1);

      const response = await request(app)
        .delete('/api/metrics/1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Health metric deleted successfully');
      expect(HealthMetric.destroy).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 }
      });
    });

    it('should return error if metric not found for deletion', async () => {
      HealthMetric.findOne.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/metrics/999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Health metric not found');
    });

    it('should return error for invalid metric ID', async () => {
      const response = await request(app)
        .delete('/api/metrics/invalid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid metric ID');
    });
  });
}); 