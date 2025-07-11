import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import { createCarePlanValidation, updateCarePlanValidation } from '../validators/careplan.validator.js';
import { getAllCarePlans, createCarePlan, getCarePlanById, updateCarePlan, deleteCarePlan } from '../controllers/careplan.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/care-plans: allow admin, doctor, and patient to view care plans
// Only these roles can access this route
router.get('/', roleMiddleware(['admin', 'doctor', 'patient']), getAllCarePlans);

// POST /api/care-plans: only admin and doctor can create
router.post('/', roleMiddleware(['admin', 'doctor']), createCarePlanValidation, createCarePlan);

// GET /api/care-plans/:id: allow admin, doctor, and patient to view a specific care plan
router.get('/:id', roleMiddleware(['admin', 'doctor', 'patient']), getCarePlanById);

// PUT /api/care-plans/:id: only admin and doctor can update
router.put('/:id', roleMiddleware(['admin', 'doctor']), updateCarePlanValidation, updateCarePlan);

// DELETE /api/care-plans/:id: only admin and doctor can delete
router.delete('/:id', roleMiddleware(['admin', 'doctor']), deleteCarePlan);

export default router; 