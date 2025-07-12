import * as userService from '../services/user.service.js';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';

export async function getUsers(req, res) {
  try {
    const { searchTerm, role } = req.query;
    console.log('GET /api/users - Query params:', { searchTerm, role });
    
    const users = await userService.getAllUsers(searchTerm, role);
    console.log(`GET /api/users - Found ${users.length} users`);
    
    res.json(users);
  } catch (err) {
    console.error('GET /api/users - Error:', err);
    console.error('GET /api/users - Error stack:', err.stack);
    console.error('GET /api/users - Error name:', err.name);
    console.error('GET /api/users - Error message:', err.message);
    
    // Return more specific error messages based on error type
    if (err.name === 'SequelizeConnectionError') {
      return res.status(500).json({ 
        message: 'Database connection error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
    
    if (err.name === 'SequelizeDatabaseError') {
      return res.status(500).json({ 
        message: 'Database error occurred',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
    
    res.status(500).json({ 
      message: 'Something went wrong',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}

export async function createUser(req, res) {
  try {
    const user = await userService.createUser(req.body);
    
    // Return user data without password
    const { password, ...userData } = user.toJSON();
    res.status(201).json(userData);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const user = await userService.updateUser(id, req.body);
    
    // Return user data without password
    const { password, ...userData } = user.toJSON();
    res.json(userData);
  } catch (err) {
    if (err.message === 'User not found') {
      return res.status(404).json({ message: 'User not found' });
    }
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const result = await userService.deleteUser(id);
    res.json(result);
  } catch (err) {
    if (err.message === 'User not found') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Something went wrong' });
  }
} 

export async function getDoctors(req, res) {
  try {
    const doctors = await User.findAll({
      attributes: ['id', 'name', 'firstName', 'lastName', 'email'],
      where: {
        role: 'doctor'
      },
      order: [['name', 'ASC']]
    });

    // Format the response to include a display name
    const formattedDoctors = doctors.map(doctor => ({
      id: doctor.id,
      name: doctor.name || `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim(),
      email: doctor.email
    }));

    res.json(formattedDoctors);
  } catch (err) {
    console.error('Error fetching doctors:', err);
    res.status(500).json({ message: 'Failed to fetch doctors', error: err.message });
  }
} 