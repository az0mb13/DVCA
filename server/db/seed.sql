-- DVCA Seed Data

-- Users (MD5 hashes of common passwords)
-- admin123 = 0192023a7bbd73250516f069df18b500
-- password = 5f4dcc3b5aa765d61d8327deb882cf99
-- 123456 = e10adc3949ba59abbe56e057f20f883e
-- qwerty = d8578edf8458ce06fbc5bb76a58c5ca4
-- letmein = 0d107d09f5bbe40cade3de5c71e9e9b7

INSERT OR IGNORE INTO users (id, username, email, password_hash, role, first_name, last_name, bio, phone, address, ssn, security_question, security_answer, totp_secret, totp_enabled, api_token) VALUES
(1, 'admin', 'admin@dvca.com', '0192023a7bbd73250516f069df18b500', 'admin', 'Admin', 'User', 'System administrator', '555-0100', '123 Admin St, Corporate HQ', '123-45-6789', 'What is your pet''s name?', 'fluffy', 'JBSWY3DPEHPK3PXP', 1, 'vtoken_a1b2c3d4e5f6'),
(2, 'john', 'john@dvca.com', '5f4dcc3b5aa765d61d8327deb882cf99', 'user', 'John', 'Smith', 'Regular user account <script>alert("xss")</script>', '555-0101', '456 User Ave, Apt 2B', '987-65-4321', 'What is your pet''s name?', 'buddy', NULL, 0, 'vtoken_g7h8i9j0k1l2'),
(3, 'jane', 'jane@dvca.com', 'e10adc3949ba59abbe56e057f20f883e', 'user', 'Jane', 'Doe', 'Product reviewer', '555-0102', '789 Test Blvd', '456-78-9012', 'What city were you born in?', 'springfield', NULL, 0, 'vtoken_m3n4o5p6q7r8'),
(4, 'bob', 'bob@dvca.com', 'd8578edf8458ce06fbc5bb76a58c5ca4', 'manager', 'Bob', 'Wilson', 'Department manager', '555-0103', '321 Manager Lane', '111-22-3333', 'What is your mother''s maiden name?', 'johnson', NULL, 0, 'vtoken_s9t0u1v2w3x4'),
(5, 'testuser', 'test@dvca.com', '0d107d09f5bbe40cade3de5c71e9e9b7', 'user', 'Test', 'Account', 'Test account for QA', '555-0104', '999 Test Street', '000-00-0000', 'What is your pet''s name?', 'max', NULL, 0, 'vtoken_y5z6a7b8c9d0');

-- Products
INSERT OR IGNORE INTO products (id, name, description, price, category, image_url, stock, is_limited) VALUES
(1, 'DVCA Laptop Pro', 'High-performance laptop for security professionals', 1299.99, 'Electronics', '/images/laptop.jpg', 50, 0),
(2, 'Secure Router X1', 'Enterprise-grade router', 249.99, 'Networking', '/images/router.jpg', 100, 0),
(3, 'USB Rubber Ducky', 'Keystroke injection tool for penetration testing', 49.99, 'Security Tools', '/images/usb.jpg', 200, 0),
(4, 'WiFi Pineapple', 'Wireless auditing platform', 199.99, 'Security Tools', '/images/pineapple.jpg', 75, 0),
(5, 'Lock Pick Set', 'Professional lock picking training set', 29.99, 'Physical Security', '/images/lockpick.jpg', 150, 0),
(6, 'Security Textbook', 'Web Application Security: A Beginner''s Guide', 44.99, 'Books', '/images/book.jpg', 300, 0),
(7, 'Hacker Hoodie', 'Limited edition DVCA hoodie', 59.99, 'Apparel', '/images/hoodie.jpg', 25, 0),
(8, 'Network Cable Kit', 'Cat6 ethernet cable bundle (10-pack)', 34.99, 'Networking', '/images/cables.jpg', 500, 0),
(9, 'Crypto Hardware Wallet', 'Store your crypto securely', 79.99, 'Security Tools', '/images/wallet.jpg', 60, 0),
(10, 'Limited Edition Badge', 'DVCA conference badge - LAST ONE!', 999.99, 'Collectibles', '/images/badge.jpg', 1, 1),
(11, 'Raspberry Pi Kit', 'Complete hacking lab starter kit', 89.99, 'Electronics', '/images/rpi.jpg', 40, 0),
(12, 'RFID Reader', 'NFC/RFID reader for security research', 39.99, 'Security Tools', '/images/rfid.jpg', 80, 0);

-- Sample orders
INSERT OR IGNORE INTO orders (id, user_id, total, status, order_token, credit_card, shipping_address) VALUES
(1, 2, 1349.98, 'completed', 'ord_token_001', '4111111111111111', '456 User Ave, Apt 2B'),
(2, 2, 249.99, 'completed', 'ord_token_002', '4111111111111111', '456 User Ave, Apt 2B'),
(3, 3, 94.98, 'pending', 'ord_token_003', '5500000000000004', '789 Test Blvd'),
(4, 4, 1299.99, 'shipped', 'ord_token_004', '340000000000009', '321 Manager Lane');

INSERT OR IGNORE INTO order_items (order_id, product_id, quantity, price) VALUES
(1, 1, 1, 1299.99),
(1, 3, 1, 49.99),
(2, 2, 1, 249.99),
(3, 5, 1, 29.99),
(3, 6, 1, 44.99),
(3, 12, 1, 19.99),
(4, 1, 1, 1299.99);

-- Reviews
INSERT OR IGNORE INTO reviews (product_id, user_id, rating, comment) VALUES
(1, 2, 5, 'Great laptop, very fast!'),
(1, 3, 4, 'Good but a bit expensive'),
(2, 4, 3, 'Works okay for the price'),
(3, 2, 5, 'Essential tool for pentesting'),
(6, 3, 5, 'Really helped me learn about web security'),
(7, 2, 4, 'Comfy hoodie, nice design');

-- Coupons
INSERT OR IGNORE INTO coupons (code, discount_percent, max_uses) VALUES
('WELCOME10', 10, 100),
('SAVE20', 20, 50),
('HALFOFF', 50, 10),
('LOYALTY', 15, 1000),
('EMPLOYEE', 90, 5);

-- Messages
INSERT OR IGNORE INTO messages (from_user_id, to_user_id, subject, body, encrypted) VALUES
(1, 2, 'Welcome to DVCA', 'Welcome aboard! Your employee ID is EMP-2024-0042. Please keep this confidential.', 0),
(1, 4, 'Q4 Budget - CONFIDENTIAL', 'a]É3ñk%d�bÎ', 1),
(2, 3, 'Hey', 'Want to grab lunch tomorrow?', 0);

-- App configuration
INSERT OR IGNORE INTO app_config (key, value) VALUES
('difficulty', 'easy'),
('site_name', 'DVCA Store'),
('maintenance_mode', 'false'),
('debug_mode', 'true'),
('max_upload_size', '52428800'),
('allow_registration', 'true');
