const { Availability, Schedule, Override } = require('../models');

exports.get = async (req, res, next) => {
  try {
    let schedule = await Schedule.findOne({
      where: { isDefault: true },
    });
    
    // If no default exists, just grab the first one, or create one.
    if (!schedule) {
      schedule = await Schedule.findOne();
      if (!schedule) {
        schedule = await Schedule.create({ name: 'Working hours', isDefault: true });
        const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
        const defaults = DAYS.map((day, index) => ({
          scheduleId: schedule.id,
          day,
          isAvailable: index < 5,
          startTime: '09:00',
          endTime: '17:00',
          timezone: 'Europe/London',
        }));
        await Availability.bulkCreate(defaults);
      } else {
        await schedule.update({ isDefault: true });
      }
    }

    const rows = await Availability.findAll({ where: { scheduleId: schedule.id } });
    const overrides = await Override.findAll({ where: { scheduleId: schedule.id } });
    
    const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    
    // Group slots by day
    const grouped = DAYS.map(day => {
      const daySlots = rows.filter(r => r.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
      return {
        day,
        isAvailable: daySlots.length > 0 && daySlots[0].isAvailable,
        slots: daySlots.length > 0 && daySlots[0].isAvailable ? daySlots.map(r => ({ startTime: r.startTime, endTime: r.endTime })) : [{ startTime: "09:00", endTime: "17:00" }],
      };
    });

    res.json({ availabilities: grouped, overrides });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { schedule, timezone } = req.body;
    if (!Array.isArray(schedule)) {
      return res.status(400).json({ message: 'Invalid schedule payload' });
    }

    await Availability.destroy({ where: {} });
    await Availability.bulkCreate(
      schedule.map((item) => ({
        day: item.day,
        isAvailable: item.isAvailable,
        startTime: item.startTime,
        endTime: item.endTime,
        timezone,
      })),
    );

    const updated = await Availability.findAll({ order: [['day', 'ASC']] });
    updated.sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day));
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { schedule, timezone } = req.body;
    if (!Array.isArray(schedule)) {
      return res.status(400).json({ message: 'Invalid schedule payload' });
    }

    await Availability.destroy({ where: {} });
    await Availability.bulkCreate(
      schedule.map((item) => ({
        day: item.day,
        isAvailable: item.isAvailable,
        startTime: item.startTime,
        endTime: item.endTime,
        timezone,
      })),
    );

    const updated = await Availability.findAll({ order: [['day', 'ASC']] });
    updated.sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day));
    res.json(updated);
  } catch (err) {
    next(err);
  }
};
