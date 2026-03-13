import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Cart() {
  const [items, setItems] = useState([]);

  const loadCart = () => {
    fetch('/api/orders/cart', { credentials: 'include' })
      .then(r => r.json())
      .then(data => setItems(Array.isArray(data) ? data : []));
  };

  useEffect(() => { loadCart(); }, []);

  const updateQuantity = async (itemId, quantity) => {
    await fetch(`/api/orders/cart/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ quantity })
    });
    loadCart();
  };

  const removeItem = async (itemId) => {
    await fetch(`/api/orders/cart/${itemId}`, { method: 'DELETE', credentials: 'include' });
    loadCart();
  };

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div>
      <div className="page-title">Shopping Cart</div>

      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">&#128722;</div>
          <p>Your cart is empty</p>
          <Link to="/products">Continue Shopping</Link>
        </div>
      ) : (
        <div className="checkout-grid">
          <div className="card">
            <h2>Cart Items ({items.length})</h2>
            {items.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-img">
                  {item.image_url
                    ? <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
                    : '\u{1F4E6}'
                  }
                </div>
                <div>
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">${item.price?.toFixed(2)} each</div>
                </div>
                <div className="cart-qty">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={e => updateQuantity(item.id, parseInt(e.target.value))}
                    // VULN: V5.1 - No client-side validation on quantity (can go negative)
                  />
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                </div>
                <div className="cart-item-price" style={{ fontWeight: 600 }}>${(item.price * item.quantity).toFixed(2)}</div>
                <button onClick={() => removeItem(item.id)} className="btn btn-sm btn-secondary">Remove</button>
              </div>
            ))}
          </div>
          <div>
            <div className="card order-summary-sidebar">
              <h2>Order Summary</h2>
              <div className="info-row">
                <span className="info-label">Subtotal</span>
                <span className="info-value">${total.toFixed(2)}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Shipping</span>
                <span className="info-value" style={{ color: '#2e7d32' }}>{total > 50 ? 'Free' : '$5.99'}</span>
              </div>
              <div className="info-row" style={{ borderBottom: 'none', paddingTop: 12 }}>
                <span style={{ fontSize: 16, fontWeight: 700 }}>Total</span>
                <span style={{ fontSize: 20, fontWeight: 700 }}>${(total > 50 ? total : total + 5.99).toFixed(2)}</span>
              </div>
              <Link to="/checkout" className="btn btn-success btn-block mt-16" style={{ textDecoration: 'none' }}>
                Proceed to Checkout
              </Link>
              <Link to="/products" className="btn btn-secondary btn-block mt-8" style={{ textDecoration: 'none' }}>
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
