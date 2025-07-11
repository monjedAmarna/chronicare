import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ActivityLog = sequelize.define('ActivityLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID of the user who performed the activity'
  },
  userEmail: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Email of the user who performed the activity'
  },
  userRole: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Role of the user who performed the activity'
  },
  activity: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'The activity performed (e.g., "Login", "View Dashboard", "Create Appointment")'
  },
  category: {
    type: DataTypes.ENUM('auth', 'dashboard', 'appointments', 'patients', 'medications', 'reports', 'admin', 'other'),
    defaultValue: 'other',
    comment: 'Category of the activity'
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Additional details about the activity'
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: 'IP address of the user'
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'User agent string'
  },
  endpoint: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'API endpoint accessed'
  },
  method: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'HTTP method used'
  },
  status: {
    type: DataTypes.ENUM('success', 'failure'),
    defaultValue: 'success',
    comment: 'Status of the activity'
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Duration of the activity in milliseconds'
  }
}, {
  tableName: 'activity_logs',
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['activity']
    },
    {
      fields: ['category']
    },
    {
      fields: ['createdAt']
    },
    {
      fields: ['status']
    }
  ]
});

export default ActivityLog; 