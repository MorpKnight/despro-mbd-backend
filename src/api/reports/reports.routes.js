// src/api/reports/reports.routes.js
const express = require('express');
const router = express.Router();
const reportController = require('../../controllers/report.controller');
const { protect } = require('../../middlewares/auth.middleware');
const { checkRole } = require('../../middlewares/role.middleware');


const sekolahOnly = [protect, checkRole(['SEKOLAH'])];
const adminDinkesOnly = [protect, checkRole(['ADMIN', 'DINKES'])];


/**
 * @swagger
 * /reports/emergency:
 *   post:
 *     summary: Create emergency report (school only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deskripsi:
 *                 type: string
 *           example:
 *             deskripsi: "Suspected food poisoning in class 3A."
 *     responses:
 *       201:
 *         description: Emergency report created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 report:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     deskripsi:
 *                       type: string
 *                     status:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                     SchoolId:
 *                       type: string
 *                     UserId:
 *                       type: string
 *             example:
 *               report:
 *                 id: "uuid-report-1"
 *                 deskripsi: "Suspected food poisoning in class 3A."
 *                 status: "BARU"
 *                 timestamp: "2025-09-03T09:00:00Z"
 *                 SchoolId: "uuid-school-1"
 *                 UserId: "uuid-user-1"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               error: "Invalid token."
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             example:
 *               error: "Forbidden."
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             example:
 *               errors:
 *                 - msg: "Deskripsi is required."
 *                   param: "deskripsi"
 *                   location: "body"
 */
router.post('/emergency', sekolahOnly, reportController.createEmergencyReport);

/**
 * @swagger
 * /reports/emergency/me:
 *   get:
 *     summary: Get emergency reports by my school
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of emergency reports
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reports:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       deskripsi:
 *                         type: string
 *                       status:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                       SchoolId:
 *                         type: string
 *                       UserId:
 *                         type: string
 *             example:
 *               reports:
 *                 - id: "uuid-report-1"
 *                   deskripsi: "Suspected food poisoning in class 3A."
 *                   status: "BARU"
 *                   timestamp: "2025-09-03T09:00:00Z"
 *                   SchoolId: "uuid-school-1"
 *                   UserId: "uuid-user-1"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               error: "Invalid token."
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             example:
 *               error: "Forbidden."
 */
router.get('/emergency/me', sekolahOnly, reportController.getReportsByMySchool);

/**
 * @swagger
 * /reports/emergency:
 *   get:
 *     summary: Get all emergency reports (admin & health office only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by report status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of emergency reports
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 reports:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       deskripsi:
 *                         type: string
 *                       status:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                       SchoolId:
 *                         type: string
 *                       UserId:
 *                         type: string
 *                       school:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           namaSekolah:
 *                             type: string
 *                           alamat:
 *                             type: string
 *                           apiKey:
 *                             type: string
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           namaLengkap:
 *                             type: string
 *                           email:
 *                             type: string
 *                           role:
 *                             type: string
 *             example:
 *               total: 1
 *               page: 1
 *               limit: 10
 *               reports:
 *                 - id: "uuid-report-1"
 *                   deskripsi: "Suspected food poisoning in class 3A."
 *                   status: "BARU"
 *                   timestamp: "2025-09-03T09:00:00Z"
 *                   SchoolId: "uuid-school-1"
 *                   UserId: "uuid-user-1"
 *                   school:
 *                     id: "uuid-school-1"
 *                     namaSekolah: "SMA 1"
 *                     alamat: "Jl. Merdeka 1"
 *                     apiKey: "api-key-123"
 *                   user:
 *                     id: "uuid-user-1"
 *                     namaLengkap: "John Doe"
 *                     email: "john@example.com"
 *                     role: "SISWA"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               error: "Invalid token."
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             example:
 *               error: "Forbidden."
 */
router.get('/emergency', adminDinkesOnly, reportController.getAllEmergencyReports);

/**
 * @swagger
 * /reports/emergency/{id}:
 *   put:
 *     summary: Update emergency report status (admin & health office only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Emergency report UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [BARU, DITINDAKLANJUTI, SELESAI]
 *           example:
 *             status: "DITINDAKLANJUTI"
 *     responses:
 *       200:
 *         description: Emergency report updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 report:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     deskripsi:
 *                       type: string
 *                     status:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                     SchoolId:
 *                       type: string
 *                     UserId:
 *                       type: string
 *             example:
 *               report:
 *                 id: "uuid-report-1"
 *                 deskripsi: "Suspected food poisoning in class 3A."
 *                 status: "DITINDAKLANJUTI"
 *                 timestamp: "2025-09-03T09:00:00Z"
 *                 SchoolId: "uuid-school-1"
 *                 UserId: "uuid-user-1"
 *       404:
 *         description: Report not found
 *         content:
 *           application/json:
 *             example:
 *               error: "Report not found."
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               error: "Invalid token."
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             example:
 *               error: "Forbidden."
 */
router.put('/emergency/:id', adminDinkesOnly, reportController.updateReportStatus);

module.exports = router;
