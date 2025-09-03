// src/api/auth/auth.routes.js
const express = require('express');
const router = express.Router();

const authController = require('../../controllers/auth.controller');
const { protect } = require('../../middlewares/auth.middleware');
const { validateRegister, validateLogin } = require('../../validators/auth.validator');
const runValidation = require('../../middlewares/validation.middleware');

router.post('/register', validateRegister, runValidation, authController.register);
router.post('/login', validateLogin, runValidation, authController.login);
router.get('/me', protect, authController.getProfile);

module.exports = router;
