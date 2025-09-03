// src/config/database.js

const { Sequelize } = require('sequelize');
const path = require('path');
const logger = require('./logger');

const env = process.env.NODE_ENV || 'development';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: (msg) => logger.debug(msg),
    ssl: process.env.DB_SSLMODE === 'require' ? true : false,
    dialectOptions: {
      ssl: process.env.DB_SSLMODE === 'require' ? { require: true, rejectUnauthorized: false } : false,
      channelBinding: process.env.DB_CHANNELBINDING || undefined
    }
  }
);


async function testConnection(retryCount = 5, delayMs = 3000) {
  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      await sequelize.authenticate();
      logger.info('Database connection has been established successfully.');
      return true;
    } catch (error) {
      logger.error(`Database connection failed (attempt ${attempt}/${retryCount}): ${error.message}`);
      if (attempt < retryCount) {
        logger.info(`Retrying database connection in ${delayMs / 1000} seconds...`);
        await new Promise(res => setTimeout(res, delayMs));
      } else {
        logger.error('Unable to connect to the database after multiple attempts.');
        throw error;
      }
    }
  }
}

module.exports = { sequelize, testConnection };
