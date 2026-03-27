const { Availability } = require('../models');

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

exports.get = async (req, res, next) => {
  try {
    let rows = await Availability.findAll({ order: [['day', 'ASC']] });
    if (rows.length === 0) {
      const defaults = DAYS.map((day, index) => ({
        day,
        isAvailable: index < 5,
        startTime: '09:00',
        endTime: '17:00',
        timezone: 'Asia/Kolkata',
      }));
      rows = await Availability.bulkCreate(defaults);
    }
    rows.sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day));
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { schedule, timezone } = req.body;
    await Promise.all(schedule.map((item) =>
      Availability.update(
        { isAvailable: item.isAvailable, startTime: item.startTime, endTime: item.endTime, timezone },
        { where: { day: item.day } }
      )
    ));
    const updated = await Availability.findAll({ order: [['day', 'ASC']] });
    updated.sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day));
    res.json(updated);
  } catch (err) {
    next(err);
  }
};
