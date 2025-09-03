// src/models/cateringLog.model.js
const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class CateringLog extends Model {}

CateringLog.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tanggal: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  deskripsiMenu: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  fotoMenuUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  catatan: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'CateringLog'
});

module.exports = CateringLog;
