import HealthMetric from '../models/HealthMetric.js';
import { getAverageGlucose, getHealthMetricsSummary, getRecentHealthMetrics } from '../services/metric.service.js';
import { processHealthMetrics } from '../utils/healthAlerts.js';

export async function createMetric(req, res) {
  try {
    const { type, value, unit, recordedAt, notes, isFasting } = req.body;
    const metric = await HealthMetric.create({
      userId: req.user.id,
      type,
      value,
      unit,
      recordedAt: recordedAt || new Date(),
      notes,
    });
    
    // Check for health alerts based on the metric type
    let alerts = [];
    if (type === 'glucose' && value !== undefined) {
      alerts = await processHealthMetrics(req.user.id, { glucose: value, isFasting }, global.io);
    } else if (type === 'blood_pressure' && value) {
      // Parse blood pressure value (format: "systolic/diastolic")
      const bpValues = value.split('/');
      if (bpValues.length === 2) {
        const systolic = parseInt(bpValues[0]);
        const diastolic = parseInt(bpValues[1]);
        if (!isNaN(systolic) && !isNaN(diastolic)) {
          alerts = await processHealthMetrics(req.user.id, { systolic, diastolic }, global.io);
        }
      }
    }
    
    // Transform response to match frontend expectations
    const response = {
      id: metric.id,
      userId: metric.userId,
      type: metric.type,
      value: metric.value,
      unit: metric.unit,
      recordedAt: metric.recordedAt,
      notes: metric.notes,
      alerts: alerts // Include any alerts that were created
    };
    
    res.status(201).json(response);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
}

export async function getMetrics(req, res) {
  try {
    const metrics = await HealthMetric.findAll({
      where: { userId: req.user.id },
      order: [['recordedAt', 'DESC']],
    });
    
    // Transform response to match frontend expectations
    const response = metrics.map(metric => ({
      id: metric.id,
      userId: metric.userId,
      type: metric.type,
      value: metric.value,
      unit: metric.unit,
      recordedAt: metric.recordedAt,
      notes: metric.notes,
    }));
    
    res.json(response);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
}

export async function updateMetric(req, res) {
  try {
    const { id } = req.params;
    const metric = await HealthMetric.findOne({ where: { id, userId: req.user.id } });
    if (!metric) return res.status(404).json({ message: 'Metric not found' });
    
    const { type, value, unit, recordedAt, notes } = req.body;
    if (type !== undefined) metric.type = type;
    if (value !== undefined) metric.value = value;
    if (unit !== undefined) metric.unit = unit;
    if (recordedAt !== undefined) metric.recordedAt = recordedAt;
    if (notes !== undefined) metric.notes = notes;
    
    await metric.save();
    
    // Transform response to match frontend expectations
    const response = {
      id: metric.id,
      userId: metric.userId,
      type: metric.type,
      value: metric.value,
      unit: metric.unit,
      recordedAt: metric.recordedAt,
      notes: metric.notes,
    };
    
    res.json(response);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
}

export async function deleteMetric(req, res) {
  try {
    const { id } = req.params;
    const metric = await HealthMetric.findOne({ where: { id, userId: req.user.id } });
    if (!metric) return res.status(404).json({ message: 'Metric not found' });
    await metric.destroy();
    res.json({ message: 'Metric deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
}

export async function getMetricById(req, res) {
  try {
    const { id } = req.params;
    const metric = await HealthMetric.findOne({ where: { id, userId: req.user.id } });
    if (!metric) return res.status(404).json({ message: 'Metric not found' });
    
    // Transform response to match frontend expectations
    const response = {
      id: metric.id,
      userId: metric.userId,
      type: metric.type,
      value: metric.value,
      unit: metric.unit,
      recordedAt: metric.recordedAt,
      notes: metric.notes,
    };
    
    res.json(response);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
} 

export async function averageGlucose(req, res) {
  try {
    const avg = await getAverageGlucose();
    res.json({ averageGlucose: avg });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch average glucose', error: err.message });
  }
} 

export async function healthMetricsSummary(req, res) {
  try {
    const summary = await getHealthMetricsSummary();
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch health metrics summary', error: err.message });
  }
} 

export async function recentHealthMetrics(req, res) {
  try {
    const metrics = await getRecentHealthMetrics(20);
    res.json(metrics);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch recent health metrics', error: err.message });
  }
} 