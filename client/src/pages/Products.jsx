import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(data => {
      const cat = searchParams.get('cat');
      const q = searchParams.get('q');
      if (q) {
        setSearchQuery(q);
        handleSearchDirect(q);
      }
      if (cat && Array.isArray(data)) {
        setProducts(data.filter(p => p.category === cat));
      } else {
        setProducts(Array.isArray(data) ? data : []);
      }
    });
  }, [searchParams]);

  const handleSearchDirect = async (query) => {
    document.cookie = `recentSearch=${query}; path=/`;
    try {
      const res = await fetch(`/api/products/search/query?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(Array.isArray(data) ? data : []);
    } catch {
      setSearchResults([]);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    handleSearchDirect(searchQuery);
  };

  const displayProducts = searchResults !== null ? searchResults : products;

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="page-title" style={{ marginBottom: 0 }}>
            {searchParams.get('cat') ? searchParams.get('cat') : 'All Products'}
          </div>
          <div className="section-subtitle">{displayProducts.length} products found</div>
        </div>
      </div>

      <div className="card mb-20">
        <form onSubmit={handleSearch} className="flex gap-8 items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, category, or description..."
            style={{ flex: 1, padding: '10px 14px', border: '1px solid #d0d4db', borderRadius: 6, fontSize: 14 }}
          />
          <button type="submit" className="btn btn-primary">Search</button>
          {searchResults !== null && (
            <button type="button" className="btn btn-secondary" onClick={() => { setSearchResults(null); setSearchQuery(''); }}>Clear</button>
          )}
        </form>
      </div>

      <div className="products-grid">
        {displayProducts.map(product => (
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

      {displayProducts.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">&#128269;</div>
          <p>No products found. Try a different search term.</p>
          <Link to="/products">Browse all products</Link>
        </div>
      )}
    </div>
  );
}
