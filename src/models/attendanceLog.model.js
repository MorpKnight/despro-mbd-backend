// src/models/attendanceLog.model.js
const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class AttendanceLog extends Model {}

AttendanceLog.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false
  },
  syncTimestamp: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'AttendanceLog'
});

module.exports = AttendanceLog;
