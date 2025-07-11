import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import { createUserValidation, updateUserValidation } from '../validators/user.validator.js';
import { getUsers, createUser, getUserById, updateUser, deleteUser } from '../controllers/user.controller.js';

const router = express.Router();

// All routes require admin role
router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

// User management routes (admin only)
router.get('/', getUsers);
router.post('/', createUserValidation, createUser);
router.get('/:id', getUserById);
router.put('/:id', updateUserValidation, updateUser);
router.delete('/:id', deleteUser);

export default router; 