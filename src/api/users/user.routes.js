// src/api/users/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../../controllers/user.controller');
const { protect } = require('../../middlewares/auth.middleware');
const { checkRole } = require('../../middlewares/role.middleware');


const adminOrMaster = [protect, checkRole(['ADMIN', 'MASTERADMIN'])];
const masterAdminOnly = [protect, checkRole(['MASTERADMIN'])];

// Semua user bisa dilihat oleh ADMIN dan MASTERADMIN
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (paginated)
 *     tags: [Users]
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
 *         description: List of users
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
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *             example:
 *               total: 2
 *               page: 1
 *               limit: 10
 *               users:
 *                 - id: "uuid-user-1"
 *                   namaLengkap: "John Doe"
 *                   email: "john@example.com"
 *                   role: "SISWA"
 *                 - id: "uuid-user-2"
 *                   namaLengkap: "Jane Smith"
 *                   email: "jane@example.com"
 *                   role: "ADMIN"
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
 *               error: "Forbidden. Insufficient role."
 */
router.get('/', adminOrMaster, userController.getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User UUID
 *     responses:
 *       200:
 *         description: User detail
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *             example:
 *               user:
 *                 id: "uuid-user-1"
 *                 namaLengkap: "John Doe"
 *                 email: "john@example.com"
 *                 role: "SISWA"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               error: "User not found."
 */
router.get('/:id', adminOrMaster, userController.getUserById);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user (not MASTERADMIN)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *           example:
 *             namaLengkap: "John Doe"
 *             email: "john@example.com"
 *             password: "password123"
 *             role: "SISWA"
 *             nfcTagId: "1234567890"
 *             schoolId: "uuid-school-1"
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *             example:
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
router.post('/', adminOrMaster, userController.createUser);

/**
 * @swagger
 * /users/masteradmin:
 *   post:
 *     summary: Create a MASTERADMIN user (MASTERADMIN only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
 *           example:
 *             namaLengkap: "Super Admin"
 *             email: "admin@example.com"
 *             password: "supersecret"
 *     responses:
 *       201:
 *         description: MASTERADMIN user created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *             example:
 *               user:
 *                 id: "uuid-user-2"
 *                 namaLengkap: "Super Admin"
 *                 email: "admin@example.com"
 *                 role: "MASTERADMIN"
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
router.post('/masteradmin', masterAdminOnly, userController.createMasterAdmin);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *           example:
 *             namaLengkap: "John Doe Updated"
 *             email: "john.updated@example.com"
 *             password: "newpassword123"
 *             role: "SISWA"
 *             nfcTagId: "1234567890"
 *             schoolId: "uuid-school-1"
 *     responses:
 *       200:
 *         description: User updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *             example:
 *               user:
 *                 id: "uuid-user-1"
 *                 namaLengkap: "John Doe Updated"
 *                 email: "john.updated@example.com"
 *                 role: "SISWA"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               error: "User not found."
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             example:
 *               error: "Forbidden. Only MASTERADMIN can update MASTERADMIN user."
 */
router.put('/:id', adminOrMaster, userController.updateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User UUID
 *     responses:
 *       200:
 *         description: User deleted
 *         content:
 *           application/json:
 *             example:
 *               message: "User deleted."
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               error: "User not found."
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             example:
 *               error: "Forbidden. Only MASTERADMIN can delete MASTERADMIN user."
 */
router.delete('/:id', adminOrMaster, userController.deleteUser);

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: User UUID
 *         namaLengkap:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *           description: Hashed password
 *         role:
 *           type: string
 *           enum: [MASTERADMIN, ADMIN, SISWA, SEKOLAH, KATERING, DINKES]
 *         nfcTagId:
 *           type: string
 *         SchoolId:
 *           type: string
 *           description: School UUID
 *     School:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: School UUID
 *         namaSekolah:
 *           type: string
 *         alamat:
 *           type: string
 *         apiKey:
 *           type: string
 *           description: School API Key
 *     CateringLog:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         tanggal:
 *           type: string
 *           format: date
 *         deskripsiMenu:
 *           type: string
 *         fotoMenuUrl:
 *           type: string
 *         catatan:
 *           type: string
 *         SchoolId:
 *           type: string
 *         UserId:
 *           type: string
 *     Feedback:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         rating:
 *           type: integer
 *         komentar:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 *         CateringLogId:
 *           type: string
 *         UserId:
 *           type: string
 *     EmergencyReport:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         deskripsi:
 *           type: string
 *         status:
 *           type: string
 *           enum: [BARU, DITINDAKLANJUTI, SELESAI]
 *         timestamp:
 *           type: string
 *           format: date-time
 *         SchoolId:
 *           type: string
 *         UserId:
 *           type: string
 */

module.exports = router;
