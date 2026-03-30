const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EventType = sequelize.define('EventType', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(120),
    allowNull: false,
    validate: { notEmpty: true, len: [1, 120] },
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 30,
    validate: { min: 5, max: 480 },
  },
  bufferTime: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  customQuestions: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  slug: {
    type: DataTypes.STRING(120),
    allowNull: false,
    unique: true,
    validate: { is: /^[a-z0-9-]+$/i },
  },
  color: {
    type: DataTypes.STRING(7),
    defaultValue: '#6366f1',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  location: {
    type: DataTypes.STRING(200),
    defaultValue: 'Google Meet',
  },
}, {
  tableName: 'event_types',
  timestamps: true,
});

module.exports = EventType;
