import { jest } from '@jest/globals';
import { 
  getHealthData, 
  exportReport, 
  getStats 
} from '../../controllers/reports.controller.js';
import { HealthMetric, User, Appointment, Medication, Alert } from '../../models/index.js';
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
  res.set = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe('Reports Controller Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getHealthData', () => {
    it('should return health data for patient successfully', async () => {
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

      await getHealthData(req, res);

      expect(jwt.verifyToken).toHaveBeenCalledWith('mock-token');
      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(HealthMetric.findAll).toHaveBeenCalledWith({
        where: { userId: 1 },
        order: [['recordedAt', 'DESC']],
        limit: 30
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          metrics: mockMetrics,
          summary: {
            totalMetrics: 2,
            latestBloodPressure: '120/80',
            latestWeight: '70'
          }
        }
      });
    });

    it('should return error for invalid user', async () => {
      const req = mockRequest({}, {}, {}, { authorization: 'Bearer mock-token' });
      const res = mockResponse();

      jwt.verifyToken.mockReturnValue({ userId: 999 });
      User.findByPk.mockResolvedValue(null);

      await getHealthData(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found'
      });
    });

    it('should handle database errors', async () => {
      const req = mockRequest({}, {}, {}, { authorization: 'Bearer mock-token' });
      const res = mockResponse();

      jwt.verifyToken.mockReturnValue({ userId: 1 });
      User.findByPk.mockResolvedValue({ id: 1, role: 'patient' });
      HealthMetric.findAll.mockRejectedValue(new Error('Database error'));

      await getHealthData(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error'
      });
    });
  });

  describe('exportReport', () => {
    it('should export PDF report successfully', async () => {
      const req = mockRequest({}, { format: 'pdf' }, {}, { authorization: 'Bearer mock-token' });
      const res = mockResponse();

      const mockUser = { id: 1, role: 'patient', firstName: 'John', lastName: 'Doe' };
      const mockMetrics = [
        {
          id: 1,
          userId: 1,
          type: 'blood_pressure',
          value: '120/80',
          unit: 'mmHg',
          recordedAt: '2024-01-15T10:00:00Z'
        }
      ];

      jwt.verifyToken.mockReturnValue({ userId: 1 });
      User.findByPk.mockResolvedValue(mockUser);
      HealthMetric.findAll.mockResolvedValue(mockMetrics);

      await exportReport(req, res);

      expect(jwt.verifyToken).toHaveBeenCalledWith('mock-token');
      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(HealthMetric.findAll).toHaveBeenCalledWith({
        where: { userId: 1 },
        order: [['recordedAt', 'DESC']]
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.set).toHaveBeenCalledWith({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="health-report.pdf"'
      });
    });

    it('should export CSV report successfully', async () => {
      const req = mockRequest({}, { format: 'csv' }, {}, { authorization: 'Bearer mock-token' });
      const res = mockResponse();

      const mockUser = { id: 1, role: 'patient', firstName: 'John', lastName: 'Doe' };
      const mockMetrics = [
        {
          id: 1,
          userId: 1,
          type: 'blood_pressure',
          value: '120/80',
          unit: 'mmHg',
          recordedAt: '2024-01-15T10:00:00Z'
        }
      ];

      jwt.verifyToken.mockReturnValue({ userId: 1 });
      User.findByPk.mockResolvedValue(mockUser);
      HealthMetric.findAll.mockResolvedValue(mockMetrics);

      await exportReport(req, res);

      expect(jwt.verifyToken).toHaveBeenCalledWith('mock-token');
      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(HealthMetric.findAll).toHaveBeenCalledWith({
        where: { userId: 1 },
        order: [['recordedAt', 'DESC']]
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.set).toHaveBeenCalledWith({
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="health-report.csv"'
      });
    });

    it('should return error for unsupported format', async () => {
      const req = mockRequest({}, { format: 'xml' }, {}, { authorization: 'Bearer mock-token' });
      const res = mockResponse();

      jwt.verifyToken.mockReturnValue({ userId: 1 });
      User.findByPk.mockResolvedValue({ id: 1, role: 'patient' });

      await exportReport(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unsupported export format'
      });
    });

    it('should return error for invalid user', async () => {
      const req = mockRequest({}, { format: 'pdf' }, {}, { authorization: 'Bearer mock-token' });
      const res = mockResponse();

      jwt.verifyToken.mockReturnValue({ userId: 999 });
      User.findByPk.mockResolvedValue(null);

      await exportReport(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found'
      });
    });
  });

  describe('getStats', () => {
    it('should return stats for admin successfully', async () => {
      const req = mockRequest({}, {}, {}, { authorization: 'Bearer mock-token' });
      const res = mockResponse();

      const mockUser = { id: 1, role: 'admin' };
      const mockUsers = [
        { id: 1, role: 'admin' },
        { id: 2, role: 'doctor' },
        { id: 3, role: 'patient' },
        { id: 4, role: 'patient' }
      ];

      jwt.verifyToken.mockReturnValue({ userId: 1 });
      User.findByPk.mockResolvedValue(mockUser);
      User.findAll.mockResolvedValue(mockUsers);
      User.count.mockResolvedValue(4);
      Appointment.count.mockResolvedValue(10);
      Medication.count.mockResolvedValue(25);
      Alert.count.mockResolvedValue(5);

      await getStats(req, res);

      expect(jwt.verifyToken).toHaveBeenCalledWith('mock-token');
      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(User.count).toHaveBeenCalled();
      expect(Appointment.count).toHaveBeenCalled();
      expect(Medication.count).toHaveBeenCalled();
      expect(Alert.count).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          totalUsers: 4,
          totalAppointments: 10,
          totalMedications: 25,
          totalAlerts: 5,
          usersByRole: {
            admin: 1,
            doctor: 1,
            patient: 2
          }
        }
      });
    });

    it('should return error for non-admin user', async () => {
      const req = mockRequest({}, {}, {}, { authorization: 'Bearer mock-token' });
      const res = mockResponse();

      jwt.verifyToken.mockReturnValue({ userId: 2 });
      User.findByPk.mockResolvedValue({ id: 2, role: 'patient' });

      await getStats(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    });

    it('should handle database errors', async () => {
      const req = mockRequest({}, {}, {}, { authorization: 'Bearer mock-token' });
      const res = mockResponse();

      jwt.verifyToken.mockReturnValue({ userId: 1 });
      User.findByPk.mockResolvedValue({ id: 1, role: 'admin' });
      User.count.mockRejectedValue(new Error('Database error'));

      await getStats(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error'
      });
    });
  });
}); 