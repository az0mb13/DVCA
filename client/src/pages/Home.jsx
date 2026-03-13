import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => setFeatured(Array.isArray(data) ? data.slice(0, 8) : []));
  }, []);

  const categories = [
    { name: 'Electronics', icon: '/images/laptop.jpg' },
    { name: 'Security Tools', icon: '/images/usb.jpg' },
    { name: 'Networking', icon: '/images/router.jpg' },
    { name: 'Books', icon: '/images/book.jpg' },
    { name: 'Apparel', icon: '/images/hoodie.jpg' },
    { name: 'Collectibles', icon: '/images/badge.jpg' },
  ];

  return (
    <div>
      <div className="hero">
        <h1>Enterprise Technology Solutions</h1>
        <p>Shop the latest in cybersecurity tools, networking hardware, and enterprise software. Trusted by 10,000+ professionals worldwide.</p>
        <Link to="/products" className="btn btn-lg" style={{ background: '#fff', color: '#0d2137' }}>
          Shop Now
        </Link>
      </div>

      <div className="promo-grid">
        <div className="promo-card promo-blue">
          <h3>Spring Sale</h3>
          <p>Up to 30% off security tools</p>
        </div>
        <div className="promo-card promo-green">
          <h3>Free Shipping</h3>
          <p>On orders over $50</p>
        </div>
        <div className="promo-card promo-orange">
          <h3>New Arrivals</h3>
          <p>Latest enterprise hardware</p>
        </div>
      </div>

      <div className="section-header">
        <div>
          <div className="section-title">Featured Products</div>
          <div className="section-subtitle">Our most popular items this month</div>
        </div>
        <Link to="/products" className="section-link">View All &rarr;</Link>
      </div>

      <div className="products-grid">
        {featured.map(product => (
          <Link to={`/products/${product.id}`} key={product.id} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="product-card card-hover">
              <div className="product-img">
                <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {product.is_limited ? <span className="product-badge">Limited</span> : null}
              </div>
              <div className="product-info">
                <div className="product-category">{product.category}</div>
                <div className="product-name">{product.name}</div>
                <div className="product-rating">
                  {Array.from({length: 5}, (_, i) => (
                    <span key={i} className={`star ${i < 4 ? '' : 'empty'}`}>&#9733;</span>
                  ))}
                </div>
                <div className="product-price">${product.price?.toFixed(2)}</div>
                <div className={`product-stock ${product.stock < 5 ? 'low' : ''}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-24" />

      <div className="section-header">
        <div>
          <div className="section-title">Shop by Category</div>
          <div className="section-subtitle">Find what you need</div>
        </div>
      </div>

      <div className="three-col mb-20">
        {categories.map(cat => (
          <Link to={`/products?cat=${encodeURIComponent(cat.name)}`} key={cat.name} style={{ textDecoration: 'none' }}>
            <div className="card card-hover text-center" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ height: 120, overflow: 'hidden' }}>
                <img src={cat.icon} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '14px 16px', fontWeight: 600, color: '#1a1a1a' }}>{cat.name}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
