import HealthMetric from '../models/HealthMetric.js';
import Medication from '../models/Medication.js';

export async function getRecentActivities(req, res) {
  try {
    // Get recent health metrics
    const metrics = await HealthMetric.findAll({
      order: [['recordedAt', 'DESC']],
      limit: 10
    });
    
    // Get recent medications
    const medications = await Medication.findAll({
      order: [['startDate', 'DESC']],
      limit: 10
    });
    
    // Map to activity format
    const metricActivities = metrics.map(m => ({
      id: `metric_${m.id}`,
      type: 'health_metric',
      description: `Health metric logged: ${m.type} = ${m.value}${m.unit ? ' ' + m.unit : ''}`,
      timestamp: m.recordedAt,
      patientName: `Patient ${m.userId}` // You might want to join with User table for actual names
    }));
    
    const medicationActivities = medications.map(m => ({
      id: `med_${m.id}`,
      type: 'medication',
      description: `Medication updated: ${m.name} (${m.dosage})`,
      timestamp: m.startDate,
      patientName: `Patient ${m.userId}` // You might want to join with User table for actual names
    }));
    
    // Combine and sort
    const activities = [...metricActivities, ...medicationActivities]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 20);
    
    res.json({ success: true, data: activities });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch activities', error: err.message });
  }
} 