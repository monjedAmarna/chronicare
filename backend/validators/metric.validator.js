import { body } from 'express-validator';

export const metricCreateValidation = [
  body('glucoseLevel').optional().isFloat().withMessage('Glucose level must be a number'),
  body('bloodPressure').optional().isString().withMessage('Blood pressure must be a string'),
  body('weight').optional().isFloat().withMessage('Weight must be a number'),
  body('timestamp').notEmpty().isISO8601().toDate().withMessage('Timestamp must be a valid date'),
];

export const metricUpdateValidation = [
  body('glucoseLevel').optional().isFloat().withMessage('Glucose level must be a number'),
  body('bloodPressure').optional().isString().withMessage('Blood pressure must be a string'),
  body('weight').optional().isFloat().withMessage('Weight must be a number'),
  body('timestamp').optional().isISO8601().toDate().withMessage('Timestamp must be a valid date'),
]; 