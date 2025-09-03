// src/models/feedback.model.js
const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Feedback extends Model {}

Feedback.init({
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  komentar: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Feedback'
});

module.exports = Feedback;
