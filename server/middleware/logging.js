// VULN: V7 - Insecure logging middleware
const fs = require('fs');
const path = require('path');

module.exports = function(db) {
  const logFile = path.join(__dirname, '..', 'public', 'logs', 'app.log');

  return function(req, res, next) {
    const timestamp = new Date().toISOString();
    // VULN: V14.5 - Trust X-Forwarded-For header
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // VULN: V7.1 - Log full request bodies including passwords and credit cards
    let bodyStr = '';
    if (req.body && Object.keys(req.body).length > 0) {
      bodyStr = JSON.stringify(req.body);
    }

    // VULN: V7.2 - Unsanitized user input in logs (log injection)
    const logEntry = `[${timestamp}] ${req.method} ${req.path} - IP: ${ip} - Body: ${bodyStr}\n`;

    // VULN: V7.3 - Logs stored in web-accessible directory
    fs.appendFile(logFile, logEntry, (err) => {
      if (err) console.error('Log write error:', err);
    });

    next();
  };
};
