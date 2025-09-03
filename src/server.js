// server.js


require('dotenv').config();

const app = require('./app');
const { testConnection } = require('./config/database');
const logger = require('./config/logger');
const cluster = require('cluster');
const os = require('os');

const PORT = process.env.PORT || 3000;
const numCPUs = os.cpus().length;
const { syncModels } = require('./models');


if (cluster.isMaster) {
  logger.info(`Master process running. Syncing models and forking ${numCPUs} workers...`);
  testConnection(5, 3000)
    .then(() => syncModels())
    .then(() => {
      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }
      cluster.on('exit', (worker, code, signal) => {
        logger.warn(`Worker ${worker.process.pid} died. Restarting...`);
        cluster.fork();
      });
    })
    .catch((err) => {
      logger.error('Master failed to sync DB or models.');
      logger.error('Detail: ' + err.message);
      process.exit(1);
    });
} else {
  testConnection(5, 3000)
    .then(() => {
      app.listen(PORT, () => {
        logger.info(`Worker ${process.pid} running on port ${PORT}`);
      });
    })
    .catch((err) => {
      logger.error('Worker failed to connect to DB.');
      logger.error('Detail: ' + err.message);
      process.exit(1);
    });
}
