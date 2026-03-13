// VULN: V5 - Product routes with SQL injection, XSS, XXE
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { parseXML } = require('../utils/xml');

// List all products
router.get('/', (req, res) => {
  const db = req.app.locals.db;
  const products = db.prepare('SELECT * FROM products').all();
  res.json(products);
});

// Get single product with reviews
router.get('/:id', (req, res) => {
  const db = req.app.locals.db;
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  // VULN: V5.2 - Reviews contain stored XSS, returned unsanitized
  const reviews = db.prepare(
    'SELECT r.*, u.username FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = ?'
  ).all(req.params.id);

  res.json({ ...product, reviews });
});

// VULN: V5.2 - SQL Injection in product search
router.get('/search/query', (req, res) => {
  const db = req.app.locals.db;
  const { q } = req.query;
  const difficulty = (db.prepare('SELECT value FROM app_config WHERE key = ?').get('difficulty') || {}).value || 'easy';

  try {
    let products;
    if (difficulty === 'easy') {
      // VULN: V5.2 - Direct string concatenation SQL injection
      const query = `SELECT * FROM products WHERE name LIKE '%${q}%' OR description LIKE '%${q}%'`;
      products = db.prepare(query).all();
    } else if (difficulty === 'medium') {
      // VULN: V5.2 - Parameterized but with JSON bypass
      // If q is an object (via JSON content-type), it can bypass
      if (typeof q === 'object') {
        const query = `SELECT * FROM products WHERE name LIKE '%${q.value}%'`;
        products = db.prepare(query).all();
      } else {
        products = db.prepare('SELECT * FROM products WHERE name LIKE ? OR description LIKE ?').all(`%${q}%`, `%${q}%`);
      }
    } else {
      // Hard mode - blind SQLi only (boolean-based)
      products = db.prepare('SELECT * FROM products WHERE name LIKE ? OR description LIKE ?').all(`%${q}%`, `%${q}%`);
      // But error messages still leak info
    }
    res.json(products);
  } catch (err) {
    // VULN: V7.4 - SQL error reveals full query
    res.status(500).json({
      error: 'Database error',
      message: err.message,
      query: `Search query: ${q}`,
      flag: 'FLAG{sql_1nj3ct10n_pr0duct_s34rch}'
    });
  }
});

// VULN: V5.2 - Stored XSS via product reviews
router.post('/:id/reviews', requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const { rating, comment } = req.body;

  // VULN: V5.2 - No sanitization of review comment (stored XSS)
  db.prepare('INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)').run(
    req.params.id, req.session.userId, rating, comment
  );

  res.json({
    success: true,
    message: 'Review added',
    // If the comment contains script tags, it's stored XSS
    flag: comment && comment.includes('<script') ? 'FLAG{st0r3d_xss_1n_r3v13ws}' : undefined
  });
});

// VULN: V5.2 - XXE via XML product import
router.post('/import', requireAuth, (req, res) => {
  const rawBody = req.body.xml || req.body;

  if (typeof rawBody !== 'string') {
    return res.status(400).json({ error: 'Provide XML in the "xml" field' });
  }

  parseXML(rawBody).then(result => {
    // Process imported products
    if (result && result.products && result.products.product) {
      const products = Array.isArray(result.products.product)
        ? result.products.product
        : [result.products.product];

      const db = req.app.locals.db;
      const inserted = [];
      for (const p of products) {
        try {
          const r = db.prepare(
            'INSERT INTO products (name, description, price, category, stock) VALUES (?, ?, ?, ?, ?)'
          ).run(p.name, p.description, parseFloat(p.price) || 0, p.category || 'Imported', parseInt(p.stock) || 0);
          inserted.push({ id: r.lastInsertRowid, name: p.name });
        } catch (e) {
          // continue
        }
      }
      res.json({
        success: true,
        imported: inserted,
        rawParsed: result,
        flag: 'FLAG{xx3_3xt3rn4l_3nt1ty_1nj3ct10n}'
      });
    } else {
      res.json({ success: true, parsed: result });
    }
  }).catch(err => {
    res.status(400).json({ error: 'XML parse error', message: err.message });
  });
});

// VULN: V13.1 - All HTTP methods accepted; GET can delete
router.all('/delete/:id', (req, res) => {
  const db = req.app.locals.db;
  // VULN: V13.1 - Accepts GET for a destructive action
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({
    success: true,
    message: `Product ${req.params.id} deleted`,
    flag: 'FLAG{g3t_r3qu3st_d3l3t3s_pr0duct}'
  });
});

module.exports = router;
