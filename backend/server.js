const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { sequelize } = require('./models');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
  ],
  credentials: true
}));
app.use(express.json());

app.use('/api/event-types', require('./routes/eventTypes'));
app.use('/api/availability', require('./routes/availability'));
app.use('/api/bookings', require('./routes/bookings'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true })
  .then(() => {
    console.log('PostgreSQL synced');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('DB connection failed:', err);
    process.exit(1);
  });
