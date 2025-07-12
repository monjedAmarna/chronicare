import { validationResult } from 'express-validator';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateToken } from '../utils/jwt.js';
import User from '../models/User.js';

export async function registerUser(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    const { name, email, password, role, firstName, lastName, doctorId } = req.body;
    
    // Ignore confirmPassword if sent
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Validate doctorId if provided (for patient registration)
    if (doctorId) {
      const doctor = await User.findOne({ 
        where: { 
          id: doctorId, 
          role: 'doctor' 
        } 
      });
      if (!doctor) {
        return res.status(400).json({ message: 'Invalid doctor selected' });
      }
    }

    // Require doctorId for patient registration
    if ((role || 'patient') === 'patient' && !doctorId) {
      return res.status(400).json({ message: 'Doctor selection is required for patient registration' });
    }

    const hashed = await hashPassword(password);
    const user = await User.create({ 
      name, 
      firstName, 
      lastName, 
      email, 
      password: hashed, 
      role: role || 'patient',
      doctorId: doctorId || null
    });
    
    const token = generateToken(user);
    return res.json({
      token,
      user: { 
        id: user.id, 
        name: user.name, 
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email, 
        role: user.role,
        doctorId: user.doctorId
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function loginUser(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(user);
    return res.json({
      token,
      user: { 
        id: user.id, 
        name: user.name, 
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email, 
        role: user.role 
      },
    });
  } catch (err) {
    return res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function updateProfile(req, res) {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const allowedFields = [
      'firstName', 'lastName', 'phone', 'gender', 'dateOfBirth', 'address', 'profileImageUrl', 'name'
    ];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    }
    await user.save();
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
} 