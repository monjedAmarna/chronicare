// Service for health metrics business logic
import HealthMetric from '../models/HealthMetric.js';
import { Sequelize } from 'sequelize';
import User from '../models/User.js';

export async function createMetricService(data) {
  // Implement business logic if needed
}

export async function getMetricsService(userId) {
  // Implement business logic if needed
}

export async function updateMetricService(id, userId, data) {
  // Implement business logic if needed
}

export async function deleteMetricService(id, userId) {
  // Implement business logic if needed
}

export async function getAverageGlucose() {
  const result = await HealthMetric.findOne({
    attributes: [[Sequelize.fn('AVG', Sequelize.col('value')), 'averageGlucose']],
    where: { type: 'glucose' },
    raw: true
  });
  return result && result.averageGlucose ? parseFloat(result.averageGlucose) : null;
}

export async function getHealthMetricsSummary() {
  const [glucose, systolic, diastolic, total] = await Promise.all([
    HealthMetric.findOne({
      attributes: [[Sequelize.fn('AVG', Sequelize.col('value')), 'avg']],
      where: { type: 'glucose' },
      raw: true
    }),
    HealthMetric.findOne({
      attributes: [[Sequelize.fn('AVG', Sequelize.col('value')), 'avg']],
      where: { type: 'blood_pressure_systolic' },
      raw: true
    }),
    HealthMetric.findOne({
      attributes: [[Sequelize.fn('AVG', Sequelize.col('value')), 'avg']],
      where: { type: 'blood_pressure_diastolic' },
      raw: true
    }),
    HealthMetric.count()
  ]);
  return {
    averageGlucose: glucose && glucose.avg ? parseFloat(glucose.avg) : null,
    averageSystolicBP: systolic && systolic.avg ? parseFloat(systolic.avg) : null,
    averageDiastolicBP: diastolic && diastolic.avg ? parseFloat(diastolic.avg) : null,
    totalRecords: total
  };
}

export async function getRecentHealthMetrics(limit = 20) {
  const metrics = await HealthMetric.findAll({
    include: [{ model: User, attributes: ['id', 'name'] }],
    order: [['recordedAt', 'DESC']],
    limit,
    raw: true,
    nest: true
  });
  return metrics.map(m => ({
    id: m.id,
    userId: m.userId,
    userName: m.User?.name || '',
    type: m.type,
    value: m.value,
    unit: m.unit,
    recordedAt: m.recordedAt
  }));
} 