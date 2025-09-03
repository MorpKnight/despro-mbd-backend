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

module.exports = router;
