import { jest } from '@jest/globals';
import { 
  createMedication, 
  getMedications, 
  getMedication, 
  updateMedication, 
  deleteMedication 
} from '../../controllers/medication.controller.js';
import { Medication, User } from '../../models/index.js';
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

describe('Medication Controller Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createMedication', () => {
    it('should create a new medication successfully', async () => {
      const req = mockRequest({
        name: 'Aspirin',
        dosage: '100mg',
        frequency: 'daily',
        instructions: 'Take with food',
        isActive: true,
        times: ['08:00', '20:00']
      }, {}, {}, { authorization: 'Bearer mock-token' });
      const res = mockResponse();

      const mockUser = { id: 1, role: 'patient' };
      const mockMedication = {
        id: 1,
        userId: 1,
        name: 'Aspirin',
        dosage: '100mg',
        frequency: 'daily',
        instructions: 'Take with food',
        isActive: true,
        times: ['08:00', '20:00']
      };

      jwt.verifyToken.mockReturnValue({ userId: 1 });
      User.findByPk.mockResolvedValue(mockUser);
      Medication.create.mockResolvedValue(mockMedication);

      await createMedication(req, res);

      expect(jwt.verifyToken).toHaveBeenCalledWith('mock-token');
      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(Medication.create).toHaveBeenCalledWith({
        userId: 1,
        name: 'Aspirin',
        dosage: '100mg',
        frequency: 'daily',
        instructions: 'Take with food',
        isActive: true,
        times: ['08:00', '20:00']
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Medication created successfully',
        data: mockMedication
      });
    });

    it('should return error for invalid user', async () => {
      const req = mockRequest({
        name: 'Aspirin',
        dosage: '100mg'
      }, {}, {}, { authorization: 'Bearer mock-token' });
      const res = mockResponse();

      jwt.verifyToken.mockReturnValue({ userId: 999 });
      User.findByPk.mockResolvedValue(null);

      await createMedication(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found'
      });
    });

    it('should handle database errors', async () => {
      const req = mockRequest({
        name: 'Aspirin',
        dosage: '100mg'
      }, {}, {}, { authorization: 'Bearer mock-token' });
      const res = mockResponse();

      jwt.verifyToken.mockReturnValue({ userId: 1 });
      User.findByPk.mockResolvedValue({ id: 1, role: 'patient' });
      Medication.create.mockRejectedValue(new Error('Database error'));

      await createMedication(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error'
      });
    });
  });

  describe('getMedications', () => {
    it('should return user medications successfully', async () => {
      const req = mockRequest({}, {}, {}, { authorization: 'Bearer mock-token' });
      const res = mockResponse();

      const mockUser = { id: 1, role: 'patient' };
      const mockMedications = [
        {
          id: 1,
          userId: 1,
          name: 'Aspirin',
          dosage: '100mg',
          frequency: 'daily',
          instructions: 'Take with food',
          isActive: true,
          times: ['08:00', '20:00']
        },
        {
          id: 2,
          userId: 1,
          name: 'Vitamin D',
          dosage: '1000IU',
          frequency: 'daily',
          instructions: 'Take in morning',
          isActive: true,
          times: ['09:00']
        }
      ];

      jwt.verifyToken.mockReturnValue({ userId: 1 });
      User.findByPk.mockResolvedValue(mockUser);
      Medication.findAll.mockResolvedValue(mockMedications);

      await getMedications(req, res);

      expect(jwt.verifyToken).toHaveBeenCalledWith('mock-token');
      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(Medication.findAll).toHaveBeenCalledWith({
        where: { userId: 1 },
        order: [['createdAt', 'DESC']]
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockMedications
      });
    });

    it('should return empty array when no medications found', async () => {
      const req = mockRequest({}, {}, {}, { authorization: 'Bearer mock-token' });
      const res = mockResponse();

      jwt.verifyToken.mockReturnValue({ userId: 1 });
      User.findByPk.mockResolvedValue({ id: 1, role: 'patient' });
      Medication.findAll.mockResolvedValue([]);

      await getMedications(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: []
      });
    });
  });

  describe('getMedication', () => {
    it('should return single medication successfully', async () => {
      const req = mockRequest({}, { id: '1' }, {}, { authorization: 'Bearer mock-token' });
      const res = mockResponse();

      const mockUser = { id: 1, role: 'patient' };
      const mockMedication = {
        id: 1,
        userId: 1,
        name: 'Aspirin',
        dosage: '100mg',
        frequency: 'daily',
        instructions: 'Take with food',
        isActive: true,
        times: ['08:00', '20:00']
      };

      jwt.verifyToken.mockReturnValue({ userId: 1 });
      User.findByPk.mockResolvedValue(mockUser);
      Medication.findOne.mockResolvedValue(mockMedication);

      await getMedication(req, res);

      expect(jwt.verifyToken).toHaveBeenCalledWith('mock-token');
      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(Medication.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockMedication
      });
    });

    it('should return error if medication not found', async () => {
      const req = mockRequest({}, { id: '999' }, {}, { authorization: 'Bearer mock-token' });
      const res = mockResponse();

      jwt.verifyToken.mockReturnValue({ userId: 1 });
      User.findByPk.mockResolvedValue({ id: 1, role: 'patient' });
      Medication.findOne.mockResolvedValue(null);

      await getMedication(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Medication not found'
      });
    });
  });

  describe('updateMedication', () => {
    it('should update medication successfully', async () => {
      const req = mockRequest({
        dosage: '150mg',
        frequency: 'twice daily',
        isActive: false
      }, { id: '1' }, {}, { authorization: 'Bearer mock-token' });
      const res = mockResponse();

      const mockUser = { id: 1, role: 'patient' };
      const mockMedication = {
        id: 1,
        userId: 1,
        name: 'Aspirin',
        dosage: '100mg',
        frequency: 'daily',
        instructions: 'Take with food',
        isActive: true,
        times: ['08:00', '20:00']
      };

      const updatedMedication = {
        ...mockMedication,
        dosage: '150mg',
        frequency: 'twice daily',
        isActive: false
      };

      jwt.verifyToken.mockReturnValue({ userId: 1 });
      User.findByPk.mockResolvedValue(mockUser);
      Medication.findOne.mockResolvedValue(mockMedication);
      Medication.update.mockResolvedValue([1]);
      Medication.findOne.mockResolvedValueOnce(updatedMedication);

      await updateMedication(req, res);

      expect(jwt.verifyToken).toHaveBeenCalledWith('mock-token');
      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(Medication.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 }
      });
      expect(Medication.update).toHaveBeenCalledWith(
        {
          dosage: '150mg',
          frequency: 'twice daily',
          isActive: false
        },
        { where: { id: 1, userId: 1 } }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Medication updated successfully',
        data: updatedMedication
      });
    });

    it('should return error if medication not found for update', async () => {
      const req = mockRequest({
        dosage: '150mg'
      }, { id: '999' }, {}, { authorization: 'Bearer mock-token' });
      const res = mockResponse();

      jwt.verifyToken.mockReturnValue({ userId: 1 });
      User.findByPk.mockResolvedValue({ id: 1, role: 'patient' });
      Medication.findOne.mockResolvedValue(null);

      await updateMedication(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Medication not found'
      });
    });
  });

  describe('deleteMedication', () => {
    it('should delete medication successfully', async () => {
      const req = mockRequest({}, { id: '1' }, {}, { authorization: 'Bearer mock-token' });
      const res = mockResponse();

      const mockUser = { id: 1, role: 'patient' };
      const mockMedication = {
        id: 1,
        userId: 1,
        name: 'Aspirin',
        dosage: '100mg',
        frequency: 'daily',
        instructions: 'Take with food',
        isActive: true,
        times: ['08:00', '20:00']
      };

      jwt.verifyToken.mockReturnValue({ userId: 1 });
      User.findByPk.mockResolvedValue(mockUser);
      Medication.findOne.mockResolvedValue(mockMedication);
      Medication.destroy.mockResolvedValue(1);

      await deleteMedication(req, res);

      expect(jwt.verifyToken).toHaveBeenCalledWith('mock-token');
      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(Medication.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 }
      });
      expect(Medication.destroy).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Medication deleted successfully'
      });
    });

    it('should return error if medication not found for deletion', async () => {
      const req = mockRequest({}, { id: '999' }, {}, { authorization: 'Bearer mock-token' });
      const res = mockResponse();

      jwt.verifyToken.mockReturnValue({ userId: 1 });
      User.findByPk.mockResolvedValue({ id: 1, role: 'patient' });
      Medication.findOne.mockResolvedValue(null);

      await deleteMedication(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Medication not found'
      });
    });
  });
}); 