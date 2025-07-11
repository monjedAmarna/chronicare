import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import { getSystemHealth, refreshCache, backupDatabase, runSecurityScan, getAuditLogs, clearLogs } from '../controllers/system.controller.js';

const router = express.Router();

router.get('/health', authMiddleware, roleMiddleware(['admin']), getSystemHealth);
router.post('/refresh-cache', authMiddleware, roleMiddleware(['admin']), refreshCache);
router.post('/backup-database', authMiddleware, roleMiddleware(['admin']), backupDatabase);
router.post('/security-scan', authMiddleware, roleMiddleware(['admin']), runSecurityScan);
router.get('/audit-logs', authMiddleware, roleMiddleware(['admin']), getAuditLogs);
router.delete('/clear-logs', authMiddleware, roleMiddleware(['admin']), clearLogs);

export default router; 