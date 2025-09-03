// src/api/feedback/feedback.routes.js
const express = require('express');
const router = express.Router();
const feedbackController = require('../../controllers/feedback.controller');
const { protect } = require('../../middlewares/auth.middleware');
const { checkRole } = require('../../middlewares/role.middleware');

const siswaOnly = [protect, checkRole(['SISWA'])];

router.get('/menu/today', siswaOnly, feedbackController.getTodaysMenu);
router.post('/', siswaOnly, feedbackController.submitFeedback);
router.get('/me', siswaOnly, feedbackController.getMyFeedbackHistory);

/**
 * @swagger
 * /feedback/menu/today:
 *   get:
 *     summary: Get today's catering menu for student's school
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Today's menu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 menu:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     tanggal:
 *                       type: string
 *                     deskripsiMenu:
 *                       type: string
 *                     fotoMenuUrl:
 *                       type: string
 *                     catatan:
 *                       type: string
 *                     SchoolId:
 *                       type: string
 *                     UserId:
 *                       type: string
 *             example:
 *               menu:
 *                 id: "uuid-log-1"
 *                 tanggal: "2025-09-03"
 *                 deskripsiMenu: "Nasi Goreng, Ayam Bakar, Sayur Asem"
 *                 fotoMenuUrl: "https://example.com/menu.jpg"
 *                 catatan: "Spicy"
 *                 SchoolId: "uuid-school-1"
 *                 UserId: "uuid-user-1"
 *       404:
 *         description: Menu not available
 *         content:
 *           application/json:
 *             example:
 *               message: "Menu hari ini belum tersedia."
 */
router.get('/menu/today', siswaOnly, feedbackController.getTodaysMenu);

/**
 * @swagger
 * /feedback:
 *   post:
 *     summary: Submit feedback for today's menu
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cateringLogId:
 *                 type: string
 *               rating:
 *                 type: integer
 *               komentar:
 *                 type: string
 *           example:
 *             cateringLogId: "uuid-log-1"
 *             rating: 5
 *             komentar: "Delicious!"
 *     responses:
 *       201:
 *         description: Feedback submitted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 feedback:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     rating:
 *                       type: integer
 *                     komentar:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                     CateringLogId:
 *                       type: string
 *                     UserId:
 *                       type: string
 *             example:
 *               feedback:
 *                 id: "uuid-feedback-1"
 *                 rating: 5
 *                 komentar: "Delicious!"
 *                 timestamp: "2025-09-03T08:00:00Z"
 *                 CateringLogId: "uuid-log-1"
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
 *                 - msg: "Rating is required."
 *                   param: "rating"
 *                   location: "body"
 */
router.post('/', siswaOnly, feedbackController.submitFeedback);

/**
 * @swagger
 * /feedback/me:
 *   get:
 *     summary: Get feedback history for logged-in student
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of feedbacks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 feedbacks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       rating:
 *                         type: integer
 *                       komentar:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                       CateringLogId:
 *                         type: string
 *                       UserId:
 *                         type: string
 *                       cateringLog:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           tanggal:
 *                             type: string
 *                           deskripsiMenu:
 *                             type: string
 *                           fotoMenuUrl:
 *                             type: string
 *                           catatan:
 *                             type: string
 *                           SchoolId:
 *                             type: string
 *                           UserId:
 *                             type: string
 *             example:
 *               feedbacks:
 *                 - id: "uuid-feedback-1"
 *                   rating: 5
 *                   komentar: "Delicious!"
 *                   timestamp: "2025-09-03T08:00:00Z"
 *                   CateringLogId: "uuid-log-1"
 *                   UserId: "uuid-user-1"
 *                   cateringLog:
 *                     id: "uuid-log-1"
 *                     tanggal: "2025-09-03"
 *                     deskripsiMenu: "Nasi Goreng, Ayam Bakar, Sayur Asem"
 *                     fotoMenuUrl: "https://example.com/menu.jpg"
 *                     catatan: "Spicy"
 *                     SchoolId: "uuid-school-1"
 *                     UserId: "uuid-user-1"
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
router.get('/me', siswaOnly, feedbackController.getMyFeedbackHistory);

module.exports = router;
