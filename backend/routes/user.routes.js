import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import { getUsers, getUserById, updateUser, deleteUser, getDoctors } from '../controllers/user.controller.js';

const router = express.Router();

// Get all doctors (public endpoint for registration)
router.get('/doctors', getDoctors);

// Protected routes
router.get('/', authMiddleware, roleMiddleware(['admin']), getUsers);
router.get('/:id', authMiddleware, getUserById);
router.put('/:id', authMiddleware, updateUser);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteUser);

export default router; 