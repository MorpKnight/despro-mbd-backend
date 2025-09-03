// src/controllers/catering.controller.js
const CateringLog = require('../models/cateringLog.model');
const School = require('../models/school.model');

exports.createCateringLog = async (req, res) => {
  try {
    const { schoolId, tanggal, deskripsiMenu, fotoMenuUrl, catatan } = req.body;
    const catererId = req.user.id;
    const log = await CateringLog.create({
      tanggal,
      deskripsiMenu,
      fotoMenuUrl,
      catatan,
      SchoolId: schoolId,
      UserId: catererId
    });
    res.status(201).json({ log });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create catering log.', error: err.message });
  }
};

exports.getLogsByCaterer = async (req, res) => {
  const catererId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  try {
    const { count, rows } = await CateringLog.findAndCountAll({
      where: { UserId: catererId },
      include: [{ model: School }],
      offset,
      limit
    });
    res.json({ total: count, page, limit, logs: rows });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch catering logs.', error: err.message });
  }
};
