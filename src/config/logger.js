// src/config/logger.js
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize } = format;

const env = process.env.NODE_ENV || 'development';

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    logFormat
  ),
  transports: [
    new transports.Console({
      format: combine(
        colorize(),
        timestamp(),
        logFormat
      ),
      level: env === 'development' ? 'debug' : 'info'
    })
  ]
});

if (env === 'production') {
  logger.add(new transports.File({ filename: 'error.log', level: 'error' }));
  logger.add(new transports.File({ filename: 'combined.log' }));
}

module.exports = logger;
