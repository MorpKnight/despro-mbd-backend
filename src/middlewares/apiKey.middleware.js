// src/middlewares/apiKey.middleware.js
const School = require('../models/school.model');

exports.verifyApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    return res.status(403).json({ message: 'API key required.' });
  }
  try {
    const school = await School.findOne({ where: { apiKey } });
    if (!school) {
      return res.status(403).json({ message: 'Invalid API key.' });
    }
    req.school = school;
    next();
  } catch (err) {
    return res.status(500).json({ message: 'API key verification failed.', error: err.message });
  }
};
