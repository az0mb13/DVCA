// VULN: V1/V2/V6/V7/V8 - Legacy API with extra vulnerabilities
const express = require('express');
const router = express.Router();
const config = require('../config');
const { encryptMessage, decryptMessage } = require('../utils/crypto');

// VULN: V1 - Hidden debug endpoint "secured by obscurity"
router.get('/admin/debug', (req, res) => {
  // VULN: V1 - No authentication required, exposes full app config
  res.json({
    appConfig: config,
    environment: process.env,
    dbPath: config.dbPath,
    jwtSecret: config.jwtSecret,
    sessionSecret: config.sessionSecret,
    desKey: config.desKey,
    dbCredentials: config.dbCredentials,
    nodeVersion: process.version,
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    flag: 'FLAG{h1dd3n_d3bug_3ndp01nt_3xp0s3d}'
  });
});

// VULN: V2.4 - Legacy user export with password hashes
router.get('/users/export', (req, res) => {
  const db = req.app.locals.db;
  // VULN: V2.4 - No auth required, returns password hashes
  const users = db.prepare('SELECT id, username, email, password_hash, role, first_name, last_name, phone, address, ssn FROM users').all();

  // Format as CSV
  const header = 'id,username,email,password_hash,role,first_name,last_name,phone,address,ssn';
  const rows = users.map(u =>
    `${u.id},${u.username},${u.email},${u.password_hash},${u.role},${u.first_name},${u.last_name},${u.phone},${u.address},${u.ssn}`
  );

  res.set('Content-Type', 'text/csv');
  res.set('Content-Disposition', 'attachment; filename=users_export.csv');
  res.send([header, ...rows].join('\n'));
});

// VULN: V6.2 - Secure messaging with DES + hardcoded key
router.post('/messages/encrypt', (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  try {
    const encrypted = encryptMessage(message);
    res.json({
      encrypted,
      algorithm: 'DES-ECB', // VULN: V6.2 - Reveals algorithm
      flag: 'FLAG{d3s_3ncrypt10n_h4rdc0d3d_k3y}'
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/messages/decrypt', (req, res) => {
  const { encrypted } = req.body;
  if (!encrypted) return res.status(400).json({ error: 'Encrypted message required' });

  try {
    const decrypted = decryptMessage(encrypted);
    res.json({ decrypted });
  } catch (e) {
    res.status(500).json({ error: 'Decryption failed', message: e.message });
  }
});

// VULN: V6.2 - Predictable API token generation
router.get('/token/next', (req, res) => {
  // VULN: V6.2 - Reveal the seed for Math.random prediction
  const { generateApiToken } = require('../utils/crypto');
  const tokens = [];
  for (let i = 0; i < 5; i++) {
    tokens.push(generateApiToken());
  }
  res.json({
    generatedTokens: tokens,
    note: 'Tokens generated using Math.random() - predictable!',
    flag: 'FLAG{pr3d1ct4bl3_4p1_t0k3n}'
  });
});

// VULN: V6.3 - Predictable password reset tokens
router.get('/reset-token/predict', (req, res) => {
  const { generateResetToken } = require('../utils/crypto');
  const token = generateResetToken();
  res.json({
    token,
    algorithm: 'Date.now().toString(16)',
    currentTimestamp: Date.now(),
    flag: 'FLAG{pr3d1ct4bl3_r3s3t_t0k3n}'
  });
});

// Messages CRUD
router.get('/messages', (req, res) => {
  const db = req.app.locals.db;
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const messages = db.prepare(
    'SELECT m.*, u.username as from_username FROM messages m JOIN users u ON m.from_user_id = u.id WHERE m.to_user_id = ? ORDER BY m.created_at DESC'
  ).all(req.session.userId);

  res.json(messages);
});

router.post('/messages', (req, res) => {
  const db = req.app.locals.db;
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { toUserId, subject, body, encrypt } = req.body;
  const messageBody = encrypt ? encryptMessage(body) : body;

  db.prepare('INSERT INTO messages (from_user_id, to_user_id, subject, body, encrypted) VALUES (?, ?, ?, ?, ?)').run(
    req.session.userId, toUserId, subject, messageBody, encrypt ? 1 : 0
  );

  res.json({ success: true });
});

// VULN: V7.1 - Logs endpoint serves log file directly
router.get('/logs', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const logFile = path.join(__dirname, '..', 'public', 'logs', 'app.log');

  try {
    const logs = fs.readFileSync(logFile, 'utf8');
    res.json({
      logs: logs.split('\n').filter(Boolean),
      flag: 'FLAG{l0g_f1l3_3xp0s3d}'
    });
  } catch (e) {
    res.json({ logs: [], message: 'No logs yet' });
  }
});

module.exports = router;
