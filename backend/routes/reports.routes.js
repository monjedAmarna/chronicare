import express from 'express';
import { generateHealthDataReport, exportHealthReport } from '../controllers/reports.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';

const router = express.Router();

// Only authenticated patients and admins can access these endpoints
router.get('/health-data', authMiddleware, roleMiddleware(['patient', 'admin']), generateHealthDataReport);
router.post('/export/:format', authMiddleware, roleMiddleware(['patient']), exportHealthReport);

export default router; 