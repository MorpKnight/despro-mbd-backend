// src/api/dashboard/dashboard.routes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/dashboard.controller');
const { protect } = require('../../middlewares/auth.middleware');
const { checkRole } = require('../../middlewares/role.middleware');

/**
 * @swagger
 * /dashboard/school:
 *   get:
 *     summary: Get school dashboard summary
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: School dashboard summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalSiswa:
 *                   type: integer
 *                 sudahAbsen:
 *                   type: integer
 *                 laporanBaru:
 *                   type: integer
 *             example:
 *               totalSiswa: 120
 *               sudahAbsen: 110
 *               laporanBaru: 2
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
router.get('/school', protect, checkRole(['SEKOLAH']), dashboardController.getSchoolDashboardSummary);

/**
 * @swagger
 * /dashboard/catering:
 *   get:
 *     summary: Get catering dashboard summary
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Catering dashboard summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rataRataRating:
 *                   type: number
 *                 jumlahFeedback:
 *                   type: integer
 *             example:
 *               rataRataRating: 4.7
 *               jumlahFeedback: 35
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
router.get('/catering', protect, checkRole(['KATERING']), dashboardController.getCateringDashboardSummary);

/**
 * @swagger
 * /dashboard/admin:
 *   get:
 *     summary: Get admin dashboard summary
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalSekolah:
 *                   type: integer
 *                 totalPengguna:
 *                   type: integer
 *                 totalLaporanDarurat:
 *                   type: integer
 *             example:
 *               totalSekolah: 10
 *               totalPengguna: 500
 *               totalLaporanDarurat: 7
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
router.get('/admin', protect, checkRole(['ADMIN', 'DINKES']), dashboardController.getAdminDashboardSummary);

module.exports = router;
