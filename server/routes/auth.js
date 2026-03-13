// VULN: V2/V3 - Broken Authentication and Session Management
const express = require('express');
const router = express.Router();
const { hashPassword, verifyPassword, generateResetCode, generateApiToken } = require('../utils/crypto');
const rateLimit = require('../middleware/rateLimit');

// VULN: V2.2 - Login with enumeration and weak rate limiting
router.post('/login', rateLimit(10), (req, res) => {
  const db = req.app.locals.db;
  const { email, password, otp } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (!user) {
    // VULN: V2.2 - Different error message reveals username existence
    return res.status(401).json({ error: 'User not found' });
  }

  if (!verifyPassword(password, user.password_hash)) {
    // VULN: V2.2 - Different error for wrong password
    return res.status(401).json({ error: 'Incorrect password' });
  }

  // VULN: V2.7 - 2FA bypass: otp=null bypasses TOTP check
  if (user.totp_enabled && otp !== null && otp !== undefined) {
    // In a real app, we'd validate the TOTP code here
    // For this vuln, any non-null value OR null value bypasses it
    if (otp === '' || otp === 'null') {
      // Still let them through - that's the vulnerability
    }
  }

  // VULN: V3.1 - Sequential session IDs
  const sessionId = 1000 + user.id;

  // Store session in DB
  db.prepare('INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, datetime("now", "+24 hours"))').run(
    user.id,
    sessionId.toString()
  );

  // Set session data
  req.session.userId = user.id;
  req.session.role = user.role;
  req.session.username = user.username;
  req.session.sessionToken = sessionId.toString();

  // VULN: V3.1 - Session cookie with no security flags
  res.cookie('sessionId', sessionId.toString(), {
    httpOnly: false,  // VULN: V3.1
    secure: false,    // VULN: V3.1
    sameSite: 'none'  // VULN: V3.1
  });

  // VULN: V8.2 - Return too much data including role for localStorage
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

// VULN: V13.2 - Mass assignment in registration
router.post('/register', (req, res) => {
  const db = req.app.locals.db;
  // VULN: V13.2 - Accepts 'role' from request body, directly storing it
  const { username, email, password, firstName, lastName, role, referralCode } = req.body;

  // VULN: V2.1 - No password complexity requirements
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  // VULN: V2.1 - MD5 hash with no salt
  const passwordHash = hashPassword(password);
  const apiToken = generateApiToken();

  // VULN: V13.2 - Mass assignment: role from user input
  const userRole = role || 'user';

  const result = db.prepare(
    'INSERT INTO users (username, email, password_hash, role, first_name, last_name, api_token) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(username || email.split('@')[0], email, passwordHash, userRole, firstName || '', lastName || '', apiToken);

  // VULN: V11.1 - Self-referral not validated
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

// VULN: V2.3/V6.3 - Weak password reset
router.post('/forgot-password', (req, res) => {
  const db = req.app.locals.db;
  const { email } = req.body;

  const user = db.prepare('SELECT id, email FROM users WHERE email = ?').get(email);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // VULN: V2.3 - 4-digit numeric code that doesn't expire
  const resetCode = generateResetCode();
  db.prepare('UPDATE users SET reset_code = ?, reset_code_created_at = datetime("now") WHERE id = ?').run(resetCode, user.id);

  // VULN: V2.3 - Code displayed in server console (simulated email)
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

  // VULN: V2.3 - Code never expires, no attempt limiting
  if (user.reset_code !== code) {
    return res.status(400).json({ error: 'Invalid reset code' });
  }

  // VULN: V3.2 - Sessions not invalidated on password change
  const newHash = hashPassword(newPassword);
  db.prepare('UPDATE users SET password_hash = ?, reset_code = NULL WHERE id = ?').run(newHash, user.id);

  res.json({
    success: true,
    message: 'Password reset successfully',
    flag: 'FLAG{br4t3_f0rc3_r3s3t_c0d3}'
  });
});

// VULN: V14.5 - Host header injection in password reset link
router.post('/forgot-password-link', (req, res) => {
  const db = req.app.locals.db;
  const { email } = req.body;

  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const token = Date.now().toString(16); // VULN: V6.3 - Predictable token
  db.prepare('UPDATE users SET reset_code = ? WHERE id = ?').run(token, user.id);

  // VULN: V14.5 - Host header reflected into reset URL
  const host = req.headers.host;
  const resetLink = `http://${host}/reset-password?token=${token}&email=${email}`;

  console.log(`[PASSWORD RESET LINK] ${resetLink}`);
  res.json({ success: true, message: 'Reset link sent to your email', debug_link: resetLink });
});

// VULN: V2.7 - 2FA setup leaks TOTP secret in response
router.post('/2fa/setup', (req, res) => {
  const db = req.app.locals.db;
  if (!req.session.userId) return res.status(401).json({ error: 'Login required' });

  const secret = 'JBSWY3DPEHPK3PXP'; // VULN: V2.7 - Hardcoded/predictable TOTP secret
  db.prepare('UPDATE users SET totp_secret = ?, totp_enabled = 1 WHERE id = ?').run(secret, req.session.userId);

  // VULN: V2.7 - TOTP secret returned in API response
  res.json({
    success: true,
    secret: secret,
    qrCodeUrl: `otpauth://totp/VulnCorp:user?secret=${secret}&issuer=VulnCorp`
  });
});

// VULN: V3.3 - Logout doesn't invalidate session server-side
router.post('/logout', (req, res) => {
  // VULN: V3.3 - Only deletes cookie, doesn't invalidate session in DB
  res.clearCookie('sessionId');
  res.clearCookie('rememberMe');
  req.session.destroy(() => {
    res.json({ success: true, message: 'Logged out' });
  });
  // Note: session token in database remains valid (is_valid stays 1)
});

// VULN: V2.5 - Security question retrieval via IDOR
router.get('/security-question/:userId', (req, res) => {
  const db = req.app.locals.db;
  // VULN: V2.5/V4.2 - No authorization check, any user can query any userId
  const user = db.prepare('SELECT security_question, security_answer FROM users WHERE id = ?').get(req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  res.json({
    securityQuestion: user.security_question,
    // VULN: V2.5 - Answer exposed in response
    answer: user.security_answer
  });
});

// VULN: V2.5 - Reset via security question
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
