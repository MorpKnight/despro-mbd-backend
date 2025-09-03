// app.js

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const hpp = require('hpp');

const mainApiRouter = require('./api/routes');
const errorHandler = require('./middlewares/error.middleware');
const logger = require('./config/logger');

// Swagger setup
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'MBG Review & Track API',
			version: '1.0.0',
			description: 'Dokumentasi otomatis API MBG Review & Track',
		},
		servers: [
			{ url: 'http://localhost:3000/v1' },
			{ url: 'https://api.mbg-app.com/v1' }
		],
	},
	apis: ['./src/api/**/*.js', './src/models/*.js'], // bisa ditambah path lain
};
const app = express();

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(express.json());
app.use(xss()); // XSS protection
app.use(hpp()); // HTTP Parameter Pollution protection
app.use(helmet({
	contentSecurityPolicy: false,
	crossOriginResourcePolicy: { policy: "same-site" },
	referrerPolicy: { policy: "no-referrer" }
}));

// CORS whitelist dinamis
const allowedOrigins = [
	'https://nama-domain-frontend-anda.com',
	'https://admin-frontend.com'
];
app.use(cors({
	origin: function (origin, callback) {
		if (!origin || allowedOrigins.includes(origin)) {
			callback(null, true);
		} else {
			callback(new Error('Not allowed by CORS'));
		}
	},
	credentials: true
}));

app.use(morgan('dev'));

// Rate limiter khusus untuk endpoint login & brute force protection
const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 menit
	max: 10, // Maksimal 10 request per IP
	message: 'Terlalu banyak percobaan login, silakan coba lagi setelah 15 menit.'
});
app.use('/v1/auth/login', loginLimiter);

const bruteForceLimiter = rateLimit({
	windowMs: 10 * 60 * 1000, // 10 menit
	max: 100, // Maksimal 100 request per IP
	message: 'Terlalu banyak request, silakan coba lagi nanti.'
});
app.use(bruteForceLimiter);

// Audit log untuk aksi sensitif (contoh sederhana)
app.use((req, res, next) => {
	if (["POST", "PUT", "DELETE"].includes(req.method)) {
		logger.info(`AUDIT: ${req.method} ${req.originalUrl} by ${req.user ? req.user.email : 'anonymous'}`);
	}
	next();
});

// Daftarkan router utama dengan prefix /v1
app.use('/v1', mainApiRouter);

// Route 404 Not Found

app.use((req, res, next) => {
	logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
	res.status(404).json({ message: 'Not Found' });
});

// Secure cookies (jika pakai cookie/session)
// app.use(cookieParser());
// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: true, httpOnly: true, sameSite: 'strict' }
// }));

// Error handling terpusat
app.use(errorHandler);

module.exports = app;
