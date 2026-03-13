// VULN: V4/V5/V6/V11 - Order routes with business logic flaws
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Get cart
router.get('/cart', requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const items = db.prepare(
    'SELECT c.*, p.name, p.price, p.image_url FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?'
  ).all(req.session.userId);
  res.json(items);
});

// Add to cart
router.post('/cart', requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const { productId, quantity } = req.body;

  // VULN: V5.1 - No validation on quantity (can be negative)
  const existing = db.prepare('SELECT * FROM cart WHERE user_id = ? AND product_id = ?').get(req.session.userId, productId);
  if (existing) {
    db.prepare('UPDATE cart SET quantity = quantity + ? WHERE id = ?').run(quantity || 1, existing.id);
  } else {
    db.prepare('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)').run(
      req.session.userId, productId, quantity || 1
    );
  }

  res.json({ success: true });
});

// Update cart item
router.put('/cart/:itemId', requireAuth, (req, res) => {
  const db = req.app.locals.db;
  // VULN: V5.1 - No validation on quantity
  db.prepare('UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?').run(
    req.body.quantity, req.params.itemId, req.session.userId
  );
  res.json({ success: true });
});

// Delete cart item
router.delete('/cart/:itemId', requireAuth, (req, res) => {
  const db = req.app.locals.db;
  db.prepare('DELETE FROM cart WHERE id = ? AND user_id = ?').run(req.params.itemId, req.session.userId);
  res.json({ success: true });
});

// Checkout
router.post('/checkout', requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const { creditCard, shippingAddress, couponCode, orderToken } = req.body;

  // VULN: V11.1 - Replay attack: if orderToken already used, still processes
  if (orderToken) {
    const existingOrder = db.prepare('SELECT * FROM orders WHERE order_token = ?').get(orderToken);
    if (existingOrder) {
      // VULN: V11.1 - Should reject duplicate token, but doesn't
    }
  }

  const cartItems = db.prepare(
    'SELECT c.*, p.name, p.price, p.stock, p.is_limited FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?'
  ).all(req.session.userId);

  if (cartItems.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  // VULN: V5.1 - Price can be overridden from request body
  let total = 0;
  const orderItems = cartItems.map(item => {
    // VULN: V5.1 - Uses client-supplied price if provided in body
    const price = req.body.items?.[item.product_id]?.price ?? item.price;
    const quantity = item.quantity; // Can be negative!
    total += price * quantity;
    return { productId: item.product_id, quantity, price };
  });

  // VULN: V11.1 - Coupon can be applied multiple times
  let discount = 0;
  if (couponCode) {
    const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND is_active = 1').get(couponCode);
    if (coupon) {
      discount = total * (coupon.discount_percent / 100);
      // VULN: V11.1 - Doesn't check if coupon already used on this order
      db.prepare('UPDATE coupons SET times_used = times_used + 1 WHERE id = ?').run(coupon.id);
    }
  }

  // Apply multiple coupons if sent as array
  if (req.body.couponCodes && Array.isArray(req.body.couponCodes)) {
    for (const code of req.body.couponCodes) {
      const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND is_active = 1').get(code);
      if (coupon) {
        discount += total * (coupon.discount_percent / 100);
      }
    }
  }

  total = Math.max(0, total - discount);

  const token = orderToken || uuidv4();

  // VULN: V6.1 - Credit card stored in plaintext
  const order = db.prepare(
    'INSERT INTO orders (user_id, total, status, order_token, credit_card, shipping_address) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(req.session.userId, total, 'pending', token, creditCard, shippingAddress);

  for (const item of orderItems) {
    db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)').run(
      order.lastInsertRowid, item.productId, item.quantity, item.price
    );

    // VULN: V11.1 - Race condition: stock not checked atomically
    db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(item.quantity, item.productId);
  }

  // Clear cart
  db.prepare('DELETE FROM cart WHERE user_id = ?').run(req.session.userId);

  const flags = [];
  if (total <= 0) flags.push('FLAG{n3g4t1v3_qu4nt1ty_fr33_1t3ms}');
  if (discount > 0) flags.push('FLAG{c0up0n_st4ck1ng_d1sc0unt}');

  res.json({
    success: true,
    orderId: order.lastInsertRowid,
    total,
    discount,
    orderToken: token,
    flags: flags.length > 0 ? flags : undefined
  });
});

// VULN: V4.2 - IDOR: view any user's orders
router.get('/history', requireAuth, (req, res) => {
  const db = req.app.locals.db;
  // VULN: V4.2 - userId from query param, not session
  const userId = req.query.userId || req.session.userId;

  const orders = db.prepare(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC'
  ).all(userId);

  // VULN: V6.1 - Credit card numbers in response
  const flags = [];
  if (parseInt(userId) !== req.session.userId) {
    flags.push('FLAG{1d0r_0rd3r_h1st0ry}');
  }

  res.json({
    orders,
    flags: flags.length > 0 ? flags : undefined
  });
});

// VULN: V4.2 - View specific order by ID (IDOR)
router.get('/:orderId', requireAuth, (req, res) => {
  const db = req.app.locals.db;
  // VULN: V4.2 - No check that order belongs to current user
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.orderId);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const items = db.prepare(
    'SELECT oi.*, p.name FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?'
  ).all(order.id);

  res.json({ ...order, items });
});

// Apply coupon (separate endpoint for stacking)
router.post('/apply-coupon', requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const { code } = req.body;

  const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND is_active = 1').get(code);
  if (!coupon) return res.status(404).json({ error: 'Invalid coupon code' });

  // VULN: V11.1 - No check for duplicate usage
  res.json({
    success: true,
    discount: coupon.discount_percent,
    code: coupon.code
  });
});

// Referral endpoint
router.post('/referral', requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const { referralCode } = req.body;

  const referrer = db.prepare('SELECT id FROM users WHERE api_token = ?').get(referralCode);
  if (!referrer) return res.status(404).json({ error: 'Invalid referral code' });

  // VULN: V11.1 - Self-referral allowed
  db.prepare('INSERT INTO referrals (referrer_id, referred_id) VALUES (?, ?)').run(
    referrer.id, req.session.userId
  );

  res.json({
    success: true,
    credit: 10.00,
    flag: referrer.id === req.session.userId ? 'FLAG{s3lf_r3f3rr4l_cr3d1t}' : undefined
  });
});

module.exports = router;
