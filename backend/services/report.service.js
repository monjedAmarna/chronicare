// Service for report generation business logic
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import Medication from '../models/Medication.js';
import Alert from '../models/Alert.js';
import HealthMetric from '../models/HealthMetric.js';
import { Sequelize } from 'sequelize';
import { Op } from 'sequelize';

export async function createReportService(data) {
  // Implement business logic if needed
}

export async function getReportsService(userId) {
  // Implement business logic if needed
}

export async function deleteReportService(id, userId) {
  // Implement business logic if needed
}

export async function getStatsService() {
  try {
    // Count patients (users with role 'patient')
    const totalPatients = await User.count({ where: { role: 'patient' } });

    // Count total appointments
    const totalAppointments = await Appointment.count();

    // Calculate average glucose across all HealthMetric records
    const glucoseResult = await HealthMetric.findOne({
      attributes: [[Sequelize.fn('AVG', Sequelize.cast(Sequelize.col('value'), 'DECIMAL(10,2)')), 'averageGlucose']],
      where: { type: 'glucose' },
      raw: true
    });
    const averageGlucose = glucoseResult && glucoseResult.averageGlucose ? parseFloat(glucoseResult.averageGlucose) : 0;

    // Calculate average systolic blood pressure
    const systolicResult = await HealthMetric.findOne({
      attributes: [[Sequelize.fn('AVG', Sequelize.cast(Sequelize.col('value'), 'DECIMAL(10,2)')), 'averageSystolic']],
      where: { type: 'blood_pressure_systolic' },
      raw: true
    });
    const averageSystolic = systolicResult && systolicResult.averageSystolic ? parseFloat(systolicResult.averageSystolic) : 0;

    // Calculate average diastolic blood pressure
    const diastolicResult = await HealthMetric.findOne({
      attributes: [[Sequelize.fn('AVG', Sequelize.cast(Sequelize.col('value'), 'DECIMAL(10,2)')), 'averageDiastolic']],
      where: { type: 'blood_pressure_diastolic' },
      raw: true
    });
    const averageDiastolic = diastolicResult && diastolicResult.averageDiastolic ? parseFloat(diastolicResult.averageDiastolic) : 0;

    // Count total alerts
    const totalAlerts = await Alert.count();

    return {
      totalPatients,
      totalAppointments,
      averageGlucose,
      averageBloodPressure: {
        systolic: averageSystolic,
        diastolic: averageDiastolic
      },
      totalAlerts
    };
  } catch (error) {
    throw new Error('Failed to fetch statistics');
  }
}

export async function getHealthMetricsWithDateRange({ user, startDate, endDate, searchTerm, metricType }) {
  // Build where clause
  const where = {};
  
  // User filter: admin sees all users, patients see only their data
  if (user.role !== 'admin') {
    where.userId = user.id;
  }
  
  // Date range filter if both dates are provided and valid
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (!isNaN(start) && !isNaN(end)) {
      where.recordedAt = { [Op.between]: [start, end] };
    }
  }
  
  // Search term filter: case-insensitive search in notes field
  if (searchTerm && searchTerm.trim()) {
    where.notes = { [Op.iLike]: `%${searchTerm.trim()}%` };
  }
  
  // Metric type filter
  if (metricType && metricType.trim()) {
    where.type = metricType.trim();
  }
  
  // Fetch metrics
  const metrics = await HealthMetric.findAll({
    where,
    order: [['recordedAt', 'ASC']]
  });
  return metrics;
} 