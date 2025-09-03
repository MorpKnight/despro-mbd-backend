// src/config/database.js

const { Sequelize } = require('sequelize');
const path = require('path');
const logger = require('./logger');

const env = process.env.NODE_ENV || 'development';
let sequelize;

if (env === 'production') {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      dialect: process.env.DB_DIALECT || 'postgres',
      logging: (msg) => logger.debug(msg)
    }
  );
} else {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.resolve(__dirname, '../../mbg_dev.db'),
    logging: (msg) => logger.debug(msg)
  });
}

async function testConnection() {
  try {
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');
  } catch (error) {
    logger.error('Unable to connect to the database: ' + error.message);
    throw error;
  }
}

module.exports = { sequelize, testConnection };
