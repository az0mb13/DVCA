import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [message, setMessage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    fetch(`/api/products/${id}`).then(r => r.json()).then(setProduct);
  }, [id]);

  const addToCart = async () => {
    const res = await fetch('/api/orders/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ productId: parseInt(id), quantity })
    });
    if (res.ok) setMessage('Added to cart!');
    else setMessage('Please sign in to add items to your cart.');
  };

  const submitReview = async (e) => {
    e.preventDefault();
    const res = await fetch(`/api/products/${id}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ rating: reviewRating, comment: reviewComment })
    });
    if (res.ok) {
      setReviewComment('');
      fetch(`/api/products/${id}`).then(r => r.json()).then(setProduct);
      setMessage('Review submitted!');
    }
  };

  if (!product) return <div className="empty-state"><p>Loading product...</p></div>;

  return (
    <div>
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/products">Products</Link>
        <span>/</span>
        {product.name}
      </div>

      {message && <div className="alert alert-success">{message}</div>}

      <div className="product-detail-grid">
        <div className="product-detail-img">
          <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
        </div>
        <div className="product-detail-info">
          <div className="product-category">{product.category}</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', margin: '8px 0' }}>{product.name}</h1>
          <div className="product-rating">
            {Array.from({length: 5}, (_, i) => (
              <span key={i} className={`star ${i < 4 ? '' : 'empty'}`}>&#9733;</span>
            ))}
            <span className="text-muted" style={{ marginLeft: 8, fontSize: 13 }}>
              ({product.reviews?.length || 0} reviews)
            </span>
          </div>
          <div className="product-price">${product.price?.toFixed(2)}</div>

          <div className="product-meta">
            <div className="product-meta-item"><strong>SKU:</strong> VC-{String(product.id).padStart(4, '0')}</div>
            <div className="product-meta-item"><strong>Category:</strong> {product.category}</div>
            <div className="product-meta-item">
              <strong>Availability:</strong>{' '}
              <span style={{ color: product.stock > 0 ? '#2e7d32' : '#c62828' }}>
                {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
              </span>
            </div>
            {product.is_limited && (
              <div className="product-meta-item"><strong>Note:</strong> <span style={{ color: '#c62828' }}>Limited Edition</span></div>
            )}
          </div>

          <div className="quantity-selector">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
            <input type="number" value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)} />
            <button onClick={() => setQuantity(quantity + 1)}>+</button>
          </div>

          <button onClick={addToCart} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
            Add to Cart
          </button>
        </div>
      </div>

      <div className="mt-24">
        <div className="tabs">
          <div className={`tab ${activeTab === 'description' ? 'active' : ''}`} onClick={() => setActiveTab('description')}>Description</div>
          <div className={`tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
            Reviews ({product.reviews?.length || 0})
          </div>
        </div>

        {activeTab === 'description' && (
          <div className="card">
            <p style={{ lineHeight: 1.7, color: '#444' }}>{product.description}</p>
          </div>
        )}

        {activeTab === 'reviews' && (
          <>
            <div className="card">
              {product.reviews?.length > 0 ? product.reviews.map(review => (
                <div key={review.id} className="review">
                  <div className="review-header">
                    <div className="review-avatar">{(review.username || 'U')[0].toUpperCase()}</div>
                    <div>
                      <div className="review-author">{review.username}</div>
                      <div className="review-stars">
                        {Array.from({length: 5}, (_, i) => (
                          <span key={i} className={`star ${i < review.rating ? '' : 'empty'}`}>&#9733;</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* VULN: V5.2/V5.3 - Review comment rendered as HTML (Stored XSS) */}
                  <div className="review-body" dangerouslySetInnerHTML={{ __html: review.comment }} />
                </div>
              )) : (
                <div className="empty-state">
                  <p>No reviews yet. Be the first to share your thoughts!</p>
                </div>
              )}
            </div>

            {user && (
              <div className="card">
                <h2>Write a Review</h2>
                <form onSubmit={submitReview}>
                  <div className="form-group">
                    <label>Rating</label>
                    <select value={reviewRating} onChange={e => setReviewRating(parseInt(e.target.value))}>
                      {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Your Review</label>
                    <textarea
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      rows={3}
                      placeholder="Share your experience with this product..."
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">Submit Review</button>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
