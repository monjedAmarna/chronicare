import express from 'express';
const router = express.Router();
import systemSettingsController from '../controllers/systemSettings.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

// GET /api/system/settings - Get all system settings
router.get('/', systemSettingsController.getAllSettings);

// PUT /api/system/settings - Update system settings
router.put('/', systemSettingsController.updateSettings);

// POST /api/system/settings/initialize - Initialize default settings (optional)
router.post('/initialize', systemSettingsController.initializeSettings);

export default router; 