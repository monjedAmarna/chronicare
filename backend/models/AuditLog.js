import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  action: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'The action performed (e.g., "User created", "Logs cleared")'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID of the user who performed the action'
  },
  userEmail: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Email of the user who performed the action'
  },
  userRole: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Role of the user who performed the action'
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Additional details about the action'
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
  status: {
    type: DataTypes.ENUM('success', 'failure', 'warning'),
    defaultValue: 'success',
    comment: 'Status of the action'
  }
}, {
  tableName: 'audit_logs',
  timestamps: true,
  indexes: [
    {
      fields: ['action']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['createdAt']
    },
    {
      fields: ['status']
    }
  ]
});

export default AuditLog; 