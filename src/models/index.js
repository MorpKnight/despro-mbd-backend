// src/models/index.js
const User = require('./user.model');
const School = require('./school.model');
const AttendanceLog = require('./attendanceLog.model');
const CateringLog = require('./cateringLog.model');
const Feedback = require('./feedback.model');
const EmergencyReport = require('./emergencyReport.model');
const { sequelize } = require('../config/database');

// Definisikan asosiasi antar model
School.hasMany(User, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
User.belongsTo(School, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });

User.hasMany(AttendanceLog, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
AttendanceLog.belongsTo(User, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });

School.hasMany(AttendanceLog, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
AttendanceLog.belongsTo(School, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });

// Tambahkan asosiasi lain sesuai kebutuhan desain
// Contoh: Feedback, CateringLog, EmergencyReport bisa dihubungkan ke User/School jika diperlukan

async function syncModels() {
  await sequelize.sync({ alter: true });
  console.log('All models were synchronized successfully.');
}

module.exports = {
  sequelize,
  User,
  School,
  AttendanceLog,
  CateringLog,
  Feedback,
  EmergencyReport,
  syncModels
};
