// app.js

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const mainApiRouter = require('./api/routes');
const errorHandler = require('./middlewares/error.middleware');
const logger = require('./config/logger');

const app = express();


app.use(express.json());
app.use(helmet());
app.use(cors({ origin: 'https://nama-domain-frontend-anda.com' }));
app.use(morgan('dev'));

// Rate limiter khusus untuk endpoint login
const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 menit
	max: 10, // Maksimal 10 request per IP
	message: 'Terlalu banyak percobaan login, silakan coba lagi setelah 15 menit.'
});
app.use('/v1/auth/login', loginLimiter);

// Gunakan routes utama

// Daftarkan router utama dengan prefix /v1
app.use('/v1', mainApiRouter);

// Route 404 Not Found

app.use((req, res, next) => {
	logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
	res.status(404).json({ message: 'Not Found' });
});

// Error handling terpusat
app.use(errorHandler);

module.exports = app;
