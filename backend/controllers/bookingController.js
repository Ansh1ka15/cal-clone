const { Booking, EventType } = require('../models');
const { sendBookingConfirmation, sendCancellationEmail, sendRescheduleEmail } = require('../services/emailService');

exports.getAll = async (req, res, next) => {
  try {
    const bookings = await Booking.findAll({
      include: [{ model: EventType, as: 'eventType', attributes: ['title', 'duration', 'color', 'slug'] }],
      order: [['date', 'ASC'], ['startTime', 'ASC']],
    });
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { eventTypeId, date } = req.query;
    const booked = await Booking.findAll({
      where: { eventTypeId, date, status: 'confirmed' },
      attributes: ['startTime', 'endTime'],
    });
    res.json(booked);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { eventTypeId, date, startTime } = req.body;
    const conflict = await Booking.findOne({
      where: { eventTypeId, date, startTime, status: 'confirmed' },
    });
    if (conflict) {
      return res.status(409).json({ error: 'This slot is already booked. Please choose another time.' });
    }
    const booking = await Booking.create(req.body);
    const eventType = await EventType.findByPk(eventTypeId);
    sendBookingConfirmation({
      bookerName: booking.bookerName,
      bookerEmail: booking.bookerEmail,
      eventTitle: eventType.title,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
    }).catch(console.error);
    res.status(201).json({ ...booking.toJSON(), eventType });
  } catch (err) {
    next(err);
  }
};

exports.cancel = async (req, res, next) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: EventType, as: 'eventType' }],
    });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    await booking.update({ status: 'cancelled', cancelReason: req.body.reason || '' });
    sendCancellationEmail({
      bookerName: booking.bookerName,
      bookerEmail: booking.bookerEmail,
      eventTitle: booking.eventType.title,
      date: booking.date,
      startTime: booking.startTime,
    }).catch(console.error);
    res.json(booking);
  } catch (err) {
    next(err);
  }
};

exports.reschedule = async (req, res, next) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: EventType, as: 'eventType' }],
    });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    const { date, startTime, endTime } = req.body;
    const conflict = await Booking.findOne({
      where: { eventTypeId: booking.eventTypeId, date, startTime, status: 'confirmed' },
    });
    if (conflict) return res.status(409).json({ error: 'That slot is already booked.' });
    const oldDate = booking.date;
    const oldTime = booking.startTime;
    await booking.update({ date, startTime, endTime, status: 'rescheduled' });
    sendRescheduleEmail({
      bookerName: booking.bookerName,
      bookerEmail: booking.bookerEmail,
      eventTitle: booking.eventType.title,
      oldDate,
      oldTime,
      newDate: date,
      newTime: startTime,
    }).catch(console.error);
    res.json(booking);
  } catch (err) {
    next(err);
  }
};
