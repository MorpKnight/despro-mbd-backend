// src/api/users/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../../controllers/user.controller');
const { protect } = require('../../middlewares/auth.middleware');
const { checkRole } = require('../../middlewares/role.middleware');


const adminOrMaster = [protect, checkRole(['ADMIN', 'MASTERADMIN'])];
const masterAdminOnly = [protect, checkRole(['MASTERADMIN'])];

// Semua user bisa dilihat oleh ADMIN dan MASTERADMIN
router.get('/', adminOrMaster, userController.getAllUsers);
router.get('/:id', adminOrMaster, userController.getUserById);

// Hanya MASTERADMIN bisa membuat user dengan role MASTERADMIN
router.post('/', adminOrMaster, userController.createUser);
router.post('/masteradmin', masterAdminOnly, userController.createMasterAdmin);

// Update dan delete user dengan role MASTERADMIN hanya bisa oleh MASTERADMIN
router.put('/:id', adminOrMaster, userController.updateUser);
router.delete('/:id', adminOrMaster, userController.deleteUser);

module.exports = router;
