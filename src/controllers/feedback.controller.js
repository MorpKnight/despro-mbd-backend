// src/controllers/feedback.controller.js
const CateringLog = require('../models/cateringLog.model');
const Feedback = require('../models/feedback.model');
const { Op } = require('sequelize');

exports.getTodaysMenu = async (req, res) => {
  try {
    const schoolId = req.user.SchoolId;
    const today = new Date().toISOString().slice(0, 10);
    const menu = await CateringLog.findOne({
      where: {
        SchoolId: schoolId,
        tanggal: today
      }
    });
    if (!menu) {
      return res.status(404).json({ message: 'Menu hari ini belum tersedia.' });
    }
    res.json({ menu });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil menu hari ini.', error: err.message });
  }
};

exports.submitFeedback = async (req, res) => {
  try {
    const { cateringLogId, rating, komentar } = req.body;
    const studentId = req.user.id;
    const feedback = await Feedback.create({
      CateringLogId: cateringLogId,
      UserId: studentId,
      rating,
      komentar,
      timestamp: new Date()
    });
    res.status(201).json({ feedback });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengirim feedback.', error: err.message });
  }
};

exports.getMyFeedbackHistory = async (req, res) => {
  try {
    const studentId = req.user.id;
    const feedbacks = await Feedback.findAll({
      where: { UserId: studentId },
      include: [{ model: CateringLog }],
      order: [['timestamp', 'DESC']]
    });
    res.json({ feedbacks });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil riwayat feedback.', error: err.message });
  }
};
