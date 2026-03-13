import React, { useState, useEffect } from 'react';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [form, setForm] = useState({ toUserId: '', subject: '', body: '', encrypt: false });
  const [message, setMessage] = useState('');
  const [xmlImport, setXmlImport] = useState('');
  const [xmlResult, setXmlResult] = useState(null);
  const [activeTab, setActiveTab] = useState('inbox');

  useEffect(() => {
    fetch('/api/v2/messages', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setMessages(data); });
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/v2/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ...form, toUserId: parseInt(form.toUserId) })
    });
    if (res.ok) {
      setMessage('Message sent successfully.');
      setForm({ toUserId: '', subject: '', body: '', encrypt: false });
    }
  };

  const importProducts = async () => {
    const res = await fetch('/api/products/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ xml: xmlImport })
    });
    const data = await res.json();
    setXmlResult(data);
  };

  return (
    <div>
      <div className="page-title">Messages</div>
      {message && <div className="alert alert-success">{message}</div>}

      <div className="tabs mb-20">
        <div className={`tab ${activeTab === 'inbox' ? 'active' : ''}`} onClick={() => setActiveTab('inbox')}>Inbox</div>
        <div className={`tab ${activeTab === 'compose' ? 'active' : ''}`} onClick={() => setActiveTab('compose')}>Compose</div>
        <div className={`tab ${activeTab === 'tools' ? 'active' : ''}`} onClick={() => setActiveTab('tools')}>Import Tools</div>
      </div>

      {activeTab === 'inbox' && (
        <div className="card">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">&#9993;</div>
              <p>No messages in your inbox.</p>
            </div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className="message-item">
                <div className="message-avatar">{(msg.from_username || 'U')[0].toUpperCase()}</div>
                <div className="message-content">
                  <div className="message-from">{msg.from_username}</div>
                  <div className="message-subject">{msg.subject}</div>
                  <div className="message-body">{msg.encrypted ? 'This message is encrypted.' : msg.body}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'compose' && (
        <div className="card">
          <h2>New Message</h2>
          <form onSubmit={sendMessage}>
            <div className="form-group">
              <label>Recipient (User ID)</label>
              <input type="number" value={form.toUserId} onChange={e => setForm({...form, toUserId: e.target.value})} placeholder="Enter user ID" />
            </div>
            <div className="form-group">
              <label>Subject</label>
              <input type="text" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder="Message subject" />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea value={form.body} onChange={e => setForm({...form, body: e.target.value})} rows={4} placeholder="Write your message..." />
            </div>
            <div className="form-check mb-16">
              <input type="checkbox" checked={form.encrypt} onChange={e => setForm({...form, encrypt: e.target.checked})} />
              <span>Encrypt this message</span>
            </div>
            <button type="submit" className="btn btn-primary">Send Message</button>
          </form>
        </div>
      )}

      {activeTab === 'tools' && (
        <div className="two-col">
          <div className="card">
            <h2>Product Import (XML)</h2>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>Bulk import products using XML format.</p>
            <div className="form-group">
              <textarea
                value={xmlImport}
                onChange={e => setXmlImport(e.target.value)}
                rows={10}
                placeholder={`<?xml version="1.0"?>\n<products>\n  <product>\n    <name>Product Name</name>\n    <description>Description</description>\n    <price>9.99</price>\n  </product>\n</products>`}
                style={{ fontFamily: 'monospace', fontSize: 12 }}
              />
            </div>
            <button onClick={importProducts} className="btn btn-primary">Import Products</button>
            {xmlResult && (
              <div className="code-block mt-16">
                {JSON.stringify(xmlResult, null, 2)}
              </div>
            )}
          </div>
          <div className="card">
            <h2>Encryption Tools</h2>
            <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
              Test the platform's message encryption and decryption endpoints.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <a href="/api/v2/messages/encrypt" target="_blank" className="btn btn-outline btn-sm" style={{ textDecoration: 'none' }}>Encrypt API</a>
              <a href="/api/v2/messages/decrypt" target="_blank" className="btn btn-outline btn-sm" style={{ textDecoration: 'none' }}>Decrypt API</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
