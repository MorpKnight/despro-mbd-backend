// src/api/auth/auth.routes.js
const express = require('express');
const router = express.Router();

const authController = require('../../controllers/auth.controller');
const { protect } = require('../../middlewares/auth.middleware');
const { validateRegister, validateLogin } = require('../../validators/auth.validator');
const runValidation = require('../../middlewares/validation.middleware');

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               namaLengkap:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *               nfcTagId:
 *                 type: string
 *               schoolId:
 *                 type: string
 *           example:
 *             namaLengkap: "John Doe"
 *             email: "john@example.com"
 *             password: "password123"
 *             role: "SISWA"
 *             nfcTagId: "1234567890"
 *             schoolId: "uuid-school-1"
 *     responses:
 *       201:
 *         description: User registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     namaLengkap:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *             example:
 *               token: "jwt.token.here"
 *               user:
 *                 id: "uuid-user-1"
 *                 namaLengkap: "John Doe"
 *                 email: "john@example.com"
 *                 role: "SISWA"
 *       400:
 *         description: Email already registered
 *         content:
 *           application/json:
 *             example:
 *               error: "Email already registered."
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             example:
 *               errors:
 *                 - msg: "Email is invalid."
 *                   param: "email"
 *                   location: "body"
 */
router.post('/register', validateRegister, runValidation, authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login and get JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *           example:
 *             email: "john@example.com"
 *             password: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     namaLengkap:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *             example:
 *               token: "jwt.token.here"
 *               user:
 *                 id: "uuid-user-1"
 *                 namaLengkap: "John Doe"
 *                 email: "john@example.com"
 *                 role: "SISWA"
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             example:
 *               error: "Invalid email or password."
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             example:
 *               errors:
 *                 - msg: "Email is required."
 *                   param: "email"
 *                   location: "body"
 */
router.post('/login', validateLogin, runValidation, authController.login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get profile of logged-in user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     namaLengkap:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     nfcTagId:
 *                       type: string
 *             example:
 *               user:
 *                 id: "uuid-user-1"
 *                 namaLengkap: "John Doe"
 *                 email: "john@example.com"
 *                 role: "SISWA"
 *                 nfcTagId: "1234567890"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               error: "Invalid token."
 */
router.get('/me', protect, authController.getProfile);

module.exports = router;
