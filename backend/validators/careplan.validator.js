import { body } from 'express-validator';

export const createCarePlanValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('medications').optional().isArray().withMessage('Medications must be an array'),
  body('dietPlan').optional().isString().withMessage('Diet plan must be a string'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
  body('patientId').isInt().withMessage('Patient ID must be a valid integer'),
];

export const updateCarePlanValidation = [
  body('title').optional().isString().withMessage('Title must be a string'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('medications').optional().isArray().withMessage('Medications must be an array'),
  body('dietPlan').optional().isString().withMessage('Diet plan must be a string'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
]; 