const express = require('express');
const router = express.Router();
const { hashPassword, verifyPassword, generateResetCode, generateApiToken } = require('../utils/crypto');
const rateLimit = require('../middleware/rateLimit');

router.post('/login', rateLimit(10), (req, res) => {
  const db = req.app.locals.db;
  const { email, password, otp } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  if (!verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'Incorrect password' });
  }

  if (user.totp_enabled && otp !== null && otp !== undefined) {
    if (otp === '' || otp === 'null') {
      // Still let them through
    }
  }

  const sessionId = 1000 + user.id;

  // Store session in DB
  db.prepare("INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, datetime('now', '+24 hours'))").run(
    user.id,
    sessionId.toString()
  );

  // Set session data
  req.session.userId = user.id;
  req.session.role = user.role;
  req.session.username = user.username;
  req.session.sessionToken = sessionId.toString();

  res.cookie('sessionId', sessionId.toString(), {
    httpOnly: false,
    secure: false,
    sameSite: 'none'
  });

  res.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name
    },
    sessionId: sessionId.toString(),
    token: require('jsonwebtoken').sign(
      { userId: user.id, role: user.role },
      require('../config').jwtSecret
    )
  });
});

router.post('/register', (req, res) => {
  const db = req.app.locals.db;
  const { username, email, password, firstName, lastName, role, referralCode } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const passwordHash = hashPassword(password);
  const apiToken = generateApiToken();

  const userRole = role || 'user';

  const result = db.prepare(
    'INSERT INTO users (username, email, password_hash, role, first_name, last_name, api_token) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(username || email.split('@')[0], email, passwordHash, userRole, firstName || '', lastName || '', apiToken);

  if (referralCode) {
    const referrer = db.prepare('SELECT id FROM users WHERE api_token = ?').get(referralCode);
    if (referrer) {
      db.prepare('INSERT INTO referrals (referrer_id, referred_id, credit_amount) VALUES (?, ?, 10.00)').run(
        referrer.id, result.lastInsertRowid
      );
    }
  }

  res.json({
    success: true,
    userId: result.lastInsertRowid,
    apiToken,
    flag: userRole === 'admin' ? 'FLAG{m4ss_4ss1gnm3nt_r0l3_3sc4l4t10n}' : undefined
  });
});

router.post('/forgot-password', (req, res) => {
  const db = req.app.locals.db;
  const { email } = req.body;

  const user = db.prepare('SELECT id, email FROM users WHERE email = ?').get(email);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const resetCode = generateResetCode();
  db.prepare("UPDATE users SET reset_code = ?, reset_code_created_at = datetime('now') WHERE id = ?").run(resetCode, user.id);

  console.log(`[PASSWORD RESET] Code for ${email}: ${resetCode}`);

  res.json({ success: true, message: 'Reset code sent to your email' });
});

router.post('/reset-password', (req, res) => {
  const db = req.app.locals.db;
  const { email, code, newPassword } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (user.reset_code !== code) {
    return res.status(400).json({ error: 'Invalid reset code' });
  }

  const newHash = hashPassword(newPassword);
  db.prepare('UPDATE users SET password_hash = ?, reset_code = NULL WHERE id = ?').run(newHash, user.id);

  res.json({
    success: true,
    message: 'Password reset successfully',
    flag: 'FLAG{br4t3_f0rc3_r3s3t_c0d3}'
  });
});

router.post('/forgot-password-link', (req, res) => {
  const db = req.app.locals.db;
  const { email } = req.body;

  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const token = Date.now().toString(16);
  db.prepare('UPDATE users SET reset_code = ? WHERE id = ?').run(token, user.id);

  const host = req.headers.host;
  const resetLink = `http://${host}/reset-password?token=${token}&email=${email}`;

  console.log(`[PASSWORD RESET LINK] ${resetLink}`);
  res.json({ success: true, message: 'Reset link sent to your email', debug_link: resetLink });
});

router.post('/2fa/setup', (req, res) => {
  const db = req.app.locals.db;
  if (!req.session.userId) return res.status(401).json({ error: 'Login required' });

  const secret = 'JBSWY3DPEHPK3PXP';
  db.prepare('UPDATE users SET totp_secret = ?, totp_enabled = 1 WHERE id = ?').run(secret, req.session.userId);

  res.json({
    success: true,
    secret: secret,
    qrCodeUrl: `otpauth://totp/DVCA:user?secret=${secret}&issuer=DVCA`
  });
});

router.post('/logout', (req, res) => {
  res.clearCookie('sessionId');
  res.clearCookie('rememberMe');
  req.session.destroy(() => {
    res.json({ success: true, message: 'Logged out' });
  });
});

router.get('/security-question/:userId', (req, res) => {
  const db = req.app.locals.db;
  const user = db.prepare('SELECT security_question, security_answer FROM users WHERE id = ?').get(req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  res.json({
    securityQuestion: user.security_question,
    answer: user.security_answer
  });
});

router.post('/reset-via-question', (req, res) => {
  const db = req.app.locals.db;
  const { email, answer, newPassword } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (user.security_answer.toLowerCase() === answer.toLowerCase()) {
    const newHash = hashPassword(newPassword);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, user.id);
    res.json({ success: true, flag: 'FLAG{s3cur1ty_qu3st10n_byp4ss}' });
  } else {
    res.status(400).json({ error: 'Incorrect answer' });
  }
});

module.exports = router;
