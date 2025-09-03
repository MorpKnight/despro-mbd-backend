// src/api/dashboard/dashboard.routes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/dashboard.controller');
const { protect } = require('../../middlewares/auth.middleware');
const { checkRole } = require('../../middlewares/role.middleware');

router.get('/school', protect, checkRole(['SEKOLAH']), dashboardController.getSchoolDashboardSummary);
router.get('/catering', protect, checkRole(['KATERING']), dashboardController.getCateringDashboardSummary);
router.get('/admin', protect, checkRole(['ADMIN', 'DINKES']), dashboardController.getAdminDashboardSummary);

module.exports = router;
