import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import { createAlertValidation, updateAlertValidation } from '../validators/alert.validator.js';
import { getAlerts, createAlert, updateAlert, deleteAlert, markAlertAsRead } from '../controllers/alert.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET alerts: admin, doctor, and patient can view (controller filters by role)
router.get('/', getAlerts);

// PATCH /:id/read: allow all authenticated users (patients, doctors, admins)
router.patch('/:id/read', markAlertAsRead);

// POST, PUT, DELETE: Only admin and doctor can modify alerts
router.use(roleMiddleware(['admin', 'doctor']));
router.post('/', createAlertValidation, createAlert);
router.put('/:id', updateAlertValidation, updateAlert);
router.delete('/:id', deleteAlert);

export default router; 