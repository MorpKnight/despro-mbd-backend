// src/controllers/dashboard.controller.js
const User = require('../models/user.model');
const AttendanceLog = require('../models/attendanceLog.model');
const EmergencyReport = require('../models/emergencyReport.model');
const School = require('../models/school.model');
const Feedback = require('../models/feedback.model');
const CateringLog = require('../models/cateringLog.model');
const { Op, fn, col } = require('sequelize');

exports.getSchoolDashboardSummary = async (req, res) => {
  try {
    const schoolId = req.user.SchoolId;
    const today = new Date().toISOString().slice(0, 10);
    // Total siswa di sekolah
    const totalSiswa = await User.count({ where: { SchoolId: schoolId, role: 'SISWA' } });
    // Jumlah absen hari ini
    const sudahAbsen = await AttendanceLog.count({
      where: {
        SchoolId: schoolId,
        timestamp: {
          [Op.gte]: today + ' 00:00:00',
          [Op.lte]: today + ' 23:59:59'
        }
      }
    });
    // Jumlah laporan darurat status BARU
    const laporanBaru = await EmergencyReport.count({ where: { SchoolId: schoolId, status: 'BARU' } });
    res.json({ totalSiswa, sudahAbsen, laporanBaru });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil ringkasan dashboard sekolah.', error: err.message });
  }
};

exports.getCateringDashboardSummary = async (req, res) => {
  try {
    const catererId = req.user.id;
    const today = new Date().toISOString().slice(0, 10);
    // Cari log katering hari ini
    const cateringLog = await CateringLog.findOne({ where: { UserId: catererId, tanggal: today } });
    let rataRataRating = null;
    let jumlahFeedback = 0;
    if (cateringLog) {
      const result = await Feedback.findAll({
        where: { CateringLogId: cateringLog.id },
        attributes: [
          [fn('AVG', col('rating')), 'rataRataRating'],
          [fn('COUNT', col('id')), 'jumlahFeedback']
        ]
      });
      rataRataRating = parseFloat(result[0].get('rataRataRating')) || 0;
      jumlahFeedback = parseInt(result[0].get('jumlahFeedback')) || 0;
    }
    res.json({ rataRataRating, jumlahFeedback });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil ringkasan dashboard katering.', error: err.message });
  }
};

exports.getAdminDashboardSummary = async (req, res) => {
  try {
    const totalSekolah = await School.count();
    const totalPengguna = await User.count();
    const totalLaporanDarurat = await EmergencyReport.count();
    res.json({ totalSekolah, totalPengguna, totalLaporanDarurat });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil ringkasan dashboard admin.', error: err.message });
  }
};
