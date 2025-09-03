// src/models/school.model.js
const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class School extends Model {}

School.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  namaSekolah: {
    type: DataTypes.STRING,
    allowNull: false
  },
  alamat: {
    type: DataTypes.STRING,
    allowNull: false
  },
  apiKey: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    defaultValue: DataTypes.UUIDV4
  }
}, {
  sequelize,
  modelName: 'School'
});

module.exports = School;
