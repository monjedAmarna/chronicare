import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { medicationCreateValidation, medicationUpdateValidation } from '../validators/medication.validator.js';
import { createMedication, getMedications, updateMedication, deleteMedication, getMedicationById } from '../controllers/medication.controller.js';

const router = express.Router();

router.post('/', authMiddleware, medicationCreateValidation, createMedication);
router.get('/', authMiddleware, getMedications);
router.get('/:id', authMiddleware, getMedicationById);
router.put('/:id', authMiddleware, medicationUpdateValidation, updateMedication);
router.delete('/:id', authMiddleware, deleteMedication);

export default router; 