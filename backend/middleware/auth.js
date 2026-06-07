const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function authenticateHotel(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Please login.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.hotel = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token. Please login again.' });
  }
};