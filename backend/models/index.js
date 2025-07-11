import User from './User.js';
import HealthMetric from './HealthMetric.js';
import Medication from './Medication.js';
import Appointment from './Appointment.js';
import Report from './Report.js';
import Alert from './Alert.js';
import CarePlan from './CarePlan.js';
import SystemSettings from './SystemSettings.js';
import AuditLog from './AuditLog.js';
import ErrorLog from './ErrorLog.js';
import ActivityLog from './ActivityLog.js';

// Associations
User.hasMany(HealthMetric, { foreignKey: 'userId' });
HealthMetric.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Medication, { foreignKey: 'userId' });
Medication.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Report, { foreignKey: 'userId' });
Report.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Alert, { foreignKey: 'userId' });
Alert.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Appointment, { foreignKey: 'doctorId', as: 'DoctorAppointments' });
User.hasMany(Appointment, { foreignKey: 'patientId', as: 'PatientAppointments' });
Appointment.belongsTo(User, { foreignKey: 'doctorId', as: 'Doctor' });
Appointment.belongsTo(User, { foreignKey: 'patientId', as: 'Patient' });

// Care Plan associations
User.hasMany(CarePlan, { foreignKey: 'patientId', as: 'PatientCarePlans' });
User.hasMany(CarePlan, { foreignKey: 'createdBy', as: 'CreatedCarePlans' });
CarePlan.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });
CarePlan.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

export { User, HealthMetric, Medication, Appointment, Report, Alert, CarePlan, SystemSettings, AuditLog, ErrorLog, ActivityLog }; 