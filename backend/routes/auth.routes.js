import express from 'express';
import { registerUser, loginUser, updateProfile } from '../controllers/auth.controller.js';
import { registerValidation, loginValidation, profileUpdateValidation } from '../validators/auth.validator.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import User from '../models/User.js';

const router = express.Router();

router.post('/register', registerValidation, registerUser);
router.post('/signin', loginValidation, loginUser); // Renamed from /login to /signin
router.patch('/profile', authMiddleware, profileUpdateValidation, updateProfile);

// GET /user - return current user profile
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      address: user.address,
      profileImageUrl: user.profileImageUrl,
    });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// POST /signout - logout endpoint
router.post('/signout', authMiddleware, (req, res) => {
  // Note: JWT tokens are stateless, so we just return success
  // The frontend will clear the token from localStorage
  res.json({ message: 'Signed out successfully' });
});

export default router; 