import Medication from '../models/Medication.js';
import User from '../models/User.js';

export async function createMedication(req, res) {
  try {
    const { name, dosage, frequency, times, startDate, endDate, isActive, notes, patientId } = req.body;
    
    let targetUserId = req.user.id;
    
    // If patientId is provided, verify the doctor has access to this patient
    if (patientId) {
      if (req.user.role !== 'doctor') {
        return res.status(403).json({ message: 'Only doctors can create medications for patients' });
      }
      
      // Verify the patient is assigned to this doctor
      const patient = await User.findOne({
        where: { id: patientId, role: 'patient', doctorId: req.user.id }
      });
      
      if (!patient) {
        return res.status(403).json({ message: 'Patient not found or not assigned to you' });
      }
      
      targetUserId = patientId;
    }
    
    const medication = await Medication.create({
      userId: targetUserId,
      name,
      dosage,
      frequency,
      times: times || [],
      startDate,
      endDate,
      isActive: isActive !== undefined ? isActive : true,
      notes: notes || null,
    });
    
    // Transform response to match frontend expectations
    const response = {
      id: medication.id,
      userId: medication.userId,
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      times: medication.times,
      startDate: medication.startDate,
      endDate: medication.endDate,
      isActive: medication.isActive,
      status: medication.isActive ? 'active' : 'paused',
      notes: medication.notes,
      createdAt: medication.createdAt,
    };
    
    res.status(201).json(response);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
}

export async function getMedications(req, res) {
  try {
    const { patientId } = req.query;
    let whereClause = {};

    if (req.user.role === 'doctor') {
      // Doctor: can fetch for assigned patient if patientId is provided, else nothing
      if (patientId) {
        // Verify the patient is assigned to this doctor
        const patient = await User.findOne({
          where: { id: patientId, role: 'patient', doctorId: req.user.id }
        });
        if (!patient) {
          return res.status(403).json({ message: 'Patient not found or not assigned to you' });
        }
        whereClause.userId = patientId;
      } else {
        // Optionally, allow doctors to fetch nothing or their own medications (if they are also a patient)
        // For now, return empty array if no patientId
        return res.json([]);
      }
    } else if (req.user.role === 'patient') {
      // Patient: always fetch their own medications, ignore patientId
      whereClause.userId = req.user.id;
    } else {
      // Other roles not allowed
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const medications = await Medication.findAll({
      where: whereClause,
      order: [['startDate', 'DESC']],
    });

    // Transform response to match frontend expectations
    const response = medications.map(med => ({
      id: med.id,
      userId: med.userId,
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      times: med.times,
      startDate: med.startDate,
      endDate: med.endDate,
      isActive: med.isActive,
      status: med.isActive ? 'active' : 'paused',
      notes: med.notes,
      createdAt: med.createdAt,
    }));

    res.json(response);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
}

export async function updateMedication(req, res) {
  try {
    const { id } = req.params;
    const { name, dosage, frequency, times, startDate, endDate, isActive, notes } = req.body;
    
    // Find medication and verify access
    let medication = await Medication.findByPk(id);
    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }
    
    // Check if user has access to this medication
    if (req.user.role === 'doctor') {
      // Doctor can only update medications for their assigned patients
      const patient = await User.findOne({
        where: { id: medication.userId, role: 'patient', doctorId: req.user.id }
      });
      
      if (!patient) {
        return res.status(403).json({ message: 'Access denied to this medication' });
      }
    } else {
      // Patient can only update their own medications
      if (medication.userId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied to this medication' });
      }
    }
    
    // Update fields
    if (name !== undefined) medication.name = name;
    if (dosage !== undefined) medication.dosage = dosage;
    if (frequency !== undefined) medication.frequency = frequency;
    if (times !== undefined) medication.times = times;
    if (startDate !== undefined) medication.startDate = startDate;
    if (endDate !== undefined) medication.endDate = endDate;
    if (isActive !== undefined) medication.isActive = isActive;
    if (notes !== undefined) medication.notes = notes;
    
    await medication.save();
    
    // Transform response to match frontend expectations
    const response = {
      id: medication.id,
      userId: medication.userId,
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      times: medication.times,
      startDate: medication.startDate,
      endDate: medication.endDate,
      isActive: medication.isActive,
      status: medication.isActive ? 'active' : 'paused',
      notes: medication.notes,
      createdAt: medication.createdAt,
    };
    
    res.json(response);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
}

export async function deleteMedication(req, res) {
  try {
    const { id } = req.params;
    
    // Find medication and verify access
    const medication = await Medication.findByPk(id);
    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }
    
    // Check if user has access to this medication
    if (req.user.role === 'doctor') {
      // Doctor can only delete medications for their assigned patients
      const patient = await User.findOne({
        where: { id: medication.userId, role: 'patient', doctorId: req.user.id }
      });
      
      if (!patient) {
        return res.status(403).json({ message: 'Access denied to this medication' });
      }
    } else {
      // Patient can only delete their own medications
      if (medication.userId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied to this medication' });
      }
    }
    
    await medication.destroy();
    res.json({ message: 'Medication deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
}

export async function getMedicationById(req, res) {
  try {
    const { id } = req.params;
    
    // Find medication and verify access
    const medication = await Medication.findByPk(id);
    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }
    
    // Check if user has access to this medication
    if (req.user.role === 'doctor') {
      // Doctor can only view medications for their assigned patients
      const patient = await User.findOne({
        where: { id: medication.userId, role: 'patient', doctorId: req.user.id }
      });
      
      if (!patient) {
        return res.status(403).json({ message: 'Access denied to this medication' });
      }
    } else {
      // Patient can only view their own medications
      if (medication.userId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied to this medication' });
      }
    }
    
    // Transform response to match frontend expectations
    const response = {
      id: medication.id,
      userId: medication.userId,
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      times: medication.times,
      startDate: medication.startDate,
      endDate: medication.endDate,
      isActive: medication.isActive,
      status: medication.isActive ? 'active' : 'paused',
      notes: medication.notes,
      createdAt: medication.createdAt,
    };
    
    res.json(response);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
} 