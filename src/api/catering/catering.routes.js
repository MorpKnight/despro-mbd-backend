// src/api/catering/catering.routes.js
const express = require('express');
const router = express.Router();
const cateringController = require('../../controllers/catering.controller');
const { protect } = require('../../middlewares/auth.middleware');
const { checkRole } = require('../../middlewares/role.middleware');

const cateringOnly = [protect, checkRole(['KATERING'])];

router.post('/', cateringOnly, cateringController.createCateringLog);
router.get('/me', cateringOnly, cateringController.getLogsByCaterer);

/**
 * @swagger
 * /catering:
 *   post:
 *     summary: Create daily catering log
 *     tags: [Catering]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               schoolId:
 *                 type: string
 *               tanggal:
 *                 type: string
 *                 format: date
 *               deskripsiMenu:
 *                 type: string
 *               fotoMenuUrl:
 *                 type: string
 *               catatan:
 *                 type: string
 *           example:
 *             schoolId: "uuid-school-1"
 *             tanggal: "2025-09-03"
 *             deskripsiMenu: "Nasi Goreng, Ayam Bakar, Sayur Asem"
 *             fotoMenuUrl: "https://example.com/menu.jpg"
 *             catatan: "Spicy"
 *     responses:
 *       201:
 *         description: Catering log created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 log:
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
 *               log:
 *                 id: "uuid-log-1"
 *                 tanggal: "2025-09-03"
 *                 deskripsiMenu: "Nasi Goreng, Ayam Bakar, Sayur Asem"
 *                 fotoMenuUrl: "https://example.com/menu.jpg"
 *                 catatan: "Spicy"
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
 *                 - msg: "Tanggal is required."
 *                   param: "tanggal"
 *                   location: "body"
 */
router.post('/', cateringOnly, cateringController.createCateringLog);

/**
 * @swagger
 * /catering/me:
 *   get:
 *     summary: Get catering logs by logged-in caterer
 *     tags: [Catering]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: List of catering logs
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
 *                 logs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       tanggal:
 *                         type: string
 *                       deskripsiMenu:
 *                         type: string
 *                       fotoMenuUrl:
 *                         type: string
 *                       catatan:
 *                         type: string
 *                       SchoolId:
 *                         type: string
 *                       UserId:
 *                         type: string
 *             example:
 *               total: 1
 *               page: 1
 *               limit: 10
 *               logs:
 *                 - id: "uuid-log-1"
 *                   tanggal: "2025-09-03"
 *                   deskripsiMenu: "Nasi Goreng, Ayam Bakar, Sayur Asem"
 *                   fotoMenuUrl: "https://example.com/menu.jpg"
 *                   catatan: "Spicy"
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
router.get('/me', cateringOnly, cateringController.getLogsByCaterer);

module.exports = router;
