const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { sequelize } = require('./models');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173",
      "https://cal-clone-rho.vercel.app"
    ];

    if (!origin || allowedOrigins.includes(origin) || origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
      callback(null, true);
    } else {
      console.error(`Blocked origin by CORS: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));

app.use('/api/event-types', require('./routes/eventTypes'));
app.use('/api/schedules', require('./routes/schedules'));
app.use('/api/availability', require('./routes/availability'));
app.use('/api/bookings', require('./routes/bookings'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

const PORT = process.env.PORT || 5001;

sequelize.sync({ alter: true })
  .then(() => {
    console.log('PostgreSQL synced');
    const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Stop any other running backend processes and try again.`);
        process.exit(1);
      }
      console.error('Server error:', err);
      process.exit(1);
    });

    const shutdown = () => {
      server.close(() => process.exit(0));
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  })
  .catch((err) => {
    console.error('DB connection failed:', err);
    process.exit(1);
  });