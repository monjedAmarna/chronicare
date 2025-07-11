import * as userService from '../services/user.service.js';
import User from '../models/User.js';

export async function getAssignedPatients(req, res) {
  try {
    // This endpoint is only for doctors, so we can safely use req.user.id as doctorId
    const patients = await User.findAll({
      where: { 
        role: 'patient',
        doctorId: req.user.id 
      },
      attributes: ['id', 'name', 'firstName', 'lastName', 'email'],
      order: [['firstName', 'ASC'], ['lastName', 'ASC']],
    });
    
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function getAllPatients(req, res) {
  try {
    let where = { role: 'patient' };
    if (req.user.role === 'doctor') {
      where.doctorId = req.user.id;
    }
    // Admins see all patients
    const patients = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['id', 'ASC']],
    });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function createPatient(req, res) {
  try {
    let doctorId = null;
    if (req.user.role === 'doctor') {
      doctorId = req.user.id;
    } else if (req.user.role === 'admin') {
      doctorId = req.body.doctorId || null;
    }
    // Ensure the role is set to 'patient'
    const patientData = { ...req.body, role: 'patient', doctorId };
    const patient = await userService.createUser(patientData);
    
    // Return patient data without password
    const { password, ...patientDataResponse } = patient.toJSON();
    res.status(201).json(patientDataResponse);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function getPatientById(req, res) {
  try {
    const { id } = req.params;
    const patient = await User.findOne({
      where: { id, role: 'patient' },
      attributes: { exclude: ['password'] },
    });
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function updatePatient(req, res) {
  try {
    const { id } = req.params;
    
    // First check if the user exists and is a patient
    const existingPatient = await User.findOne({
      where: { id, role: 'patient' },
    });
    
    if (!existingPatient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Ensure role cannot be changed from 'patient'
    const updateData = { ...req.body, role: 'patient' };
    const patient = await userService.updateUser(id, updateData);
    
    // Return patient data without password
    const { password, ...patientData } = patient.toJSON();
    res.json(patientData);
  } catch (err) {
    if (err.message === 'User not found') {
      return res.status(404).json({ message: 'Patient not found' });
    }
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function deletePatient(req, res) {
  try {
    const { id } = req.params;
    
    // First check if the user exists and is a patient
    const existingPatient = await User.findOne({
      where: { id, role: 'patient' },
    });
    
    if (!existingPatient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    const result = await userService.deleteUser(id);
    res.json(result);
  } catch (err) {
    if (err.message === 'User not found') {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.status(500).json({ message: 'Something went wrong' });
  }
} 