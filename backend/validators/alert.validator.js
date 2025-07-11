import { body } from 'express-validator';

export const createAlertValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('message').notEmpty().withMessage('Message is required'),
  body('userId').isInt().withMessage('User ID must be a valid integer'),
  body('type').notEmpty().withMessage('Type is required'),
];

export const updateAlertValidation = [
  body('title').optional().isString().withMessage('Title must be a string'),
  body('message').optional().isString().withMessage('Message must be a string'),
  body('type').optional().isString().withMessage('Type must be a string'),
]; 