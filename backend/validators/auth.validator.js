import { body } from 'express-validator';

export const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'doctor', 'patient']).withMessage('Invalid role'),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const profileUpdateValidation = [
  body('firstName').optional().isString().withMessage('First name must be a string'),
  body('lastName').optional().isString().withMessage('Last name must be a string'),
  body('phone').optional().isString().withMessage('Phone must be a string'),
  body('gender').optional().isString().withMessage('Gender must be a string'),
  body('dateOfBirth').optional().isISO8601().toDate().withMessage('Date of birth must be a valid date'),
  body('address').optional().isString().withMessage('Address must be a string'),
  body('profileImageUrl').optional().isString().withMessage('Profile image URL must be a string'),
  body('name').optional().isString().withMessage('Name must be a string'),
]; 