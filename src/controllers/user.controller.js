// src/controllers/user.controller.js
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

exports.getAllUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  try {
    const { count, rows } = await User.findAndCountAll({ offset, limit });
    res.json({ total: count, page, limit, users: rows });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users.', error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user.', error: err.message });
  }
};


exports.createUser = async (req, res) => {
  try {
    const { namaLengkap, email, password, role, nfcTagId, schoolId } = req.body;
    if (role === 'MASTERADMIN') {
      return res.status(403).json({ message: 'Only MASTERADMIN can create MASTERADMIN user.' });
    }
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'Email already registered.' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ namaLengkap, email, password: hashedPassword, role, nfcTagId, SchoolId: schoolId });
    res.status(201).json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create user.', error: err.message });
  }
};

exports.createMasterAdmin = async (req, res) => {
  try {
    const { namaLengkap, email, password } = req.body;
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'Email already registered.' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ namaLengkap, email, password: hashedPassword, role: 'MASTERADMIN' });
    res.status(201).json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create MASTERADMIN.', error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { namaLengkap, email, password, role, nfcTagId, schoolId } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    // Proteksi update MASTERADMIN
    if (user.role === 'MASTERADMIN' && req.user.role !== 'MASTERADMIN') {
      return res.status(403).json({ message: 'Only MASTERADMIN can update MASTERADMIN user.' });
    }
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    if (namaLengkap) user.namaLengkap = namaLengkap;
    if (email) user.email = email;
    if (role && req.user.role === 'MASTERADMIN') user.role = role;
    if (nfcTagId !== undefined) user.nfcTagId = nfcTagId;
    if (schoolId) user.SchoolId = schoolId;
    await user.save();
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user.', error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    // Proteksi delete MASTERADMIN
    if (user.role === 'MASTERADMIN' && req.user.role !== 'MASTERADMIN') {
      return res.status(403).json({ message: 'Only MASTERADMIN can delete MASTERADMIN user.' });
    }
    await user.destroy();
    res.json({ message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user.', error: err.message });
  }
};
