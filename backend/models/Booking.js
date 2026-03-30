const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  bookerName: {
    type: DataTypes.STRING(120),
    allowNull: false,
  },
  bookerEmail: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: { isEmail: true },
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  startTime: {
    type: DataTypes.STRING(5),
    allowNull: false,
  },
  endTime: {
    type: DataTypes.STRING(5),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('confirmed', 'cancelled', 'rescheduled'),
    defaultValue: 'confirmed',
  },
  notes: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  customAnswers: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  cancelReason: {
    type: DataTypes.STRING(300),
    defaultValue: '',
  },
}, {
  tableName: 'bookings',
  timestamps: true,
});

module.exports = Booking;
