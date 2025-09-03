// src/validators/auth.validator.js
const { body } = require('express-validator');

const allowedRoles = ['ADMIN', 'SISWA', 'SEKOLAH', 'KATERING', 'DINKES'];

exports.validateRegister = [
  body('namaLengkap').notEmpty().withMessage('Nama lengkap wajib diisi.'),
  body('email').isEmail().withMessage('Email tidak valid.'),
  body('password').isLength({ min: 8 }).withMessage('Password minimal 8 karakter.'),
  body('role').isIn(allowedRoles).withMessage('Role tidak valid.')
];

exports.validateLogin = [
  body('email').notEmpty().withMessage('Email wajib diisi.').isEmail().withMessage('Email tidak valid.'),
  body('password').notEmpty().withMessage('Password wajib diisi.')
];
