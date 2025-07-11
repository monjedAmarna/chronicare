import { body } from 'express-validator';

export const medicationCreateValidation = [
  body('name').notEmpty().isString().withMessage('Medication name is required'),
  body('dosage').notEmpty().isString().withMessage('Dosage is required'),
  body('frequency').notEmpty().isString().withMessage('Frequency is required'),
  body('startDate').notEmpty().isISO8601().toDate().withMessage('Start date must be a valid date'),
  body('endDate').optional().isISO8601().toDate().withMessage('End date must be a valid date'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
  body('patientId').optional().isInt().withMessage('Patient ID must be a valid integer'),
];

export const medicationUpdateValidation = [
  body('name').optional().isString().withMessage('Medication name must be a string'),
  body('dosage').optional().isString().withMessage('Dosage must be a string'),
  body('frequency').optional().isString().withMessage('Frequency must be a string'),
  body('startDate').optional().isISO8601().toDate().withMessage('Start date must be a valid date'),
  body('endDate').optional().isISO8601().toDate().withMessage('End date must be a valid date'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
]; 