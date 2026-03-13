// VULN: V6 - Weak cryptography utilities
const crypto = require('crypto');

// VULN: V6.2/V2.1 - MD5 password hashing with no salt
function hashPassword(password) {
  return crypto.createHash('md5').update(password).digest('hex');
}

function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

// VULN: V6.2 - Generate API tokens with Math.random() instead of CSPRNG
function generateApiToken() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = 'vtoken_';
  for (let i = 0; i < 12; i++) {
    // VULN: V6.3 - Predictable random values
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

// VULN: V6.3 - Password reset tokens are timestamps converted to hex
function generateResetToken() {
  return Date.now().toString(16);
}

// VULN: V6.2 - DES encryption with hardcoded key
function encryptMessage(message) {
  const config = require('../config');
  const cipher = crypto.createCipheriv('des-ecb', Buffer.from(config.desKey, 'utf8'), null);
  let encrypted = cipher.update(message, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}

function decryptMessage(encrypted) {
  const config = require('../config');
  const decipher = crypto.createDecipheriv('des-ecb', Buffer.from(config.desKey, 'utf8'), null);
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// VULN: V6.3 - Generate 4-digit numeric reset code (brute-forceable)
function generateResetCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateApiToken,
  generateResetToken,
  encryptMessage,
  decryptMessage,
  generateResetCode
};
