const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Override = sequelize.define('Override', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  scheduleId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  slots: {
    // Array of { startTime, endTime }
    type: DataTypes.JSON,
    defaultValue: [],
  },
}, {
  tableName: 'overrides',
  timestamps: true,
});

module.exports = Override;
