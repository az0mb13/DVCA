import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Checkout() {
  const [items, setItems] = useState([]);
  const [creditCard, setCreditCard] = useState('');
  const [address, setAddress] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/orders/cart', { credentials: 'include' })
      .then(r => r.json())
      .then(data => setItems(Array.isArray(data) ? data : []));
  }, []);

  const applyCoupon = async () => {
    const res = await fetch('/api/orders/apply-coupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ code: couponCode })
    });
    const data = await res.json();
    if (res.ok) {
      setDiscount(prev => prev + data.discount);
      setMessage(`Coupon applied: ${data.discount}% off`);
    } else {
      setError(data.error);
    }
  };

  const placeOrder = async () => {
    setError('');
    const res = await fetch('/api/orders/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ creditCard, shippingAddress: address, couponCode })
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(`Order placed successfully! Order #${data.orderId}`);
      setTimeout(() => navigate('/orders'), 2000);
    } else {
      setError(data.error || 'Checkout failed');
    }
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 5.99;
  const discountAmount = subtotal * (discount / 100);
  const total = Math.max(0, subtotal - discountAmount + shipping);

  return (
    <div>
      <div className="page-title">Checkout</div>
      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <div className="checkout-grid">
        <div>
          <div className="card">
            <h2>Shipping Information</h2>
            <div className="form-group">
              <label>Shipping Address</label>
              <textarea value={address} onChange={e => setAddress(e.target.value)} rows={3} placeholder="Enter your full shipping address" />
            </div>
          </div>

          <div className="card">
            <h2>Payment Method</h2>
            <div className="form-group">
              <label>Card Number</label>
              <input type="text" value={creditCard} onChange={e => setCreditCard(e.target.value)} placeholder="4111 1111 1111 1111" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Expiry Date</label>
                <input type="text" placeholder="MM/YY" />
              </div>
              <div className="form-group">
                <label>CVV</label>
                <input type="text" placeholder="123" />
              </div>
            </div>
          </div>

          <div className="card">
            <h2>Promo Code</h2>
            <div className="flex gap-8">
              <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="Enter promo code" style={{ flex: 1 }} />
              <button onClick={applyCoupon} className="btn btn-secondary">Apply</button>
            </div>
            {discount > 0 && <p className="mt-8" style={{ color: '#2e7d32', fontWeight: 500 }}>Discount: {discount}% off</p>}
          </div>
        </div>

        <div>
          <div className="card order-summary-sidebar">
            <h2>Order Summary</h2>
            {items.map(item => (
              <div key={item.id} className="info-row">
                <span className="info-label">{item.name} x{item.quantity}</span>
                <span className="info-value">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="info-row">
              <span className="info-label">Subtotal</span>
              <span className="info-value">${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="info-row">
                <span className="info-label">Discount ({discount}%)</span>
                <span className="info-value" style={{ color: '#2e7d32' }}>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="info-row">
              <span className="info-label">Shipping</span>
              <span className="info-value" style={{ color: '#2e7d32' }}>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="info-row" style={{ borderBottom: 'none', paddingTop: 12 }}>
              <span style={{ fontSize: 16, fontWeight: 700 }}>Total</span>
              <span style={{ fontSize: 20, fontWeight: 700 }}>${total.toFixed(2)}</span>
            </div>
            <button onClick={placeOrder} className="btn btn-success btn-block mt-16">Place Order</button>
          </div>
        </div>
      </div>
    </div>
  );
}
