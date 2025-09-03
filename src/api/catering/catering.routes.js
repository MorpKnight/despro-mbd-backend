// src/api/catering/catering.routes.js
const express = require('express');
const router = express.Router();
const cateringController = require('../../controllers/catering.controller');
const { protect } = require('../../middlewares/auth.middleware');
const { checkRole } = require('../../middlewares/role.middleware');

const cateringOnly = [protect, checkRole(['KATERING'])];

router.post('/', cateringOnly, cateringController.createCateringLog);
router.get('/me', cateringOnly, cateringController.getLogsByCaterer);

module.exports = router;
