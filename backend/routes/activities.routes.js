import express from 'express';
import { getRecentActivities } from '../controllers/activities.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';

const router = express.Router();

// Only admins and doctors can access
router.get('/', authMiddleware, roleMiddleware(['admin', 'doctor']), getRecentActivities);

export default router; 