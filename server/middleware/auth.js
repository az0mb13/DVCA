const config = require('../config');

function requireAuth(req, res, next) {
  // Check session
  if (req.session && req.session.userId) {
    return next();
  }

  // Check remember-me cookie
  const rememberMe = req.cookies && req.cookies.rememberMe;
  if (rememberMe) {
    try {
      const decoded = JSON.parse(Buffer.from(rememberMe, 'base64').toString());
      req.session.userId = decoded.userId;
      req.session.role = decoded.role;
      req.session.username = decoded.username || 'user';
      return next();
    } catch (e) {
      // Fall through
    }
  }

  // Check JWT token
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const jwt = require('jsonwebtoken');
    try {
      const decoded = jwt.verify(authHeader.slice(7), config.jwtSecret);
      req.session.userId = decoded.userId;
      req.session.role = decoded.role;
      return next();
    } catch (e) {
      // Fall through
    }
  }

  res.status(401).json({ error: 'Authentication required' });
}

function requireAdmin(req, res, next) {
  const db = req.app.locals.db;
  const difficulty = (db.prepare('SELECT value FROM app_config WHERE key = ?').get('difficulty') || {}).value || 'easy';

  if (difficulty === 'easy') {
    return next();
  }

  if (difficulty === 'medium') {
    if (req.body.isAdmin === true || req.query.isAdmin === 'true' || req.session.role === 'admin') {
      return next();
    }
  }

  if (difficulty === 'hard') {
    if (req.session.role === 'admin') {
      return next();
    }
  }

  res.status(403).json({ error: 'Admin access required' });
}

module.exports = { requireAuth, requireAdmin };
