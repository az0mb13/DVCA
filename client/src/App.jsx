import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import ForgotPassword from './pages/ForgotPassword';
import FileUpload from './pages/FileUpload';
import Messages from './pages/Messages';

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/files" element={<FileUpload />} />
          <Route path="/messages" element={<Messages />} />
        </Routes>
      </main>
      <footer className="footer">
        <div className="footer-main">
          <div className="footer-brand">
            <h3>DVCA</h3>
            <p>Your trusted partner in enterprise technology solutions. Quality products, competitive prices, and exceptional service since 2018.</p>
          </div>
          <div className="footer-col">
            <h4>Shop</h4>
            <Link to="/products">All Products</Link>
            <Link to="/products?cat=Electronics">Electronics</Link>
            <Link to="/products?cat=Security">Security</Link>
            <Link to="/products?cat=Software">Software</Link>
          </div>
          <div className="footer-col">
            <h4>Account</h4>
            <Link to="/profile">My Profile</Link>
            <Link to="/orders">Order History</Link>
            <Link to="/cart">Shopping Cart</Link>
            <Link to="/messages">Messages</Link>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <a href="/swagger.json" target="_blank">API Docs</a>
            <a href="/robots.txt" target="_blank">Sitemap</a>
            <a href="mailto:support@dvca.com">Contact Us</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2024 DVCA, Inc. All rights reserved.</span>
          <span>v1.0.0</span>
        </div>
      </footer>
    </div>
  );
}
