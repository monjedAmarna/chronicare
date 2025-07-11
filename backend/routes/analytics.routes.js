import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import { getAnalytics, recentTrends, getPatientHealthSummaryController } from '../controllers/analytics.controller.js';

const router = express.Router();

// Analytics endpoint - admin only
router.get('/', authMiddleware, roleMiddleware(['admin']), getAnalytics);
router.get('/recent-trends', authMiddleware, roleMiddleware(['admin']), recentTrends);

// Patient health summary - patients can access their own data
router.get('/patient-summary', authMiddleware, roleMiddleware(['patient']), getPatientHealthSummaryController);

export default router; 