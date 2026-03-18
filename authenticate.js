const jwt = require('jsonwebtoken');
const config = require('./config');
const User = require('./models/User');

exports.getToken = function(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    config.secretKey,
    { expiresIn: '24h' }
  );
};

exports.verifyUser = function(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err = new Error('You are not authenticated!');
    err.status = 401;
    return next(err);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.secretKey);
    req.user = decoded;
    next();
  } catch (e) {
    const err = new Error('Invalid or expired token');
    err.status = 401;
    next(err);
  }
};

exports.verifyAdmin = function(req, res, next) {
  if (req.user.role !== 'admin') {
    const err = new Error('You are not authorized to perform this operation!');
    err.status = 403;
    return next(err);
  }
  next();
};
