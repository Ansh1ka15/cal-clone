module.exports = (err, req, res, next) => {
  console.error(err.stack || err);

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ error: err.errors.map((e) => e.message).join(', ') });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ error: 'A record with that value already exists.' });
  }

  res.status(500).json({ error: err.message || 'Internal server error' });
};
