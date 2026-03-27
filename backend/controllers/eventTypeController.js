const { EventType } = require('../models');

exports.getAll = async (req, res, next) => {
  try {
    const events = await EventType.findAll({ order: [['createdAt', 'DESC']] });
    res.json(events);
  } catch (err) {
    next(err);
  }
};

exports.getBySlug = async (req, res, next) => {
  try {
    const event = await EventType.findOne({
      where: { slug: req.params.slug, isActive: true },
    });
    if (!event) return res.status(404).json({ error: 'Event type not found' });
    res.json(event);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const event = await EventType.create(req.body);
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const event = await EventType.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event type not found' });
    await event.update(req.body);
    res.json(event);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const event = await EventType.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event type not found' });
    await event.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    next(err);
  }
};
