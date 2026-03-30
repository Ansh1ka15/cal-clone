const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Availability = sequelize.define('Availability', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  day: {
    type: DataTypes.ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'),
    allowNull: false,
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  startTime: {
    type: DataTypes.STRING(5),
    defaultValue: '09:00',
  },
  endTime: {
    type: DataTypes.STRING(5),
    defaultValue: '17:00',
  },
  timezone: {
    type: DataTypes.STRING(50),
    defaultValue: 'Asia/Kolkata',
  },
}, {
  tableName: 'availability',
  timestamps: true,
});

module.exports = Availability;
