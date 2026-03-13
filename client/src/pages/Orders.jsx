import React, { useState, useEffect } from 'react';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [lookupUserId, setLookupUserId] = useState('');

  useEffect(() => {
    fetch('/api/orders/history', { credentials: 'include' })
      .then(r => r.json())
      .then(data => setOrders(data.orders || []));
  }, []);

  const lookupOrders = async () => {
    const res = await fetch(`/api/orders/history?userId=${lookupUserId}`, { credentials: 'include' });
    const data = await res.json();
    setOrders(data.orders || []);
  };

  const getStatusBadge = (status) => {
    const classes = {
      completed: 'badge-completed',
      pending: 'badge-pending',
      shipped: 'badge-shipped',
    };
    return `badge-status ${classes[status] || 'badge-pending'}`;
  };

  return (
    <div>
      <div className="page-title">Order History</div>

      <div className="card mb-20">
        <div className="flex gap-8 items-center">
          <span className="text-muted" style={{ fontSize: 13 }}>Filter by account:</span>
          <input
            type="number"
            value={lookupUserId}
            onChange={e => setLookupUserId(e.target.value)}
            placeholder="Account ID"
            style={{ width: 120 }}
          />
          <button onClick={lookupOrders} className="btn btn-primary btn-sm">Search</button>
        </div>
      </div>

      <div className="card">
        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">&#128230;</div>
            <p>No orders found.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 600 }}>#{String(order.id).padStart(5, '0')}</td>
                    <td>{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td><span className={getStatusBadge(order.status)}>{order.status}</span></td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{order.credit_card}</td>
                    <td style={{ fontWeight: 600 }}>${order.total?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
