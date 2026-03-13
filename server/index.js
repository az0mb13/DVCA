const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const Database = require('better-sqlite3');
const config = require('./config');

const app = express();

// Initialize database
const dbPath = path.resolve(config.dbPath);
if (!fs.existsSync(dbPath)) {
  require('./db/setup');
}
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
app.locals.db = db;

// VULN: V9.1 - Overly permissive CORS
app.use(cors({
  origin: '*', // VULN: V9.1 - Allows any origin
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['*']
}));

// VULN: V8.1 - Server header reveals technology
// Express sets X-Powered-By by default, we leave it enabled

// VULN: V14.4 - No security headers (no CSP, X-Frame-Options, etc.)
app.use((req, res, next) => {
  // VULN: V8.1 - Explicitly set revealing headers
  res.setHeader('Server', 'VulnCorp/1.0 (Node.js/Express)');
  // Intentionally NOT setting:
  // Content-Security-Policy
  // X-Frame-Options
  // X-Content-Type-Options
  // Referrer-Policy
  // Strict-Transport-Security

  // VULN: V8.1 - No cache control on sensitive responses
  // Not setting Cache-Control headers
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// VULN: V3.1 - Session cookies with no security flags
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: false,  // VULN: V3.1 - Not HttpOnly
    secure: false,    // VULN: V3.1 - Not Secure
    sameSite: false,  // VULN: V3.1 - No SameSite
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Middleware
const loggingMiddleware = require('./middleware/logging');
app.use(loggingMiddleware(db));

// VULN: V7.3/V14.1 - Serve static files including logs and .git directory
app.use(express.static(path.join(__dirname, 'public')));

// VULN: V14.1 - Serve .git directory
app.use('/.git', express.static(path.join(__dirname, '..', '.git-fake')));

// Serve uploaded files directly (VULN: V12.1)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// EJS templates for SSTI
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'templates'));

// Difficulty config endpoint
app.get('/api/config/difficulty', (req, res) => {
  const row = db.prepare('SELECT value FROM app_config WHERE key = ?').get('difficulty');
  res.json({ difficulty: row ? row.value : 'easy' });
});

app.post('/api/config/difficulty', (req, res) => {
  const { difficulty } = req.body;
  if (['easy', 'medium', 'hard'].includes(difficulty)) {
    db.prepare('UPDATE app_config SET value = ? WHERE key = ?').run(difficulty, 'difficulty');
    res.json({ success: true, difficulty });
  } else {
    res.status(400).json({ error: 'Invalid difficulty' });
  }
});

// VULN: V14.3 - robots.txt reveals hidden paths
app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *
Disallow: /admin
Disallow: /admin/debug
Disallow: /api/v2/admin/debug
Disallow: /api/v2/users/export
Disallow: /admin/grant-role
Disallow: /logs/
Disallow: /backdoor
Disallow: /.git/
Disallow: /swagger.json
`);
});

// VULN: V14.3 - Swagger docs publicly accessible
app.get('/swagger.json', (req, res) => {
  res.json({
    openapi: '3.0.0',
    info: { title: 'VulnCorp API', version: '2.0.0' },
    paths: {
      '/api/v2/admin/debug': {
        get: { summary: 'Debug endpoint - returns app config', security: [] }
      },
      '/api/v2/users/export': {
        get: { summary: 'Export all users as CSV (legacy)', security: [] }
      },
      '/admin/grant-role': {
        post: { summary: 'Grant admin role to user', parameters: [{ name: 'isAdmin', in: 'body' }] }
      },
      '/api/products/search': {
        get: { summary: 'Search products', parameters: [{ name: 'q', in: 'query' }] }
      },
      '/files/download': {
        get: { summary: 'Download file', parameters: [{ name: 'filename', in: 'query' }] }
      },
      '/api/webhooks/test': {
        post: { summary: 'Test webhook URL', parameters: [{ name: 'url', in: 'body' }] }
      }
    }
  });
});

// VULN: V10.2 - Hidden backdoor route
app.get('/backdoor', (req, res) => {
  // VULN: V10.2 - Backdoor grants admin access with magic query params
  if (req.query.debug === 'true' && req.query.grant === 'admin') {
    if (req.session && req.session.userId) {
      db.prepare('UPDATE users SET role = ? WHERE id = ?').run('admin', req.session.userId);
      res.json({ success: true, message: 'Admin access granted', flag: 'FLAG{b4ckd00r_f0und_1n_pr0duct10n}' });
    } else {
      res.json({ success: true, message: 'Backdoor active but no session found' });
    }
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// VULN: V5.2 - Server-Side Template Injection via EJS
app.get('/profile/preview', (req, res) => {
  const { template } = req.query;
  if (template) {
    try {
      // VULN: V5.2 - SSTI: User input rendered as EJS template
      const ejs = require('ejs');
      const rendered = ejs.render(template, { user: req.session });
      res.send(rendered);
    } catch (e) {
      res.status(500).send('Template error: ' + e.message);
    }
  } else {
    res.send('<p>Provide a ?template= parameter to preview your profile</p>');
  }
});

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/files', require('./routes/files'));
app.use('/admin', require('./routes/admin'));
app.use('/api/v2', require('./routes/api-v2'));
app.use('/graphql', require('./routes/graphql'));

// Scoreboard API
app.use('/scoreboard/api', require('./routes/scoreboard'));

// VULN: V7.4 - Verbose error handling exposes internals
app.use((err, req, res, next) => {
  // VULN: V7.4 - Full stack traces returned to client
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message,
    stack: err.stack,
    query: req.query,
    body: req.body,
    path: req.path,
    nodeVersion: process.version,
    platform: process.platform,
    cwd: process.cwd(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      DEBUG: process.env.DEBUG
    }
  });
});

// Serve React app for non-API routes
const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Create fake .git directory for V14.1
const gitFakePath = path.join(__dirname, '..', '.git-fake');
if (!fs.existsSync(gitFakePath)) {
  fs.mkdirSync(gitFakePath, { recursive: true });
  fs.writeFileSync(path.join(gitFakePath, 'config'), `[core]
	repositoryformatversion = 0
	filemode = true
	bare = false
[remote "origin"]
	url = https://github.com/vulncorp/vulnlab-internal.git
	fetch = +refs/heads/*:refs/remotes/origin/*
[user]
	name = admin
	email = admin@vulncorp.com
`);
  fs.writeFileSync(path.join(gitFakePath, 'HEAD'), 'ref: refs/heads/main\n');
}

// Create initial log file
const logDir = path.join(__dirname, 'public', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const PORT = config.port;
app.listen(PORT, '127.0.0.1', () => {
  console.log('');
  console.log('⚠️  ============================================= ⚠️');
  console.log('⚠️   VulnLab - INTENTIONALLY VULNERABLE APP       ⚠️');
  console.log('⚠️   DO NOT expose to the internet!                ⚠️');
  console.log('⚠️  ============================================= ⚠️');
  console.log('');
  console.log(`   Server running at http://127.0.0.1:${PORT}`);
  console.log(`   Difficulty: ${config.difficulty}`);
  console.log('');
});
