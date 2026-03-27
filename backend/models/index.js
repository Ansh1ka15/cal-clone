const sequelize = require('../config/database');
const EventType = require('./EventType');
const Availability = require('./Availability');
const Booking = require('./Booking');

EventType.hasMany(Booking, {
  foreignKey: 'eventTypeId',
  as: 'bookings',
  onDelete: 'CASCADE',
});
Booking.belongsTo(EventType, {
  foreignKey: 'eventTypeId',
  as: 'eventType',
});

module.exports = { sequelize, EventType, Availability, Booking };
