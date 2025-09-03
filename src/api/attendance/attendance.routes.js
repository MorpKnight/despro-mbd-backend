// src/api/attendance/attendance.routes.js
const express = require('express');
const router = express.Router();
const attendanceController = require('../../controllers/attendance.controller');
const { verifyApiKey } = require('../../middlewares/apiKey.middleware');

/**
 * @swagger
 * /attendance/sync:
 *   post:
 *     summary: Sync attendance logs from device
 *     tags: [Attendance]
 *     parameters:
 *       - in: header
 *         name: X-API-KEY
 *         required: true
 *         schema:
 *           type: string
 *         description: School API Key
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               logs:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     nfcTagId:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *           example:
 *             logs:
 *               - nfcTagId: "1234567890"
 *                 timestamp: "2025-09-03T07:30:00Z"
 *               - nfcTagId: "0987654321"
 *                 timestamp: "2025-09-03T07:35:00Z"
 *     responses:
 *       201:
 *         description: Attendance logs synced
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 count:
 *                   type: integer
 *             example:
 *               message: "Attendance logs synced successfully."
 *               count: 2
 *       403:
 *         description: Invalid API Key
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "API key required."
 *       404:
 *         description: No valid attendance logs found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "No valid attendance logs found."
 */
router.post('/sync', verifyApiKey, attendanceController.syncAttendance);

module.exports = router;
