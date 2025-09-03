// src/models/emergencyReport.model.js
const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class EmergencyReport extends Model {}

EmergencyReport.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  deskripsi: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('BARU', 'DITINDAKLANJUTI', 'SELESAI'),
    allowNull: false,
    defaultValue: 'BARU'
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'EmergencyReport'
});

module.exports = EmergencyReport;
