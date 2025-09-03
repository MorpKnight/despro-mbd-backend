// server.js


require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./config/database');
const logger = require('./config/logger');

const PORT = process.env.PORT || 3000;

// Test koneksi database dan sinkronisasi model sebelum server berjalan
const { syncModels } = require('./models');

testConnection()
  .then(() => syncModels())
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('Server not started due to DB connection or sync error.');
    process.exit(1);
  });
