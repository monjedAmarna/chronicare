import * as alertService from '../services/alert.service.js';

export async function getAlerts(req, res) {
  try {
    let alerts;
    const userRole = req.user.role;
    const userId = req.user.id;

    if (userRole === 'doctor') {
      // Doctors see alerts for their assigned patients
      alerts = await alertService.getAlertsForDoctor(userId);
    } else if (userRole === 'patient') {
      // Patients see only their own alerts
      alerts = await alertService.getAlertsForPatient(userId);
    } else if (userRole === 'admin') {
      // Admins see all alerts (for system management)
      alerts = await alertService.getAlerts();
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(alerts);
  } catch (err) {
    console.error('Error in getAlerts:', err);
    if (err && err.stack) console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function createAlert(req, res) {
  try {
    const alert = await alertService.createAlert(req.body);
    res.status(201).json(alert);
  } catch (err) {
    if (err.message === 'Target user not found') {
      return res.status(404).json({ message: 'Target user not found' });
    }
    res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function updateAlert(req, res) {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;
    
    const alert = await alertService.updateAlert(id, req.body, currentUserId, currentUserRole);
    res.json(alert);
  } catch (err) {
    if (err.message === 'Alert not found') {
      return res.status(404).json({ message: 'Alert not found' });
    }
    if (err.message === 'Access denied') {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function deleteAlert(req, res) {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;
    
    const result = await alertService.deleteAlert(id, currentUserId, currentUserRole);
    res.json(result);
  } catch (err) {
    if (err.message === 'Alert not found') {
      return res.status(404).json({ message: 'Alert not found' });
    }
    if (err.message === 'Access denied') {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function markAlertAsRead(req, res) {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;
    
    const alert = await alertService.markAlertAsRead(id, currentUserId, currentUserRole);
    res.json(alert);
  } catch (err) {
    if (err.message === 'Alert not found') {
      return res.status(404).json({ message: 'Alert not found' });
    }
    if (err.message === 'Access denied') {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.status(500).json({ message: 'Something went wrong' });
  }
} 