// VULN: V12 - File upload/download with path traversal, no validation
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { requireAuth } = require('../middleware/auth');

// VULN: V12.1/V12.2 - No server-side file validation, path traversal in filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    // VULN: V12.2 - Filename not sanitized, path traversal possible
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage,
  // VULN: V12.1 - No file size limit server-side, no file type validation
});

// Upload file
router.post('/upload', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const flags = [];

  // Check for path traversal in filename
  if (req.file.originalname.includes('..')) {
    flags.push('FLAG{p4th_tr4v3rs4l_f1l3_upl04d}');
  }

  // Check for web shell upload
  const ext = path.extname(req.file.originalname).toLowerCase();
  if (['.js', '.ejs', '.php', '.jsp'].includes(ext)) {
    flags.push('FLAG{w3b_sh3ll_upl04d3d}');
  }

  res.json({
    success: true,
    filename: req.file.originalname,
    path: `/uploads/${req.file.originalname}`,
    size: req.file.size,
    flags: flags.length > 0 ? flags : undefined
  });
});

// VULN: V12.4 - Path traversal in file download
router.get('/download', (req, res) => {
  const { filename } = req.query;
  if (!filename) {
    return res.status(400).json({ error: 'Filename required' });
  }

  // VULN: V12.4 - No path validation, allows directory traversal
  const filePath = path.join(__dirname, '..', 'uploads', filename);

  // VULN: V12.4 - sendFile with no restriction on path
  res.sendFile(filePath, (err) => {
    if (err) {
      // VULN: V7.4 - Error reveals file path
      res.status(404).json({
        error: 'File not found',
        path: filePath,
        requested: filename,
        flag: filename.includes('..') ? 'FLAG{p4th_tr4v3rs4l_f1l3_d0wnl04d}' : undefined
      });
    }
  });
});

// VULN: V12.3 - Render uploaded EJS templates
router.get('/render/:filename', (req, res) => {
  const filePath = path.join(__dirname, '..', 'uploads', req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  const ext = path.extname(req.params.filename).toLowerCase();
  if (ext === '.ejs') {
    // VULN: V12.3 - Server-side rendering of uploaded templates
    try {
      const ejs = require('ejs');
      const template = fs.readFileSync(filePath, 'utf8');
      const rendered = ejs.render(template, {
        user: req.session,
        env: process.env,
        require: require
      });
      res.send(rendered);
      // Don't return here, let it fall through to flag
    } catch (e) {
      res.status(500).json({ error: 'Template render error', message: e.message });
      return;
    }
    return;
  }

  res.sendFile(filePath);
});

// List uploaded files
router.get('/list', (req, res) => {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  try {
    const files = fs.readdirSync(uploadsDir);
    res.json(files.map(f => ({
      name: f,
      url: `/uploads/${f}`,
      size: fs.statSync(path.join(uploadsDir, f)).size
    })));
  } catch (e) {
    res.json([]);
  }
});

module.exports = router;
