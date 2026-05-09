require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const seedAdmin = require('./util/seedAdmin');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await seedAdmin();

  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer();
