// routes.js
// Menggabungkan semua router dari folder api

const express = require('express');
const router = express.Router();


// Gabungkan router auth
router.use('/auth', require('./auth/auth.routes'));
router.use('/attendance', require('./attendance/attendance.routes'));
router.use('/users', require('./users/user.routes'));

router.use('/catering', require('./catering/catering.routes'));

router.use('/feedback', require('./feedback/feedback.routes'));

router.use('/reports', require('./reports/reports.routes'));
router.use('/dashboard', require('./dashboard/dashboard.routes'));

module.exports = router;
