// src/api/users/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../../controllers/user.controller');
const { protect } = require('../../middlewares/auth.middleware');
const { checkRole } = require('../../middlewares/role.middleware');

const adminOnly = [protect, checkRole(['ADMIN'])];

router.get('/', adminOnly, userController.getAllUsers);
router.post('/', adminOnly, userController.createUser);
router.get('/:id', adminOnly, userController.getUserById);
router.put('/:id', adminOnly, userController.updateUser);
router.delete('/:id', adminOnly, userController.deleteUser);

module.exports = router;
