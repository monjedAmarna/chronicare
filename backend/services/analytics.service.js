import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import Medication from '../models/Medication.js';
import HealthMetric from '../models/HealthMetric.js';
import Alert from '../models/Alert.js';
import { Sequelize } from 'sequelize';
import logger from '../utils/logger.js';

export async function getTimeBasedAnalytics(startDate, endDate) {
  try {
    // Use provided date range or default to last 7 days
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date();
    if (!startDate) {
      start.setDate(start.getDate() - 7);
    }

    // Format dates for consistent comparison
    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };

    // Get active users per day (users who logged in)
    const activeUsersPerDay = await User.findAll({
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('lastLoginAt')), 'date'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      where: {
        lastLoginAt: {
          [Sequelize.Op.between]: [start, end]
        }
      },
      group: [Sequelize.fn('DATE', Sequelize.col('lastLoginAt'))],
      order: [[Sequelize.fn('DATE', Sequelize.col('lastLoginAt')), 'ASC']],
      raw: true
    });

    // Get appointments per day
    const appointmentsPerDay = await Appointment.findAll({
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'date'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      where: {
        createdAt: {
          [Sequelize.Op.between]: [start, end]
        }
      },
      group: [Sequelize.fn('DATE', Sequelize.col('createdAt'))],
      order: [[Sequelize.fn('DATE', Sequelize.col('createdAt')), 'ASC']],
      raw: true
    });

    // Get alerts triggered per day
    const alertsPerDay = await Alert.findAll({
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'date'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      where: {
        createdAt: {
          [Sequelize.Op.between]: [start, end]
        }
      },
      group: [Sequelize.fn('DATE', Sequelize.col('createdAt'))],
      order: [[Sequelize.fn('DATE', Sequelize.col('createdAt')), 'ASC']],
      raw: true
    });

    // Calculate the number of days in the range
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    // Initialize arrays for all dates in the range
    const result = [];
    for (let i = 0; i < daysDiff; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const dateStr = formatDate(date);
      
      result.push({
        date: dateStr,
        activeUsers: 0,
        appointments: 0,
        alertsTriggered: 0
      });
    }

    // Fill in actual data
    activeUsersPerDay.forEach(item => {
      const index = result.findIndex(r => r.date === item.date);
      if (index !== -1) {
        result[index].activeUsers = parseInt(item.count);
      }
    });

    appointmentsPerDay.forEach(item => {
      const index = result.findIndex(r => r.date === item.date);
      if (index !== -1) {
        result[index].appointments = parseInt(item.count);
      }
    });

    alertsPerDay.forEach(item => {
      const index = result.findIndex(r => r.date === item.date);
      if (index !== -1) {
        result[index].alertsTriggered = parseInt(item.count);
      }
    });

    return result;
  } catch (error) {
    logger.warn('getTimeBasedAnalytics failed, returning empty array', { error: error.message });
    return [];
  }
}

export async function getRecentTrends() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 6); // last 7 days including today

  // Only include these types
  const types = ['glucose', 'blood_pressure_systolic', 'blood_pressure_diastolic'];

  let results;
  try {
    results = await HealthMetric.findAll({
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('recordedAt')), 'date'],
        'type',
        [Sequelize.fn('AVG', Sequelize.col('value')), 'average']
      ],
      where: {
        type: types,
        recordedAt: {
          [Sequelize.Op.between]: [startDate, endDate]
        }
      },
      group: [Sequelize.fn('DATE', Sequelize.col('recordedAt')), 'type'],
      order: [[Sequelize.fn('DATE', Sequelize.col('recordedAt')), 'ASC'], ['type', 'ASC']],
      raw: true
    });
  } catch (error) {
    logger.warn('getRecentTrends: HealthMetric.findAll failed', { error: error.message });
    results = [];
  }

  if (!Array.isArray(results)) {
    logger.warn('getRecentTrends: results is not an array, returning empty array', { results });
    return [];
  }

  return results.map(r => ({
    date: r.date,
    type: r.type === 'blood_pressure_systolic' ? 'systolic' : r.type === 'blood_pressure_diastolic' ? 'diastolic' : r.type,
    average: r.average !== null ? parseFloat(r.average) : null
  }));
} 

export async function getPatientHealthSummary(userId) {
  try {
    // Get average glucose (last 7 days or all-time)
    const glucoseMetrics = await HealthMetric.findAll({
      attributes: [
        [Sequelize.fn('AVG', Sequelize.cast(Sequelize.col('value'), 'FLOAT')), 'averageGlucose']
      ],
      where: {
        userId: userId,
        type: 'glucose'
      },
      raw: true
    });

    // Get average blood pressure (systolic and diastolic)
    const systolicMetrics = await HealthMetric.findAll({
      attributes: [
        [Sequelize.fn('AVG', Sequelize.cast(Sequelize.col('value'), 'FLOAT')), 'averageSystolic']
      ],
      where: {
        userId: userId,
        type: 'blood_pressure_systolic'
      },
      raw: true
    });

    const diastolicMetrics = await HealthMetric.findAll({
      attributes: [
        [Sequelize.fn('AVG', Sequelize.cast(Sequelize.col('value'), 'FLOAT')), 'averageDiastolic']
      ],
      where: {
        userId: userId,
        type: 'blood_pressure_diastolic'
      },
      raw: true
    });

    // Get critical alerts count
    const criticalAlerts = await Alert.count({
      where: {
        userId: userId,
        status: 'critical'
      }
    });

    // Get non-critical alerts count (health alerts excluding critical ones)
    const healthAlerts = await Alert.count({
      where: {
        userId: userId,
        status: {
          [Sequelize.Op.ne]: 'critical'
        }
      }
    });

    return {
      averageGlucose: glucoseMetrics[0]?.averageGlucose ? parseFloat(glucoseMetrics[0].averageGlucose).toFixed(1) : null,
      averageSystolic: systolicMetrics[0]?.averageSystolic ? parseFloat(systolicMetrics[0].averageSystolic).toFixed(0) : null,
      averageDiastolic: diastolicMetrics[0]?.averageDiastolic ? parseFloat(diastolicMetrics[0].averageDiastolic).toFixed(0) : null,
      totalAlerts: healthAlerts,
      criticalAlerts: criticalAlerts
    };
  } catch (error) {
    logger.warn('getPatientHealthSummary failed', { error: error.message, userId });
    return {
      averageGlucose: null,
      averageSystolic: null,
      averageDiastolic: null,
      totalAlerts: 0,
      criticalAlerts: 0
    };
  }
} 