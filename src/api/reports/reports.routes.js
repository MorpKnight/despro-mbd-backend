// src/api/reports/reports.routes.js
const express = require('express');
const router = express.Router();
const reportController = require('../../controllers/report.controller');
const { protect } = require('../../middlewares/auth.middleware');
const { checkRole } = require('../../middlewares/role.middleware');


const sekolahOnly = [protect, checkRole(['SEKOLAH'])];
const adminDinkesOnly = [protect, checkRole(['ADMIN', 'DINKES'])];


router.post('/emergency', sekolahOnly, reportController.createEmergencyReport);
router.get('/emergency/me', sekolahOnly, reportController.getReportsByMySchool);

router.get('/emergency', adminDinkesOnly, reportController.getAllEmergencyReports);
router.put('/emergency/:id', adminDinkesOnly, reportController.updateReportStatus);

module.exports = router;
