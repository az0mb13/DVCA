const fs = require('fs');
const path = require('path');

module.exports = function(db) {
  const logFile = path.join(__dirname, '..', 'public', 'logs', 'app.log');

  return function(req, res, next) {
    const timestamp = new Date().toISOString();
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    let bodyStr = '';
    if (req.body && Object.keys(req.body).length > 0) {
      bodyStr = JSON.stringify(req.body);
    }

    const logEntry = `[${timestamp}] ${req.method} ${req.path} - IP: ${ip} - Body: ${bodyStr}\n`;

    fs.appendFile(logFile, logEntry, (err) => {
      if (err) console.error('Log write error:', err);
    });

    next();
  };
};
