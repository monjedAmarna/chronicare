import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const CarePlan = sequelize.define('CarePlan', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  medications: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('medications');
      return rawValue ? JSON.parse(rawValue) : null;
    },
    set(value) {
      this.setDataValue('medications', value ? JSON.stringify(value) : null);
    },
  },
  dietPlan: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('ongoing', 'completed', 'paused', 'overdue'),
    allowNull: false,
    defaultValue: 'ongoing',
  },
  progress: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 4,
  },
  assignedTo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  completedTasks: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  totalTasks: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  goals: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('goals');
      return rawValue ? JSON.parse(rawValue) : null;
    },
    set(value) {
      this.setDataValue('goals', value ? JSON.stringify(value) : null);
    },
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE',
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE',
  },
}, {
  tableName: 'care_plans',
  timestamps: true,
  createdAt: true,
  updatedAt: true,
});

export default CarePlan; 