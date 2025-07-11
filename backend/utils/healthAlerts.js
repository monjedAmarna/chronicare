import * as alertService from '../services/alert.service.js';

// Health alert thresholds
export const HEALTH_THRESHOLDS = {
  glucose: {
    fasting: {
      low: 70,
      high: 126
    },
    random: {
      high: 200
    }
  },
  bloodPressure: {
    systolic: {
      low: 90,
      normal: 140,
      critical: 180
    },
    diastolic: {
      low: 60,
      normal: 90,
      critical: 120
    }
  }
};

// Check if glucose reading is abnormal
export function checkGlucoseAlert(glucoseValue, isFasting = true) {
  const alerts = [];
  
  if (isFasting) {
    if (glucoseValue < HEALTH_THRESHOLDS.glucose.fasting.low) {
      alerts.push({
        type: 'glucose',
        level: 'low',
        severity: 'critical',
        message: `Glucose reading is dangerously low (${glucoseValue} mg/dL)`
      });
    } else if (glucoseValue > HEALTH_THRESHOLDS.glucose.fasting.high) {
      alerts.push({
        type: 'glucose',
        level: 'high',
        severity: glucoseValue > HEALTH_THRESHOLDS.glucose.random.high ? 'critical' : 'high',
        message: `Glucose reading is elevated (${glucoseValue} mg/dL)`
      });
    }
  } else {
    // Random glucose reading
    if (glucoseValue > HEALTH_THRESHOLDS.glucose.random.high) {
      alerts.push({
        type: 'glucose',
        level: 'high',
        severity: 'critical',
        message: `Glucose reading is dangerously high (${glucoseValue} mg/dL)`
      });
    }
  }
  
  return alerts;
}

// Check if blood pressure reading is abnormal
export function checkBloodPressureAlert(systolic, diastolic) {
  const alerts = [];
  
  // Check for high blood pressure
  if (systolic >= HEALTH_THRESHOLDS.bloodPressure.systolic.critical || 
      diastolic >= HEALTH_THRESHOLDS.bloodPressure.diastolic.critical) {
    alerts.push({
      type: 'blood_pressure',
      level: 'high',
      severity: 'critical',
      message: `Blood pressure is critically high (${systolic}/${diastolic} mmHg)`
    });
  } else if (systolic >= HEALTH_THRESHOLDS.bloodPressure.systolic.normal || 
             diastolic >= HEALTH_THRESHOLDS.bloodPressure.diastolic.normal) {
    alerts.push({
      type: 'blood_pressure',
      level: 'high',
      severity: 'high',
      message: `Blood pressure is elevated (${systolic}/${diastolic} mmHg)`
    });
  }
  
  // Check for low blood pressure
  if (systolic < HEALTH_THRESHOLDS.bloodPressure.systolic.low || 
      diastolic < HEALTH_THRESHOLDS.bloodPressure.diastolic.low) {
    alerts.push({
      type: 'blood_pressure',
      level: 'low',
      severity: 'high',
      message: `Blood pressure is low (${systolic}/${diastolic} mmHg)`
    });
  }
  
  return alerts;
}

// Create alert and emit Socket.IO event
export async function createHealthAlert(userId, alertData, io) {
  try {
    // Create alert in database
    const alert = await alertService.createAlert({
      title: `${alertData.type.toUpperCase()} Alert`,
      message: alertData.message,
      userId: userId,
      type: alertData.severity,
      value: alertData.level,
      status: alertData.severity,
      isRead: false
    });
    
    // Emit Socket.IO event for real-time notification
    if (io) {
      io.emit('new-alert', {
        id: alert.id,
        userId: userId,
        type: alertData.type,
        level: alertData.level,
        severity: alertData.severity,
        value: alertData.level,
        message: alertData.message,
        timestamp: new Date().toISOString()
      });
    }
    
    return alert;
  } catch (error) {
    console.error('Error creating health alert:', error);
    throw error;
  }
}

// Process health metrics and create alerts if needed
export async function processHealthMetrics(userId, metrics, io) {
  const alerts = [];
  
  // Check glucose metrics
  if (metrics.glucose !== undefined) {
    const glucoseAlerts = checkGlucoseAlert(metrics.glucose, metrics.isFasting);
    alerts.push(...glucoseAlerts);
  }
  
  // Check blood pressure metrics
  if (metrics.systolic !== undefined && metrics.diastolic !== undefined) {
    const bpAlerts = checkBloodPressureAlert(metrics.systolic, metrics.diastolic);
    alerts.push(...bpAlerts);
  }
  
  // Create alerts for each abnormal reading
  const createdAlerts = [];
  for (const alertData of alerts) {
    try {
      const alert = await createHealthAlert(userId, alertData, io);
      createdAlerts.push(alert);
    } catch (error) {
      console.error('Failed to create alert:', error);
    }
  }
  
  return createdAlerts;
} 