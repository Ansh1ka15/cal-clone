const sequelize = require('../config/database');
const EventType = require('./EventType');
const Availability = require('./Availability');
const Booking = require('./Booking');
const Schedule = require('./Schedule');
const Override = require('./Override');

EventType.hasMany(Booking, {
  foreignKey: 'eventTypeId',
  as: 'bookings',
  onDelete: 'CASCADE',
});
Booking.belongsTo(EventType, {
  foreignKey: 'eventTypeId',
  as: 'eventType',
});

Schedule.hasMany(Availability, {
  foreignKey: 'scheduleId',
  as: 'availabilities',
  onDelete: 'CASCADE',
});
Availability.belongsTo(Schedule, {
  foreignKey: 'scheduleId',
  as: 'schedule',
});

Schedule.hasMany(Override, {
  foreignKey: 'scheduleId',
  as: 'overrides',
  onDelete: 'CASCADE',
});
Override.belongsTo(Schedule, {
  foreignKey: 'scheduleId',
  as: 'schedule',
});

module.exports = { sequelize, EventType, Availability, Booking, Schedule, Override };
