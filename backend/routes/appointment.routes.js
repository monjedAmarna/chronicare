import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import { appointmentCreateValidation } from '../validators/appointment.validator.js';
import { createAppointment, getAppointments, deleteAppointment, updateAppointment } from '../controllers/appointment.controller.js';

const router = express.Router();

router.post('/', authMiddleware, appointmentCreateValidation, createAppointment);
// GET /api/appointments: admin, patient, and doctor can view (controller filters by role)
router.get('/', authMiddleware, roleMiddleware(['admin', 'patient', 'doctor']), getAppointments);
router.put('/:id', authMiddleware, updateAppointment);
router.delete('/:id', authMiddleware, deleteAppointment);

export default router; 