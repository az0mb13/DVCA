const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { hashPassword } = require('../utils/crypto');

// Get current user profile
router.get('/profile', requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

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

// Get user by ID
router.get('/:userId', (req, res) => {
  const db = req.app.locals.db;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

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

// Update user profile
router.put('/:userId', requireAuth, (req, res) => {
  const db = req.app.locals.db;
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

// List all users
router.get('/', (req, res) => {
  const db = req.app.locals.db;
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

// Change password
router.post('/change-password', requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const { currentPassword, newPassword } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);
  const { verifyPassword } = require('../utils/crypto');

  if (!verifyPassword(currentPassword, user.password_hash)) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }

  const newHash = hashPassword(newPassword);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, req.session.userId);

  res.json({
    success: true,
    message: 'Password changed. Note: existing sessions remain valid.',
    flag: 'FLAG{s3ss10n_n0t_1nv4l1d4t3d}'
  });
});

// User preferences
router.post('/preferences', requireAuth, (req, res) => {
  const serialize = require('node-serialize');

  const prefCookie = req.cookies.preferences;
  if (prefCookie) {
    try {
      const prefs = serialize.unserialize(Buffer.from(prefCookie, 'base64').toString());
      return res.json({ preferences: prefs, flag: 'FLAG{1ns3cur3_d3s3r14l1z4t10n_rc3}' });
    } catch (e) {
      return res.status(400).json({ error: 'Invalid preferences' });
    }
  }

  if (req.body.preferences) {
    const serialized = Buffer.from(serialize.serialize(req.body.preferences)).toString('base64');
    res.cookie('preferences', serialized);
    res.json({ success: true });
  } else {
    res.json({ preferences: { theme: 'light', language: 'en' } });
  }
});

// Avatar placeholder
router.get('/avatar-placeholder', (req, res) => {
  const size = parseInt(req.query.size) || 100;
  const buf = Buffer.allocUnsafe(Math.min(size, 10000));
  res.set('Content-Type', 'image/png');
  res.send(buf);
});

module.exports = router;
