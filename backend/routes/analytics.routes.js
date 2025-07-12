import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import { getAnalytics, recentTrends, getPatientHealthSummaryController } from '../controllers/analytics.controller.js';

const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Analytics route is working' });
});

// Analytics endpoint - admin only
router.get('/', authMiddleware, roleMiddleware(['admin']), getAnalytics);
router.get('/recent-trends', authMiddleware, roleMiddleware(['admin']), recentTrends);

// Patient health summary - temporarily allow all authenticated users for debugging
router.get('/patient-summary', authMiddleware, (req, res, next) => {
  console.log("🔍 Route Debug: patient-summary endpoint hit");
  console.log("🔍 Route Debug: User role:", req.user?.role);
  next();
}, getPatientHealthSummaryController);

export default router; 