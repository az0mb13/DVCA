// VULN: V3/V4 - Broken authentication middleware
const config = require('../config');

// VULN: V4.1 - Authentication check that can be bypassed multiple ways
function requireAuth(req, res, next) {
  // Check session
  if (req.session && req.session.userId) {
    return next();
  }

  // VULN: V3.4 - Trust Base64-encoded remember-me cookie without validation
  const rememberMe = req.cookies && req.cookies.rememberMe;
  if (rememberMe) {
    try {
      const decoded = JSON.parse(Buffer.from(rememberMe, 'base64').toString());
      // VULN: V3.4 - Trust the userId and role from the cookie without server-side validation
      req.session.userId = decoded.userId;
      req.session.role = decoded.role;
      req.session.username = decoded.username || 'user';
      return next();
    } catch (e) {
      // Fall through
    }
  }

  // VULN: V2.7 - Check JWT token from Authorization header
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

// VULN: V4.1 - Admin check done client-side, server check is bypassable
function requireAdmin(req, res, next) {
  const db = req.app.locals.db;
  const difficulty = (db.prepare('SELECT value FROM app_config WHERE key = ?').get('difficulty') || {}).value || 'easy';

  if (difficulty === 'easy') {
    // VULN: V4.1 - No server-side admin check in easy mode
    return next();
  }

  if (difficulty === 'medium') {
    // VULN: V4.3 - Check isAdmin in request body instead of session
    if (req.body.isAdmin === true || req.query.isAdmin === 'true' || req.session.role === 'admin') {
      return next();
    }
  }

  if (difficulty === 'hard') {
    // Still bypassable via forged remember-me cookie or JWT
    if (req.session.role === 'admin') {
      return next();
    }
  }

  res.status(403).json({ error: 'Admin access required' });
}

module.exports = { requireAuth, requireAdmin };
