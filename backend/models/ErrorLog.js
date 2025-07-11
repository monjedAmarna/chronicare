import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ErrorLog = sequelize.define('ErrorLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  level: {
    type: DataTypes.ENUM('error', 'warning', 'info', 'debug'),
    defaultValue: 'error',
    comment: 'Log level'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Error message'
  },
  stack: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Error stack trace'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID of the user who triggered the error'
  },
  userEmail: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Email of the user who triggered the error'
  },
  endpoint: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'API endpoint where the error occurred'
  },
  method: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'HTTP method'
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
  requestBody: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Request body (sanitized)'
  },
  responseStatus: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'HTTP response status code'
  }
}, {
  tableName: 'error_logs',
  timestamps: true,
  indexes: [
    {
      fields: ['level']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['createdAt']
    },
    {
      fields: ['endpoint']
    }
  ]
});

export default ErrorLog; 