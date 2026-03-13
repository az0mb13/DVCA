// VULN: V2.2/V14.5 - Bypassable rate limiter

const attempts = {};

function rateLimit(maxAttempts = 5, windowMs = 60000) {
  return function(req, res, next) {
    const db = req.app.locals.db;
    const difficulty = (db.prepare('SELECT value FROM app_config WHERE key = ?').get('difficulty') || {}).value || 'easy';

    if (difficulty === 'easy') {
      // VULN: V2.2 - No rate limiting in easy mode
      return next();
    }

    // VULN: V14.5 - Use X-Forwarded-For for IP identification (spoofable)
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const key = `${ip}:${req.path}`;
    const now = Date.now();

    if (!attempts[key]) {
      attempts[key] = [];
    }

    // Clean old attempts
    attempts[key] = attempts[key].filter(t => t > now - windowMs);

    if (attempts[key].length >= maxAttempts) {
      if (difficulty === 'medium') {
        // VULN: V14.5 - Rate limit bypassable by changing X-Forwarded-For
        return res.status(429).json({
          error: 'Too many attempts. Please try again later.',
          retryAfter: Math.ceil(windowMs / 1000)
        });
      }
      if (difficulty === 'hard') {
        // Still bypassable via X-Forwarded-For rotation
        return res.status(429).json({
          error: 'Account temporarily locked due to too many failed attempts.',
          retryAfter: Math.ceil(windowMs / 1000)
        });
      }
    }

    attempts[key].push(now);
    next();
  };
}

module.exports = rateLimit;
