// src/controllers/attendance.controller.js
const User = require('../models/user.model');
const AttendanceLog = require('../models/attendanceLog.model');

exports.syncAttendance = async (req, res) => {
  const logs = req.body.logs;
  const school = req.school;
  if (!Array.isArray(logs) || logs.length === 0) {
    return res.status(400).json({ message: 'No logs provided.' });
  }
  try {
    const attendanceData = await Promise.all(logs.map(async (log) => {
      const user = await User.findOne({ where: { nfcTagId: log.nfcTagId } });
      if (!user) return null;
      return {
        timestamp: log.timestamp,
        SchoolId: school.id,
        UserId: user.id
      };
    }));
    const filteredData = attendanceData.filter(Boolean);
    if (filteredData.length === 0) {
      return res.status(404).json({ message: 'No valid attendance logs found.' });
    }
    await AttendanceLog.bulkCreate(filteredData);
    res.status(201).json({ message: 'Attendance logs synced successfully.', count: filteredData.length });
  } catch (err) {
    res.status(500).json({ message: 'Failed to sync attendance logs.', error: err.message });
  }
};
