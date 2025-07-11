import { body } from 'express-validator';

export const appointmentCreateValidation = [
  body('doctorId').notEmpty().isInt().withMessage('Doctor ID is required'),
  body('patientId').notEmpty().isInt().withMessage('Patient ID is required'),
  body('date').notEmpty().isISO8601().toDate().withMessage('Date is required and must be valid'),
  body('time').notEmpty().isString().withMessage('Time is required'),
]; 