// src/api/attendance/attendance.routes.js
const express = require('express');
const router = express.Router();
const attendanceController = require('../../controllers/attendance.controller');
const { verifyApiKey } = require('../../middlewares/apiKey.middleware');

router.post('/sync', verifyApiKey, attendanceController.syncAttendance);

module.exports = router;
