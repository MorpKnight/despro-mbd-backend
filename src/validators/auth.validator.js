// src/validators/auth.validator.js
const { body } = require('express-validator');

const allowedRoles = ['MASTERADMIN', 'ADMIN', 'SISWA', 'SEKOLAH', 'KATERING', 'DINKES'];


exports.validateRegister = [
  body('namaLengkap')
    .notEmpty().withMessage('Nama lengkap wajib diisi.')
    .isLength({ min: 3, max: 100 }).withMessage('Nama lengkap 3-100 karakter.')
    .matches(/^[a-zA-Z0-9 .'-]+$/).withMessage('Nama hanya boleh huruf, angka, spasi, titik, apostrof, dan strip.'),
  body('email')
    .isEmail().withMessage('Email tidak valid.')
    .isLength({ max: 100 }).withMessage('Email maksimal 100 karakter.'),
  body('password')
    .isLength({ min: 8, max: 100 }).withMessage('Password 8-100 karakter.')
    .matches(/^[^'"\\]+$/).withMessage('Password tidak boleh mengandung kutip atau backslash.'),
  body('role').isIn(allowedRoles).withMessage('Role tidak valid.')
];


exports.validateLogin = [
  body('email')
    .notEmpty().withMessage('Email wajib diisi.')
    .isEmail().withMessage('Email tidak valid.')
    .isLength({ max: 100 }).withMessage('Email maksimal 100 karakter.'),
  body('password')
    .notEmpty().withMessage('Password wajib diisi.')
    .isLength({ min: 8, max: 100 }).withMessage('Password 8-100 karakter.')
    .matches(/^[^'"\\]+$/).withMessage('Password tidak boleh mengandung kutip atau backslash.')
];
