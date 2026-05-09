const express = require('express');
const cors = require('cors');
const path = require('path');
const { errorMiddleware } = require('./middlewares/errorMiddleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/packages', require('./routes/packageRoutes'));
app.use('/api/ship-requests', require('./routes/shipRequestRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Ship2Aruba API' });
});

// Error Middleware
app.use(errorMiddleware);

module.exports = app;
