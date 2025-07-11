import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const SystemSettings = sequelize.define('SystemSettings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  key: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  }
}, {
  tableName: 'system_settings',
  timestamps: false,
  createdAt: false,
  updatedAt: 'updatedAt'
});

export default SystemSettings; 