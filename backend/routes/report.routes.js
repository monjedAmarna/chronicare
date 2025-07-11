import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import { createReport, getReports, deleteReport, getStats } from '../controllers/report.controller.js';

const router = express.Router();

router.post('/', authMiddleware, createReport);
router.get('/', authMiddleware, getReports);
router.delete('/:id', authMiddleware, deleteReport);

// Stats endpoint - admin only
router.get('/stats', authMiddleware, roleMiddleware(['admin']), getStats);

export default router; 