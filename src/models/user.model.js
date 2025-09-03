// src/models/user.model.js
const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

class User extends Model {
  async isValidPassword(password) {
    return await bcrypt.compare(password, this.password);
  }
}

User.init({
  namaLengkap: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('ADMIN', 'SISWA', 'SEKOLAH', 'KATERING', 'DINKES'),
    allowNull: false
  },
  nfcTagId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  }
}, {
  sequelize,
  modelName: 'User',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

module.exports = User;
