require('dotenv').config();
const { sequelize, EventType, Availability, Booking } = require('../models');

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

async function seed() {
  await sequelize.sync({ force: true });
  console.log('Database schema reset');

  const events = await EventType.bulkCreate([
    { title: '30 Minute Meeting', description: 'A quick sync, intro call, or catch-up.', duration: 30, slug: '30min', color: '#6366f1', location: 'Google Meet' },
    { title: '60 Minute Meeting', description: 'A longer session for interviews or planning.', duration: 60, slug: '60min', color: '#0ea5e9', location: 'Google Meet' },
    { title: '15 Minute Chat', description: 'A brief call for quick questions.', duration: 15, slug: '15min', color: '#10b981', location: 'Zoom' },
  ]);

  await Availability.bulkCreate(DAYS.map((day, index) => ({
    day,
    isAvailable: index < 5,
    startTime: '09:00',
    endTime: '17:00',
    timezone: 'Asia/Kolkata',
  })));

  const today = new Date();
  const fmt = (date) => date.toISOString().split('T')[0];
  const addDays = (n) => {
    const d = new Date(today);
    d.setDate(today.getDate() + n);
    return d;
  };

  await Booking.bulkCreate([
    { eventTypeId: events[0].id, bookerName: 'Rahul Sharma', bookerEmail: 'rahul@example.com', date: fmt(addDays(1)), startTime: '10:00', endTime: '10:30', status: 'confirmed', notes: 'Intro call' },
    { eventTypeId: events[1].id, bookerName: 'Priya Singh', bookerEmail: 'priya@example.com', date: fmt(addDays(3)), startTime: '14:00', endTime: '15:00', status: 'confirmed', notes: '' },
    { eventTypeId: events[2].id, bookerName: 'Amit Kumar', bookerEmail: 'amit@example.com', date: fmt(addDays(-2)), startTime: '11:00', endTime: '11:15', status: 'confirmed', notes: 'Reschedule test' },
  ]);

  console.log('Seed data created');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
