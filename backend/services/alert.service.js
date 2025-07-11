import Alert from '../models/Alert.js';
import User from '../models/User.js';
import { Op } from 'sequelize';

export async function createAlert(alertData) {
  // Verify that the target user exists
  const user = await User.findByPk(alertData.userId);
  if (!user) {
    throw new Error('Target user not found');
  }

  return await Alert.create({
    ...alertData,
    isRead: false, // Default to unread
  });
}

export async function updateAlert(id, updateData, currentUserId, currentUserRole) {
  const alert = await Alert.findByPk(id);
  if (!alert) {
    throw new Error('Alert not found');
  }

  // Check permissions: only target user or admin can update
  if (currentUserRole !== 'admin' && alert.userId !== currentUserId) {
    throw new Error('Access denied');
  }

  await alert.update(updateData);
  return alert;
}

export async function deleteAlert(id, currentUserId, currentUserRole) {
  const alert = await Alert.findByPk(id);
  if (!alert) {
    throw new Error('Alert not found');
  }

  // Check permissions: only target user or admin can delete
  if (currentUserRole !== 'admin' && alert.userId !== currentUserId) {
    throw new Error('Access denied');
  }

  await alert.destroy();
  return { message: 'Alert deleted successfully' };
}

export async function markAlertAsRead(id, currentUserId, currentUserRole) {
  const alert = await Alert.findByPk(id);
  if (!alert) {
    throw new Error('Alert not found');
  }

  // Check permissions: only target user or admin can mark as read
  if (currentUserRole !== 'admin' && alert.userId !== currentUserId) {
    throw new Error('Access denied');
  }

  await alert.update({ isRead: true });
  return alert;
}

export async function getAlertById(id) {
  return await Alert.findByPk(id);
}

export async function getAlerts() {
  return await Alert.findAll({
    include: [
      {
        model: User,
        attributes: ['id', 'name', 'firstName', 'lastName', 'email'],
      }
    ],
    order: [['createdAt', 'DESC']],
  });
}

export async function getAlertsForPatient(patientId) {
  return await Alert.findAll({
    where: { userId: patientId },
    include: [
      {
        model: User,
        attributes: ['id', 'name', 'firstName', 'lastName', 'email'],
      }
    ],
    order: [['createdAt', 'DESC']],
  });
}

export async function getAlertsForDoctor(doctorId) {
  // Find all patients assigned to this doctor
  const patients = await User.findAll({
    where: { doctorId },
    attributes: ['id', 'name', 'firstName', 'lastName']
  });
  const patientIds = patients.map(p => p.id);
  console.log("Doctor ID:", doctorId);
  console.log("Patients:", patients);
  console.log("Patient IDs:", patientIds);
  console.log("Is patientIds an array?", Array.isArray(patientIds));
  console.log("Length of patientIds:", patientIds.length);
  if (patientIds.length === 0) return [];
  // Fetch alerts for these patients
  const alerts = await Alert.findAll({
    where: { userId: { [Op.in]: patientIds } },
    attributes: ['id', 'value', 'status', 'type', 'createdAt'],
    include: [
      {
        model: User,
        attributes: ['id', 'name', 'firstName', 'lastName'],
      }
    ],
    order: [['createdAt', 'DESC']],
  });
  return alerts;
} 