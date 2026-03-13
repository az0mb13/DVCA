// VULN: V4/V5/V8 - User routes with IDOR, XSS, and data exposure
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { hashPassword } = require('../utils/crypto');

// VULN: V8.3 - All user fields returned including PII
router.get('/profile', requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // VULN: V8.3 - Returns SSN, full address, phone, password hash
  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    firstName: user.first_name,
    lastName: user.last_name,
    bio: user.bio,
    phone: user.phone,
    address: user.address,
    ssn: user.ssn,
    securityQuestion: user.security_question,
    profilePicture: user.profile_picture,
    apiToken: user.api_token,
    createdAt: user.created_at
  });
});

// VULN: V4.2 - IDOR: any user can view any other user's profile
router.get('/:userId', (req, res) => {
  const db = req.app.locals.db;
  // VULN: V4.2 - No authorization check
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // VULN: V8.3 - All PII returned
  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    firstName: user.first_name,
    lastName: user.last_name,
    bio: user.bio,
    phone: user.phone,
    address: user.address,
    ssn: user.ssn,
    securityQuestion: user.security_question,
    securityAnswer: user.security_answer,
    profilePicture: user.profile_picture,
    apiToken: user.api_token,
    totpSecret: user.totp_secret,
    createdAt: user.created_at
  });
});

// VULN: V4.2 - IDOR: modify another user's profile
router.put('/:userId', requireAuth, (req, res) => {
  const db = req.app.locals.db;
  // VULN: V4.2 - No check that session userId matches param userId
  const { firstName, lastName, bio, phone, address, email } = req.body;

  db.prepare(
    'UPDATE users SET first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name), bio = COALESCE(?, bio), phone = COALESCE(?, phone), address = COALESCE(?, address), email = COALESCE(?, email) WHERE id = ?'
  ).run(firstName, lastName, bio, phone, address, email, req.params.userId);

  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.userId);
  res.json({
    success: true,
    user: updated,
    flag: parseInt(req.params.userId) !== req.session.userId ? 'FLAG{1d0r_pr0f1l3_m0d1f1c4t10n}' : undefined
  });
});

// List all users (VULN: V8.3 - excessive data exposure)
router.get('/', (req, res) => {
  const db = req.app.locals.db;
  // VULN: V8.3 - Returns all user data including PII for all users
  const users = db.prepare('SELECT * FROM users').all();
  res.json(users.map(u => ({
    id: u.id,
    username: u.username,
    email: u.email,
    role: u.role,
    firstName: u.first_name,
    lastName: u.last_name,
    phone: u.phone,
    address: u.address,
    ssn: u.ssn,
    bio: u.bio,
    createdAt: u.created_at
  })));
});

// Change password (VULN: V3.2 - old sessions not invalidated)
router.post('/change-password', requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const { currentPassword, newPassword } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);
  const { verifyPassword } = require('../utils/crypto');

  if (!verifyPassword(currentPassword, user.password_hash)) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }

  // VULN: V3.2 - Sessions not invalidated on password change
  const newHash = hashPassword(newPassword);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, req.session.userId);

  res.json({
    success: true,
    message: 'Password changed. Note: existing sessions remain valid.',
    flag: 'FLAG{s3ss10n_n0t_1nv4l1d4t3d}'
  });
});

// VULN: V5.5 - Insecure deserialization of user preferences
router.post('/preferences', requireAuth, (req, res) => {
  const serialize = require('node-serialize');

  // Check for preferences cookie
  const prefCookie = req.cookies.preferences;
  if (prefCookie) {
    try {
      // VULN: V5.5 - Deserialize untrusted data (RCE possible)
      const prefs = serialize.unserialize(Buffer.from(prefCookie, 'base64').toString());
      return res.json({ preferences: prefs, flag: 'FLAG{1ns3cur3_d3s3r14l1z4t10n_rc3}' });
    } catch (e) {
      return res.status(400).json({ error: 'Invalid preferences' });
    }
  }

  // Set preferences
  if (req.body.preferences) {
    const serialized = Buffer.from(serialize.serialize(req.body.preferences)).toString('base64');
    res.cookie('preferences', serialized);
    res.json({ success: true });
  } else {
    res.json({ preferences: { theme: 'light', language: 'en' } });
  }
});

// VULN: V5.4 - Memory disclosure via Buffer.allocUnsafe
router.get('/avatar-placeholder', (req, res) => {
  const size = parseInt(req.query.size) || 100;
  // VULN: V5.4 - Buffer.allocUnsafe may contain old memory contents
  const buf = Buffer.allocUnsafe(Math.min(size, 10000));
  res.set('Content-Type', 'image/png');
  res.send(buf);
});

module.exports = router;
