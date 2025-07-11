import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import { createPatientValidation, updatePatientValidation } from '../validators/patient.validator.js';
import { getAllPatients, createPatient, getPatientById, updatePatient, deletePatient, getAssignedPatients } from '../controllers/patient.controller.js';

const router = express.Router();

// All routes require admin or doctor role
router.use(authMiddleware);
router.use(roleMiddleware(['admin', 'doctor']));

// Patient management routes
router.get('/', getAllPatients);
router.get('/assigned', roleMiddleware(['doctor']), getAssignedPatients);
router.post('/', createPatientValidation, createPatient);
router.get('/:id', getPatientById);
router.put('/:id', updatePatientValidation, updatePatient);
router.delete('/:id', deletePatient);

export default router; 