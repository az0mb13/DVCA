import React, { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [difficulty, setDifficulty] = useState('easy');
  const [message, setMessage] = useState('');
  const [activeSection, setActiveSection] = useState('overview');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookResult, setWebhookResult] = useState(null);
  const [pluginUrl, setPluginUrl] = useState('');
  const [pluginName, setPluginName] = useState('');

  useEffect(() => {
    fetch('/admin/dashboard', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { if (data.stats) setStats(data.stats); });
    fetch('/admin/users', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setUsers(data); });
    fetch('/api/config/difficulty')
      .then(r => r.json())
      .then(data => setDifficulty(data.difficulty));
  }, []);

  const changeDifficulty = async (level) => {
    await fetch('/api/config/difficulty', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ difficulty: level })
    });
    setDifficulty(level);
    setMessage(`Difficulty changed to ${level}`);
  };

  const testWebhook = async () => {
    const res = await fetch('/admin/webhooks/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ url: webhookUrl })
    });
    const data = await res.json();
    setWebhookResult(data);
  };

  const installPlugin = async () => {
    const res = await fetch('/admin/plugins/install', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ url: pluginUrl, name: pluginName })
    });
    const data = await res.json();
    setMessage(data.success ? `Plugin installed: ${data.result}` : data.error);
  };

  return (
    <div>
      <div className="page-title">Administration</div>
      {message && <div className="alert alert-success">{message}</div>}

      <div className="admin-layout">
        <div className="admin-sidebar">
          <button className={activeSection === 'overview' ? 'active' : ''} onClick={() => setActiveSection('overview')}>
            &#128202; Overview
          </button>
          <button className={activeSection === 'users' ? 'active' : ''} onClick={() => setActiveSection('users')}>
            &#128101; Users
          </button>
          <button className={activeSection === 'settings' ? 'active' : ''} onClick={() => setActiveSection('settings')}>
            &#9881; Settings
          </button>
          <button className={activeSection === 'webhooks' ? 'active' : ''} onClick={() => setActiveSection('webhooks')}>
            &#128279; Webhooks
          </button>
          <button className={activeSection === 'plugins' ? 'active' : ''} onClick={() => setActiveSection('plugins')}>
            &#128268; Plugins
          </button>
        </div>

        <div>
          {activeSection === 'overview' && (
            <>
              {stats && (
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-value">{stats.userCount}</div>
                    <div className="stat-label">Total Users</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{stats.orderCount}</div>
                    <div className="stat-label">Total Orders</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{stats.productCount}</div>
                    <div className="stat-label">Products</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">${stats.revenue?.toFixed(0)}</div>
                    <div className="stat-label">Revenue</div>
                  </div>
                </div>
              )}
              <div className="card">
                <h2>Recent Users</h2>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>ID</th><th>Username</th><th>Email</th><th>Role</th></tr>
                    </thead>
                    <tbody>
                      {users.slice(0, 5).map(u => (
                        <tr key={u.id}>
                          <td>{u.id}</td>
                          <td style={{ fontWeight: 500 }}>{u.username}</td>
                          <td>{u.email}</td>
                          <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeSection === 'users' && (
            <div className="card">
              <h2>All Users</h2>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>ID</th><th>Username</th><th>Email</th><th>Role</th></tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td style={{ fontWeight: 500 }}>{u.username}</td>
                        <td>{u.email}</td>
                        <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="card">
              <h2>Security Difficulty</h2>
              <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
                Adjust the difficulty level to control which security mechanisms are active.
              </p>
              <div className="flex gap-8">
                {['easy', 'medium', 'hard'].map(level => (
                  <button
                    key={level}
                    className={`btn ${difficulty === level ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => changeDifficulty(level)}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
              <p className="text-muted mt-12" style={{ fontSize: 12 }}>
                Current: <strong>{difficulty}</strong>
              </p>
            </div>
          )}

          {activeSection === 'webhooks' && (
            <div className="card">
              <h2>Webhook Tester</h2>
              <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
                Test webhook endpoints by sending a request to the specified URL.
              </p>
              <div className="form-group">
                <label>Webhook URL</label>
                <input type="text" value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} placeholder="https://example.com/webhook" />
              </div>
              <button onClick={testWebhook} className="btn btn-primary">Send Test</button>
              {webhookResult && (
                <div className="code-block mt-16">
                  {JSON.stringify(webhookResult, null, 2)}
                </div>
              )}
            </div>
          )}

          {activeSection === 'plugins' && (
            <div className="card">
              <h2>Plugin Manager</h2>
              <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
                Install third-party plugins to extend platform functionality.
              </p>
              <div className="form-group">
                <label>Plugin Name</label>
                <input type="text" value={pluginName} onChange={e => setPluginName(e.target.value)} placeholder="My Plugin" />
              </div>
              <div className="form-group">
                <label>Plugin Source URL</label>
                <input type="text" value={pluginUrl} onChange={e => setPluginUrl(e.target.value)} placeholder="https://cdn.example.com/plugin.js" />
              </div>
              <button onClick={installPlugin} className="btn btn-danger">Install Plugin</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
