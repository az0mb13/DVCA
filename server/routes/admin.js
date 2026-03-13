// VULN: V1/V4 - Admin routes with missing access controls
const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');

// VULN: V4.1 - Admin dashboard accessible without admin check in easy mode
router.get('/dashboard', requireAuth, requireAdmin, (req, res) => {
  const db = req.app.locals.db;

  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  const orderCount = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
  const revenue = db.prepare('SELECT SUM(total) as total FROM orders').get().total || 0;

  res.json({
    stats: { userCount, orderCount, productCount, revenue },
    flag: 'FLAG{4dm1n_d4shb04rd_4cc3ss3d}'
  });
});

// VULN: V4.1 - List all users (admin function, no real check)
router.get('/users', requireAuth, requireAdmin, (req, res) => {
  const db = req.app.locals.db;
  const users = db.prepare('SELECT * FROM users').all();
  // VULN: V8.3 - Returns everything including password hashes
  res.json(users);
});

// VULN: V4.3 - Grant role checks isAdmin in request body
router.post('/grant-role', requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const { userId, role, isAdmin } = req.body;

  // VULN: V4.3 - Checks isAdmin from request body instead of session
  if (isAdmin === true || req.session.role === 'admin') {
    const targetUserId = userId || req.session.userId;
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role || 'admin', targetUserId);

    res.json({
      success: true,
      message: `Role updated to ${role || 'admin'}`,
      flag: 'FLAG{r0l3_3sc4l4t10n_v14_r3qu3st_b0dy}'
    });
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
});

// VULN: V4.1 - Delete user
router.delete('/users/:userId', requireAuth, requireAdmin, (req, res) => {
  const db = req.app.locals.db;
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.userId);
  res.json({ success: true });
});

// Admin config
router.get('/config', requireAuth, requireAdmin, (req, res) => {
  const db = req.app.locals.db;
  const config = db.prepare('SELECT * FROM app_config').all();
  res.json(config);
});

router.put('/config', requireAuth, requireAdmin, (req, res) => {
  const db = req.app.locals.db;
  const { key, value } = req.body;
  db.prepare('UPDATE app_config SET value = ? WHERE key = ?').run(value, key);
  res.json({ success: true });
});

// VULN: V9.2 - SSRF via webhook testing
router.post('/webhooks/test', requireAuth, (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL required' });
  }

  // VULN: V9.2 - No SSRF protection, can access internal services and file:// URIs
  const http = url.startsWith('https') ? require('https') : require('http');

  if (url.startsWith('file://')) {
    // VULN: V9.2 - file:// URI support
    const filePath = url.replace('file://', '');
    try {
      const fs = require('fs');
      const content = fs.readFileSync(filePath, 'utf8');
      return res.json({
        success: true,
        response: content,
        flag: 'FLAG{ssrf_f1l3_r34d}'
      });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to read file', message: e.message });
    }
  }

  try {
    const request = http.get(url, { timeout: 5000 }, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        res.json({
          success: true,
          statusCode: response.statusCode,
          headers: response.headers,
          body: data.substring(0, 10000),
          flag: 'FLAG{ssrf_1nt3rn4l_s3rv1c3}'
        });
      });
    });
    request.on('error', (e) => {
      res.status(500).json({ error: 'Request failed', message: e.message });
    });
    request.on('timeout', () => {
      request.destroy();
      res.status(504).json({ error: 'Request timeout' });
    });
  } catch (e) {
    res.status(500).json({ error: 'Request failed', message: e.message });
  }
});

// VULN: V10.1 - Plugin system that eval()s remote code
router.post('/plugins/install', requireAuth, requireAdmin, (req, res) => {
  const { url, name } = req.body;

  if (!url) return res.status(400).json({ error: 'Plugin URL required' });

  // VULN: V10.1 - Fetches and eval()s remote JavaScript
  const http = url.startsWith('https') ? require('https') : require('http');
  http.get(url, (response) => {
    let code = '';
    response.on('data', chunk => code += chunk);
    response.on('end', () => {
      try {
        // VULN: V10.1 - eval() of remote code
        const result = eval(code);
        const db = req.app.locals.db;
        db.prepare('INSERT INTO plugins (name, url) VALUES (?, ?)').run(name || 'unnamed', url);
        res.json({
          success: true,
          result: String(result),
          flag: 'FLAG{r3m0t3_c0d3_3x3cut10n_v14_3v4l}'
        });
      } catch (e) {
        res.status(500).json({ error: 'Plugin execution failed', message: e.message });
      }
    });
  }).on('error', (e) => {
    res.status(500).json({ error: 'Failed to fetch plugin', message: e.message });
  });
});

// Manage webhooks
router.post('/webhooks', requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const { url, eventType } = req.body;
  db.prepare('INSERT INTO webhooks (user_id, url, event_type) VALUES (?, ?, ?)').run(
    req.session.userId, url, eventType || 'order.created'
  );
  res.json({ success: true });
});

router.get('/webhooks', requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const webhooks = db.prepare('SELECT * FROM webhooks WHERE user_id = ?').all(req.session.userId);
  res.json(webhooks);
});

module.exports = router;
