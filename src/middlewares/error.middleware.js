// src/middlewares/error.middleware.js
module.exports = function errorHandler(err, req, res, next) {
  console.error(err);
  // Sequelize validation error
  if (err.name && err.name.startsWith('Sequelize')) {
    return res.status(400).json({
      message: err.message,
      errors: err.errors || undefined
    });
  }
  // Custom error with statusCode
  if (err.statusCode) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  // Default: Internal Server Error
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
};
