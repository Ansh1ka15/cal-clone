const { Schedule, Availability, Override } = require('../models');

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

const createDefaultDays = (scheduleId, timezone = 'Europe/London') => {
  return DAYS.map((day, index) => ({
    scheduleId,
    day,
    isAvailable: index < 5,
    startTime: '09:00',
    endTime: '17:00',
    timezone,
  }));
};

exports.getAll = async (req, res, next) => {
  try {
    let schedules = await Schedule.findAll({
      order: [['createdAt', 'ASC']],
      include: [{ model: Availability, as: 'availabilities' }],
    });
    // Create default if none exists
    if (schedules.length === 0) {
      const defaultSchedule = await Schedule.create({
        name: 'Working hours',
        isDefault: true,
      });
      await Availability.bulkCreate(createDefaultDays(defaultSchedule.id));
      schedules = await Schedule.findAll({
        order: [['createdAt', 'ASC']],
        include: [{ model: Availability, as: 'availabilities' }],
      });
    }

    const output = schedules.map(schedule => {
      const grouped = DAYS.map(day => {
        const daySlots = schedule.availabilities.filter(r => r.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
        return {
          day,
          isAvailable: daySlots.length > 0 && daySlots[0].isAvailable,
          slots: daySlots.length > 0 && daySlots[0].isAvailable ? daySlots.map(r => ({ startTime: r.startTime, endTime: r.endTime })) : [{ startTime: "09:00", endTime: "17:00" }],
        };
      });
      return { ...schedule.toJSON(), availabilities: grouped };
    });

    res.json(output);
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const schedule = await Schedule.findByPk(req.params.id, {
      include: [
        { model: Availability, as: 'availabilities' },
        { model: Override, as: 'overrides' }
      ],
    });
    if (!schedule) return res.status(404).json({ error: "Schedule not found" });
    
    // Group slots by day
    const grouped = DAYS.map(day => {
      const daySlots = schedule.availabilities.filter(r => r.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
      return {
        day,
        isAvailable: daySlots.length > 0 && daySlots[0].isAvailable,
        slots: daySlots.length > 0 && daySlots[0].isAvailable ? daySlots.map(r => ({ startTime: r.startTime, endTime: r.endTime })) : [{ startTime: "09:00", endTime: "17:00" }],
      };
    });
    
    res.json({ ...schedule.toJSON(), availabilities: grouped, overrides: schedule.overrides || [] });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name } = req.body;
    let isDefault = false;
    const count = await Schedule.count();
    if (count === 0) isDefault = true;

    const schedule = await Schedule.create({
      name: name || 'Working hours',
      isDefault,
    });
    // Add default days
    await Availability.bulkCreate(createDefaultDays(schedule.id));
    res.status(201).json(schedule);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const schedule = await Schedule.findByPk(req.params.id);
    if (!schedule) return res.status(404).json({ error: "Schedule not found" });

    const { name, isDefault, timezone, availabilities, overrides } = req.body;

    if (isDefault && !schedule.isDefault) {
      // Unset any current default
      await Schedule.update({ isDefault: false }, { where: { isDefault: true } });
    }

    await schedule.update({ 
      name: name !== undefined ? name : schedule.name,
      isDefault: isDefault !== undefined ? isDefault : schedule.isDefault,
      timezone: timezone !== undefined ? timezone : schedule.timezone,
    });

    if (availabilities && Array.isArray(availabilities)) {
      // Recreate availabilities
      await Availability.destroy({ where: { scheduleId: schedule.id } });
      const flatAvailabilities = [];
      availabilities.forEach(a => {
        if (!a.isAvailable || !a.slots || a.slots.length === 0) {
          flatAvailabilities.push({
            scheduleId: schedule.id,
            day: a.day,
            isAvailable: false,
            startTime: '09:00',
            endTime: '17:00',
            timezone: schedule.timezone,
          });
        } else {
          a.slots.forEach(slot => {
            flatAvailabilities.push({
              scheduleId: schedule.id,
              day: a.day,
              isAvailable: true,
              startTime: slot.startTime,
              endTime: slot.endTime,
              timezone: schedule.timezone,
            });
          });
        }
      });
      await Availability.bulkCreate(flatAvailabilities);
    }

    if (overrides && Array.isArray(overrides)) {
      await Override.destroy({ where: { scheduleId: schedule.id } });
      await Override.bulkCreate(overrides.map(o => ({
        scheduleId: schedule.id,
        date: o.date,
        isAvailable: o.isAvailable,
        slots: o.slots || []
      })));
    }

    res.json(schedule);
  } catch (err) {
    next(err);
  }
};

exports.duplicate = async (req, res, next) => {
  try {
    const original = await Schedule.findByPk(req.params.id, {
      include: [
        { model: Availability, as: 'availabilities' },
        { model: Override, as: 'overrides' }
      ]
    });
    
    if (!original) return res.status(404).json({ error: "Schedule not found" });

    // Create the new schedule
    const clone = await Schedule.create({
      name: `${original.name} (Copy)`,
      timezone: original.timezone,
      isDefault: false
    });

    // Copy availabilities
    const newAvails = (original.availabilities || []).map(a => ({
      scheduleId: clone.id,
      day: a.day,
      isAvailable: a.isAvailable,
      startTime: a.startTime,
      endTime: a.endTime,
      timezone: clone.timezone
    }));
    if (newAvails.length > 0) {
      await Availability.bulkCreate(newAvails);
    }
    
    // Copy overrides
    const newOverrides = (original.overrides || []).map(o => ({
      scheduleId: clone.id,
      date: o.date,
      isAvailable: o.isAvailable,
      slots: o.slots
    }));
    if (newOverrides.length > 0) {
      await Override.bulkCreate(newOverrides);
    }

    res.json(clone);

  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const schedule = await Schedule.findByPk(req.params.id);
    if (!schedule) return res.status(404).json({ error: "Schedule not found" });
    if (schedule.isDefault) return res.status(400).json({ error: "Cannot delete the default schedule" });
    
    await schedule.destroy();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
