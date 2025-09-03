// src/controllers/report.controller.js

const EmergencyReport = require('../models/emergencyReport.model');
const School = require('../models/school.model');
const User = require('../models/user.model');

exports.createEmergencyReport = async (req, res) => {
  try {
    const { deskripsi } = req.body;
    const schoolId = req.user.SchoolId;
    const reporterId = req.user.id;
    const report = await EmergencyReport.create({
      deskripsi,
      status: 'BARU',
      timestamp: new Date(),
      SchoolId: schoolId,
      UserId: reporterId
    });
    res.status(201).json({ report });
  } catch (err) {
    res.status(500).json({ message: 'Gagal membuat laporan darurat.', error: err.message });
  }
};


exports.getReportsByMySchool = async (req, res) => {
  try {
    const schoolId = req.user.SchoolId;
    const reports = await EmergencyReport.findAll({
      where: { SchoolId: schoolId },
      order: [['timestamp', 'DESC']]
    });
    res.json({ reports });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil riwayat laporan.', error: err.message });
  }
};

// Untuk Admin dan DINKES
exports.getAllEmergencyReports = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const status = req.query.status;
  const where = status ? { status } : {};
  try {
    const { count, rows } = await EmergencyReport.findAndCountAll({
      where,
      include: [
        { model: School },
        { model: User }
      ],
      order: [['timestamp', 'DESC']],
      offset,
      limit
    });
    res.json({ total: count, page, limit, reports: rows });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil semua laporan darurat.', error: err.message });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    const report = await EmergencyReport.findByPk(id);
    if (!report) return res.status(404).json({ message: 'Laporan tidak ditemukan.' });
    report.status = status;
    await report.save();
    res.json({ report });
  } catch (err) {
    res.status(500).json({ message: 'Gagal memperbarui status laporan.', error: err.message });
  }
};
