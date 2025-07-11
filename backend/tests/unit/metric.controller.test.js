import { jest } from '@jest/globals';
import { 
  createMetric, 
  getMetrics, 
  getMetric, 
  updateMetric, 
  deleteMetric 
} from '../../controllers/metric.controller.js';
import { HealthMetric, User } from '../../models/index.js';
import jwt from '../../utils/jwt.js';

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

describe('Metric Controller Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createMetric', () => {
    it('should create a new health metric successfully', async () => {
      const req = mockRequest({
        type: 'blood_pressure',
        value: '120/80',
        unit: 'mmHg',
        recordedAt: '2024-01-15T10:00:00Z'
      }, {}, {}, { authorization: 'Bearer mock-token' });
      const res = mockResponse();

      const mockUser = { id: 1, role: 'patient' };
      const mockMetric = {
        id: 1,
        userId: 1,
        type: 'blood_pressure',
        value: '120/80',
        unit: 'mmHg',
        recordedAt: '2024-01-15T10:00:00Z'
      };

      jwt.verifyToken.mockReturnValue({ userId: 1 });
      User.findByPk.mockResolvedValue(mockUser);
      HealthMetric.create.mockResolvedValue(mockMetric);

      await createMetric(req, res);

      expect(jwt.verifyToken).toHaveBeenCalledWith('mock-token');
      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(HealthMetric.create).toHaveBeenCalledWith({
        userId: 1,
        type: 'blood_pressure',
        value: '120/80',
        unit: 'mmHg',
        recordedAt: '2024-01-15T10:00:00Z'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Health metric created successfully',
        data: mockMetric
      });
    });

    it('should return error for invalid user', async () => {
      const req = mockRequest({
        type: 'blood_pressure',
        value: '120/80'
      }, {}, {}, { authorization: 'Bearer mock-token' });
      const res = mockResponse();

      jwt.verifyToken.mockReturnValue({ userId: 999 });
      User.findByPk.mockResolvedValue(null);

      await createMetric(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found'
      });
    });

    it('should handle database errors', async () => {
      const req = mockRequest({
        type: 'blood_pressure',
        value: '120/80'
      }, {}, {}, { authorization: 'Bearer mock-token' });
      const res = mockResponse();

      jwt.verifyToken.mockReturnValue({ userId: 1 });
      User.findByPk.mockResolvedValue({ id: 1, role: 'patient' });
      HealthMetric.create.mockRejectedValue(new Error('Database error'));

      await createMetric(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error'
      });
    });
  });

  describe('getMetrics', () => {
    it('should return user metrics successfully', async () => {
      const req = mockRequest({}, {}, {}, { authorization: 'Bearer mock-token' });
      const res = mockResponse();

      const mockUser = { id: 1, role: 'patient' };
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

      jwt.verifyToken.mockReturnValue({ userId: 1 });
      User.findByPk.mockResolvedValue(mockUser);
      HealthMetric.findAll.mockResolvedValue(mockMetrics);

      await getMetrics(req, res);

      expect(jwt.verifyToken).toHaveBeenCalledWith('mock-token');
      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(HealthMetric.findAll).toHaveBeenCalledWith({
        where: { userId: 1 },
        order: [['recordedAt', 'DESC']]
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockMetrics
      });
    });

    it('should return empty array when no metrics found', async () => {
      const req = mockRequest({}, {}, {}, { authorization: 'Bearer mock-token' });
      const res = mockResponse();

      jwt.verifyToken.mockReturnValue({ userId: 1 });
      User.findByPk.mockResolvedValue({ id: 1, role: 'patient' });
      HealthMetric.findAll.mockResolvedValue([]);

      await getMetrics(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: []
      });
    });
  });

  describe('getMetric', () => {
    it('should return single metric successfully', async () => {
      const req = mockRequest({}, { id: '1' }, {}, { authorization: 'Bearer mock-token' });
      const res = mockResponse();

      const mockUser = { id: 1, role: 'patient' };
      const mockMetric = {
        id: 1,
        userId: 1,
        type: 'blood_pressure',
        value: '120/80',
        unit: 'mmHg',
        recordedAt: '2024-01-15T10:00:00Z'
      };

      jwt.verifyToken.mockReturnValue({ userId: 1 });
      User.findByPk.mockResolvedValue(mockUser);
      HealthMetric.findOne.mockResolvedValue(mockMetric);

      await getMetric(req, res);

      expect(jwt.verifyToken).toHaveBeenCalledWith('mock-token');
      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(HealthMetric.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockMetric
      });
    });

    it('should return error if metric not found', async () => {
      const req = mockRequest({}, { id: '999' }, {}, { authorization: 'Bearer mock-token' });
      const res = mockResponse();

      jwt.verifyToken.mockReturnValue({ userId: 1 });
      User.findByPk.mockResolvedValue({ id: 1, role: 'patient' });
      HealthMetric.findOne.mockResolvedValue(null);

      await getMetric(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Health metric not found'
      });
    });
  });

  describe('updateMetric', () => {
    it('should update metric successfully', async () => {
      const req = mockRequest({
        value: '130/85',
        unit: 'mmHg'
      }, { id: '1' }, {}, { authorization: 'Bearer mock-token' });
      const res = mockResponse();

      const mockUser = { id: 1, role: 'patient' };
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
        value: '130/85',
        unit: 'mmHg'
      };

      jwt.verifyToken.mockReturnValue({ userId: 1 });
      User.findByPk.mockResolvedValue(mockUser);
      HealthMetric.findOne.mockResolvedValue(mockMetric);
      HealthMetric.update.mockResolvedValue([1]);
      HealthMetric.findOne.mockResolvedValueOnce(updatedMetric);

      await updateMetric(req, res);

      expect(jwt.verifyToken).toHaveBeenCalledWith('mock-token');
      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(HealthMetric.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 }
      });
      expect(HealthMetric.update).toHaveBeenCalledWith(
        {
          value: '130/85',
          unit: 'mmHg'
        },
        { where: { id: 1, userId: 1 } }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Health metric updated successfully',
        data: updatedMetric
      });
    });

    it('should return error if metric not found for update', async () => {
      const req = mockRequest({
        value: '130/85'
      }, { id: '999' }, {}, { authorization: 'Bearer mock-token' });
      const res = mockResponse();

      jwt.verifyToken.mockReturnValue({ userId: 1 });
      User.findByPk.mockResolvedValue({ id: 1, role: 'patient' });
      HealthMetric.findOne.mockResolvedValue(null);

      await updateMetric(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Health metric not found'
      });
    });
  });

  describe('deleteMetric', () => {
    it('should delete metric successfully', async () => {
      const req = mockRequest({}, { id: '1' }, {}, { authorization: 'Bearer mock-token' });
      const res = mockResponse();

      const mockUser = { id: 1, role: 'patient' };
      const mockMetric = {
        id: 1,
        userId: 1,
        type: 'blood_pressure',
        value: '120/80',
        unit: 'mmHg'
      };

      jwt.verifyToken.mockReturnValue({ userId: 1 });
      User.findByPk.mockResolvedValue(mockUser);
      HealthMetric.findOne.mockResolvedValue(mockMetric);
      HealthMetric.destroy.mockResolvedValue(1);

      await deleteMetric(req, res);

      expect(jwt.verifyToken).toHaveBeenCalledWith('mock-token');
      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(HealthMetric.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 }
      });
      expect(HealthMetric.destroy).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Health metric deleted successfully'
      });
    });

    it('should return error if metric not found for deletion', async () => {
      const req = mockRequest({}, { id: '999' }, {}, { authorization: 'Bearer mock-token' });
      const res = mockResponse();

      jwt.verifyToken.mockReturnValue({ userId: 1 });
      User.findByPk.mockResolvedValue({ id: 1, role: 'patient' });
      HealthMetric.findOne.mockResolvedValue(null);

      await deleteMetric(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Health metric not found'
      });
    });
  });
}); 