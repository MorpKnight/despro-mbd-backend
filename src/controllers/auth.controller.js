// src/controllers/auth.controller.js
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRES_IN = '1d';

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

exports.register = async (req, res) => {
  try {
    const { namaLengkap, email, password, role, nfcTagId, schoolId } = req.body;
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'Email already registered.' });

    const user = await User.create({ namaLengkap, email, password, role, nfcTagId, SchoolId: schoolId });
    const token = generateToken(user);
    res.status(201).json({ token, user: { id: user.id, namaLengkap: user.namaLengkap, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed.', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid email or password.' });

    const isValid = await user.isValidPassword(password);
    if (!isValid) return res.status(401).json({ message: 'Invalid email or password.' });

    const token = generateToken(user);
    res.json({ token, user: { id: user.id, namaLengkap: user.namaLengkap, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Login failed.', error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ user: { id: user.id, namaLengkap: user.namaLengkap, email: user.email, role: user.role, nfcTagId: user.nfcTagId } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get profile.', error: err.message });
  }
};
