import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetch('/api/orders/cart', { credentials: 'include' })
        .then(r => r.json())
        .then(data => { if (Array.isArray(data)) setCartCount(data.length); })
        .catch(() => {});
    }
  }, [user, location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getInitials = (name) => {
    return (name || 'U')[0].toUpperCase();
  };

  return (
    <>
      <div className="top-bar">
        <div className="top-bar-inner">
          <span>Free shipping on orders over $50</span>
          <div>
            <a href="/swagger.json" target="_blank">API</a>
            <a href="/graphql" target="_blank">GraphQL</a>
            <Link to="/scoreboard">Scoreboard</Link>
          </div>
        </div>
      </div>
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-brand">
            <Link to="/">Vuln<span className="brand-accent">Corp</span></Link>
          </div>

          <form className="navbar-search" onSubmit={handleSearch}>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products..."
            />
            <button type="submit">&#128269;</button>
          </form>

          <div className="navbar-actions">
            <Link to="/products" className={`nav-link ${location.pathname === '/products' ? 'active' : ''}`}>
              <span className="nav-icon">&#128722;</span>
              <span>Shop</span>
            </Link>
            {user ? (
              <>
                <Link to="/orders" className={`nav-link ${location.pathname === '/orders' ? 'active' : ''}`}>
                  <span className="nav-icon">&#128230;</span>
                  <span>Orders</span>
                </Link>
                <Link to="/messages" className={`nav-link ${location.pathname === '/messages' ? 'active' : ''}`}>
                  <span className="nav-icon">&#9993;</span>
                  <span>Messages</span>
                </Link>
                <Link to="/files" className={`nav-link ${location.pathname === '/files' ? 'active' : ''}`}>
                  <span className="nav-icon">&#128193;</span>
                  <span>Files</span>
                </Link>
                {/* VULN: V4.1 - Admin link hidden client-side only */}
                {user.role === 'admin' && (
                  <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>
                    <span className="nav-icon">&#9881;</span>
                    <span>Admin</span>
                  </Link>
                )}
                <Link to="/cart" className="nav-link nav-cart">
                  <span className="nav-icon">&#128722;</span>
                  {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
                </Link>
                <Link to="/profile" className="nav-user-badge" style={{ textDecoration: 'none' }}>
                  <span className="nav-user-avatar">{getInitials(user.username)}</span>
                  <span>{user.username}</span>
                </Link>
                <button onClick={logout} className="btn-nav-logout">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Sign In</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <div className="category-strip">
        <div className="category-strip-inner">
          <Link to="/products" className="cat-link">All Products</Link>
          <Link to="/products?cat=Electronics" className="cat-link">Electronics</Link>
          <Link to="/products?cat=Security" className="cat-link">Security</Link>
          <Link to="/products?cat=Accessories" className="cat-link">Accessories</Link>
          <Link to="/products?cat=Software" className="cat-link">Software</Link>
          <Link to="/products?cat=Hardware" className="cat-link">Hardware</Link>
          <Link to="/scoreboard" className="cat-link">Challenges</Link>
        </div>
      </div>
    </>
  );
}
